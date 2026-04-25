import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="animate-fade-in" style={{ padding: '2rem' }}>
          <div
            className="glass-card text-center py-5 px-4"
            style={{ maxWidth: 480, margin: '0 auto' }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h3 className="fw-bold mb-2">Something went wrong</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              This page encountered an error. Your data is safe — only this section is affected.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details
                className="mb-3 text-start"
                style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--surface-elevated)', padding: '0.75rem', borderRadius: '0.5rem' }}
              >
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Error details</summary>
                <pre style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <button
              className="btn btn-premium px-5 py-2"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
