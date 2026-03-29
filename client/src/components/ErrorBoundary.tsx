import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('[CRASH LOG] Tool Error Boundary caught:', {
      message: error.message,
      stack: error.stack,
      componentStack: info?.componentStack,
      timestamp: new Date().toISOString()
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-exclamation-triangle text-2xl text-destructive"></i>
            </div>
            <h2 className="text-xl font-bold mb-2">Tool Temporarily Unavailable</h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              This tool encountered an error. Your other tools and data are unaffected.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => this.setState({ hasError: false })}
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                <i className="fas fa-redo text-xs"></i>
                Try Again
              </button>
              <a
                href="/"
                onClick={() => this.setState({ hasError: false })}
                className="inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-secondary/80 transition-colors"
              >
                <i className="fas fa-home text-xs"></i>
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function PageSuspenseFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
