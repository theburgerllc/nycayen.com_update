"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { InstagramErrorBoundaryState, InstagramError as InstagramErrorType } from '../types';
import { InstagramError } from './InstagramError';
import { trackInstagramEngagement } from '../lib/analytics';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  className?: string;
}

export class InstagramErrorBoundary extends Component<Props, InstagramErrorBoundaryState> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): InstagramErrorBoundaryState {
    // Convert generic error to Instagram error
    const instagramError: InstagramErrorType = {
      code: 'COMPONENT_ERROR',
      message: error.message || 'A component error occurred',
      type: 'VALIDATION_ERROR',
      details: {
        name: error.name,
        stack: error.stack,
      },
      timestamp: new Date(),
    };

    return {
      hasError: true,
      error: instagramError,
      errorInfo: error.stack,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Instagram Error Boundary caught an error:', error, errorInfo);
    }

    // Track error in analytics
    trackInstagramEngagement({
      type: 'click',
      mediaId: 'error_boundary',
      mediaType: 'IMAGE', // Placeholder
      timestamp: new Date(),
      customProperties: {
        event_category: 'error',
        error_type: 'component_error',
        error_message: error.message,
        error_stack: error.stack?.substring(0, 500), // Truncate stack trace
        component_stack: errorInfo.componentStack?.substring(0, 500),
      },
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Report to error reporting service (e.g., Sentry)
    this.reportError(error, errorInfo);
  }

  private reportError(error: Error, errorInfo: ErrorInfo) {
    // In production, integrate with error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
      
      // For now, log to a custom endpoint
      fetch('/api/errors/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: {
            message: error.message,
            name: error.name,
            stack: error.stack,
          },
          errorInfo,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
          component: 'InstagramFeed',
        }),
      }).catch((reportingError) => {
        console.error('Failed to report error:', reportingError);
      });
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className={this.props.className}>
          <InstagramError
            error={this.state.error!}
            onRetry={this.handleRetry}
            showDetails={process.env.NODE_ENV === 'development'}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC wrapper for functional components
export function withInstagramErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const ComponentWithErrorBoundary = (props: P) => (
    <InstagramErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </InstagramErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = 
    `withInstagramErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return ComponentWithErrorBoundary;
}

// Hook for error reporting in functional components
export function useInstagramErrorReporting() {
  const reportError = React.useCallback((error: Error, context?: Record<string, any>) => {
    // Track in analytics
    trackInstagramEngagement({
      type: 'click',
      mediaId: 'manual_error_report',
      mediaType: 'IMAGE', // Placeholder
      timestamp: new Date(),
      customProperties: {
        event_category: 'error',
        error_type: 'manual_report',
        error_message: error.message,
        error_name: error.name,
        context: JSON.stringify(context),
      },
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Manual error report:', error, context);
    }

    // Report to error service
    fetch('/api/errors/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: {
          message: error.message,
          name: error.name,
          stack: error.stack,
        },
        context,
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
        url: typeof window !== 'undefined' ? window.location.href : '',
        timestamp: new Date().toISOString(),
        component: 'Instagram',
        reportType: 'manual',
      }),
    }).catch((reportingError) => {
      console.error('Failed to report error:', reportingError);
    });
  }, []);

  return { reportError };
}