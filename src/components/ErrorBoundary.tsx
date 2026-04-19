import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: '#f3f4f6',
          }}
        >
          <div
            style={{
              maxWidth: '500px',
              width: '100%',
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                background: '#fee2e2',
                borderRadius: '50%',
                color: '#ef4444',
                marginBottom: '24px',
              }}
            >
              <AlertTriangle size={32} />
            </div>

            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
              Oops! Something went wrong
            </h1>

            <p style={{ color: '#6b7280', marginBottom: '24px', lineHeight: '1.5' }}>
              We apologize for the inconvenience. An unexpected error occurred in the application.
            </p>

            {this.state.error && (
              <div style={{ 
                background: 'rgba(239, 68, 68, 0.05)', 
                color: '#ef4444', 
                padding: '16px', 
                borderRadius: '8px', 
                fontSize: '0.85rem', 
                fontFamily: 'monospace',
                marginBottom: '24px',
                textAlign: 'left',
                overflowX: 'auto',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}>
                <div style={{ fontWeight: 800, marginBottom: '4px' }}>Error Details:</div>
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              <RefreshCw size={18} />
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
