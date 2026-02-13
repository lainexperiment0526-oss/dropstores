import { Component, ReactNode } from 'react';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export default class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
    errorMessage: ''
  };

  static getDerivedStateFromError(error: unknown): AppErrorBoundaryState {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { hasError: true, errorMessage: message };
  }

  componentDidCatch(error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('App crashed:', message);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-xl border border-border bg-card p-6 text-center space-y-3">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            The app failed to load. If you are using Pi Browser on a Vercel domain, please try again after a refresh.
          </p>
          {this.state.errorMessage && (
            <p className="text-xs text-destructive break-words">{this.state.errorMessage}</p>
          )}
          <button
            className="w-full rounded-md bg-primary text-primary-foreground py-2 text-sm font-medium"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
