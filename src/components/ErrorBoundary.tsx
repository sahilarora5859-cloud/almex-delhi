import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Showroom rendering error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0c0b0a] text-[#eae7e1] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md border border-[#3d3832] bg-[#141210] p-8 rounded-sm shadow-2xl">
            <h1 className="font-serif text-3xl font-light tracking-wide text-[#f5f2eb] mb-2 uppercase">
              ALMEX FURNITURE
            </h1>
            <p className="text-xs uppercase tracking-[0.25em] text-[#c89d5c] mb-6">
              Showroom Temporarily Interrupted
            </p>
            <p className="text-sm text-[#a69e90] mb-8 leading-relaxed">
              We encountered an issue displaying the showroom view. Resetting your local session cache will restore full access.
            </p>
            <button
              onClick={this.handleReset}
              className="px-6 py-3 bg-[#c89d5c] text-black font-semibold text-xs uppercase tracking-[0.2em] hover:bg-[#dfb372] transition-colors cursor-pointer"
            >
              Reload Showroom
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
