# Setup Guide

Complete guide to setting up the Classes Management System for local development.

---

## Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| [Python](https://python.org/downloads/) | 3.11+ | Backend runtime |
| [Node.js](https://nodejs.org/) | 18+ | Frontend runtime |
| npm | 9+ | Package manager (bundled with Node.js) |
| Git | Latest | Version control |

---

## Quick Start (Recommended)

The `run.py` script automates the entire setup process:

```bash
python run.py
```

This single command will:

1. ✅ Detect and use the backend virtual environment (or fall back to system Python)
2. ✅ Run database migrations (`python manage.py migrate --noinput`)
3. ✅ Initialize default data (`python manage.py initialize_system`)
4. ✅ Start the Django backend on **http://localhost:8000**
5. ✅ Start the React frontend on **http://localhost:3001**

Press `Ctrl+C` to stop both servers.

---

## Manual Setup

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate        # Windows (PowerShell)
venv\Scripts\activate.bat    # Windows (CMD)
source venv/bin/activate     # macOS / Linux

# Install Python dependencies
pip install -r requirements.txt

# Create environment file
copy .env.example .env       # Windows
cp .env.example .env         # macOS / Linux
```

Edit `backend/.env` and configure:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

> **Tip:** Generate a Django secret key with:
> ```bash
> python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
> ```

```bash
# Run database migrations
python manage.py migrate

# Initialize the system (creates default admin user and seed data)
python manage.py initialize_system

# Start the backend server
python manage.py runserver
```

The API will be available at **http://localhost:8000**.

### 2. Frontend Setup

```bash
# From the project root directory
cd ..

# Install Node.js dependencies
npm install

# Create environment file (optional — defaults work for local dev)
copy .env.example .env.local   # Windows
cp .env.example .env.local     # macOS / Linux
```

The default frontend environment configuration:

```env
REACT_APP_API_URL=http://localhost:8000/api
```

```bash
# Start the frontend development server
npm start
```

The app will be available at **http://localhost:3001**.

---

## Default Credentials

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `admin` |
| Role | Owner (full access) |

> ⚠️ **Security:** Change the default password immediately in production.

---

## Environment Configuration

### Frontend (`/.env.local`)

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_API_URL` | `http://localhost:8000/api` | Backend API base URL |

### Backend (`/backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | — | Django secret key (required) |
| `DEBUG` | `True` | Enable debug mode |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1` | Permitted hostnames |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:3001` | Frontend origins for CORS |
| `DATABASE_URL` | `sqlite:///db.sqlite3` | Database connection string |

### Switching to Production

1. Update `backend/.env`:
   ```env
   DEBUG=False
   ALLOWED_HOSTS=your-domain.com
   CORS_ALLOWED_ORIGINS=https://your-domain.com
   SECRET_KEY=<strong-random-key>
   ```

2. Update `.env.local`:
   ```env
   REACT_APP_API_URL=https://your-domain.com/api
   ```

3. Restart both servers.

---

## API Documentation

When the backend is running, interactive API documentation is available at:

- **Swagger UI:** http://localhost:8000/api/docs/
- **ReDoc:** http://localhost:8000/api/redoc/
- **OpenAPI Schema:** http://localhost:8000/api/schema/

See [API Reference](api-reference.md) for the full endpoint documentation.

---

## Troubleshooting

### CORS Errors

Ensure `CORS_ALLOWED_ORIGINS` in `backend/.env` includes your frontend URL:
```env
CORS_ALLOWED_ORIGINS=http://localhost:3001
```

### Port Already in Use

```bash
# Use a different backend port
python manage.py runserver 8001

# Use a different frontend port
PORT=3002 npm start
```

### Virtual Environment Activation Error (Windows)

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Database Errors

```bash
cd backend
python manage.py migrate --run-syncdb
```

### Backend Health Check

Verify the backend is running:
```
GET http://localhost:8000/api/auth/health/
```
