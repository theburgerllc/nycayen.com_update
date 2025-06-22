"use client";
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Booking flow error:', error, errorInfo);
    
    // Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false,
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-stone-900">
          <div className="max-w-md mx-auto text-center p-8">
            <div className="glass rounded-xl p-8">
              <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h2 className="text-2xl font-playfair text-white mb-4">
                Something went wrong
              </h2>
              <p className="text-gray-300 mb-6">
                We encountered an error while processing your booking. Please try again or contact us for assistance.
              </p>
              <div className="space-y-4">
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-white font-medium py-3 px-6 rounded-full transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={20} />
                  Try Again
                </button>
                <a
                  href="/contact"
                  className="block w-full text-amber-400 hover:text-amber-300 font-medium py-3 px-6 border border-amber-400 rounded-full transition-colors"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}