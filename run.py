#!/usr/bin/env python3
"""
Development server script to run both Django backend and React frontend simultaneously.
Usage: python run.py
"""

import subprocess
import sys
import os
import time
import threading

def is_valid_python_executable(python_exe):
    try:
        result = subprocess.run(
            [python_exe, '-c', 'import sys'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=5
        )
        return result.returncode == 0
    except Exception:
        return False


def run_backend_setup(backend_path, python_exe):
    """Run backend setup steps automatically before starting the server."""
    env = os.environ.copy()
    env['PYTHONUNBUFFERED'] = '1'

    commands = [
        [python_exe, 'manage.py', 'migrate', '--noinput'],
        [python_exe, 'manage.py', 'initialize_system'],
    ]

    for cmd in commands:
        print(f"🔧 Running backend command: {' '.join(cmd)}")
        result = subprocess.run(
            cmd,
            cwd=backend_path,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            env=env,
        )
        if result.stdout:
            print(result.stdout.strip())
        if result.stderr:
            print(result.stderr.strip())
        if result.returncode != 0:
            print(f"❌ Backend setup command failed: {' '.join(cmd)}")
            return False

    return True


def start_backend():
    """Start Django development server"""
    print("🚀 Starting Django backend server...")
    backend_path = os.path.join(os.path.dirname(__file__), 'backend')
    venv_python = os.path.join(backend_path, 'venv', 'Scripts', 'python.exe')
    
    python_exe = venv_python if os.path.exists(venv_python) else sys.executable
    if python_exe == venv_python and not is_valid_python_executable(python_exe):
        print(f"⚠️  Backend venv python at {python_exe} is not valid; falling back to system Python")
        python_exe = sys.executable

    if not run_backend_setup(backend_path, python_exe):
        return None
    
    try:
        env = os.environ.copy()
        env['PYTHONUNBUFFERED'] = '1'
        process = subprocess.Popen(
            [python_exe, 'manage.py', 'runserver'],
            cwd=backend_path,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True,
            bufsize=1,
            env=env
        )
        return process
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
        return None


def start_frontend():
    """Start React development server"""
    print("🚀 Starting React frontend server...")
    
    root_path = os.path.dirname(__file__)
    
    try:
        # Set BROWSER=none to prevent auto-opening browser
        env = os.environ.copy()
        env['BROWSER'] = 'none'
        env['PORT'] = '3001'
        
        # Use shell=True on Windows to find npm in PATH properly
        process = subprocess.Popen(
            'npm start',
            cwd=root_path,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True,
            bufsize=1,
            env=env,
            shell=True
        )
        return process
    except Exception as e:
        print(f"❌ Error starting frontend: {e}")
        return None


def monitor_stream(process, name, stream):
    """Monitor and print one process stream in a separate thread"""
    try:
        for line in iter(stream.readline, ''):
            if line:
                print(f"[{name}] {line.rstrip()}")
    except:
        pass


def main():
    """Main function to start both servers"""
    print("=" * 60)
    print("🎯 Eklavya App - Development Server")
    print("=" * 60)
    print()
    
    backend_process = None
    frontend_process = None
    
    try:
        # Start backend
        backend_process = start_backend()
        if not backend_process:
            sys.exit(1)
        
        # Start monitoring backend output
        backend_stdout_thread = threading.Thread(
            target=monitor_stream,
            args=(backend_process, "Django", backend_process.stdout),
            daemon=True
        )
        backend_stderr_thread = threading.Thread(
            target=monitor_stream,
            args=(backend_process, "Django-ERR", backend_process.stderr),
            daemon=True
        )
        backend_stdout_thread.start()
        backend_stderr_thread.start()
        
        # Give backend a moment to start
        time.sleep(2)
        
        # Start frontend
        frontend_process = start_frontend()
        if not frontend_process:
            if backend_process:
                backend_process.terminate()
            sys.exit(1)
        
        # Start monitoring frontend output
        frontend_stdout_thread = threading.Thread(
            target=monitor_stream,
            args=(frontend_process, "React", frontend_process.stdout),
            daemon=True
        )
        frontend_stderr_thread = threading.Thread(
            target=monitor_stream,
            args=(frontend_process, "React-ERR", frontend_process.stderr),
            daemon=True
        )
        frontend_stdout_thread.start()
        frontend_stderr_thread.start()
        
        print()
        print("=" * 60)
        print("✅ Both servers started successfully!")
        print("=" * 60)
        print()
        print("📡 Backend:  http://localhost:8000")
        print("🌐 Frontend: http://localhost:3001")
        print()
        print("Testing backend connection...")
        time.sleep(2)
        
        try:
            import urllib.request
            import urllib.error
            try:
                response = urllib.request.urlopen('http://localhost:8000/', timeout=5)
                print("✅ Backend is responding correctly")
            except urllib.error.HTTPError as e:
                if e.code == 404:
                    print("✅ Backend is responding correctly (404 Not Found, but server is up)")
                else:
                    raise
        except Exception as e:
            print(f"⚠️  Backend connection issue: {e}")
        
        print()
        print("Press Ctrl+C to stop both servers")
        print()
        
        # Monitor both processes
        while True:
            if backend_process and backend_process.poll() is not None:
                print("⚠️  Backend server stopped unexpectedly")
                backend_process = None
            
            if frontend_process and frontend_process.poll() is not None:
                print("⚠️  Frontend server stopped unexpectedly")
                frontend_process = None
            
            time.sleep(1)
            
    except KeyboardInterrupt:
        print()
        print()
        print("🛑 Shutting down servers...")
        
        if backend_process:
            backend_process.terminate()
            try:
                backend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                backend_process.kill()
        
        if frontend_process:
            frontend_process.terminate()
            try:
                frontend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                frontend_process.kill()
        
        print("✅ Servers stopped")
        sys.exit(0)
    
    except Exception as e:
        print(f"❌ Error: {e}")
        
        # Cleanup
        if backend_process:
            backend_process.terminate()
        if frontend_process:
            frontend_process.terminate()
        
        sys.exit(1)


if __name__ == '__main__':
    main()
