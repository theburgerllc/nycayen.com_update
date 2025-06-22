"use client";

import React, { useState } from 'react';
import { InstagramError as InstagramErrorType } from '../types';
import { 
  AlertTriangle, 
  RefreshCw, 
  Wifi, 
  Clock, 
  Shield, 
  ChevronDown, 
  ChevronUp,
  ExternalLink 
} from 'lucide-react';

interface InstagramErrorProps {
  error: InstagramErrorType;
  onRetry?: () => void;
  showDetails?: boolean;
  className?: string;
}

export function InstagramError({
  error,
  onRetry,
  showDetails = false,
  className = '',
}: InstagramErrorProps) {
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  const getErrorIcon = () => {
    switch (error.type) {
      case 'NETWORK_ERROR':
        return <Wifi className="w-12 h-12 text-red-500" />;
      case 'RATE_LIMIT_ERROR':
        return <Clock className="w-12 h-12 text-orange-500" />;
      case 'API_ERROR':
        return <Shield className="w-12 h-12 text-red-500" />;
      default:
        return <AlertTriangle className="w-12 h-12 text-yellow-500" />;
    }
  };

  const getErrorTitle = () => {
    switch (error.type) {
      case 'NETWORK_ERROR':
        return 'Connection Error';
      case 'RATE_LIMIT_ERROR':
        return 'Rate Limit Exceeded';
      case 'API_ERROR':
        return 'Service Unavailable';
      case 'CACHE_ERROR':
        return 'Cache Error';
      case 'VALIDATION_ERROR':
        return 'Invalid Request';
      default:
        return 'Something Went Wrong';
    }
  };

  const getErrorDescription = () => {
    switch (error.type) {
      case 'NETWORK_ERROR':
        return 'Unable to connect to Instagram. Please check your internet connection and try again.';
      case 'RATE_LIMIT_ERROR':
        return 'We\'ve reached the Instagram API rate limit. Please try again in a few minutes.';
      case 'API_ERROR':
        return 'Instagram service is currently unavailable. We\'re working to restore it.';
      case 'CACHE_ERROR':
        return 'Unable to load cached content. Please refresh the page.';
      case 'VALIDATION_ERROR':
        return 'Invalid request parameters. Please refresh the page.';
      default:
        return 'An unexpected error occurred while loading Instagram content.';
    }
  };

  const getSuggestions = () => {
    switch (error.type) {
      case 'NETWORK_ERROR':
        return [
          'Check your internet connection',
          'Try refreshing the page',
          'Disable any ad blockers or VPN',
        ];
      case 'RATE_LIMIT_ERROR':
        return [
          'Wait a few minutes before trying again',
          'Avoid refreshing too frequently',
          'Try again during off-peak hours',
        ];
      case 'API_ERROR':
        return [
          'Try again in a few minutes',
          'Check Instagram\'s status page',
          'Contact support if the issue persists',
        ];
      default:
        return [
          'Refresh the page',
          'Clear your browser cache',
          'Try again in a few minutes',
        ];
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`instagram-error bg-white rounded-lg border border-gray-200 p-6 text-center ${className}`}>
      {/* Error icon and title */}
      <div className="flex flex-col items-center mb-6">
        {getErrorIcon()}
        <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">
          {getErrorTitle()}
        </h3>
        <p className="text-gray-600 max-w-md">
          {getErrorDescription()}
        </p>
      </div>

      {/* Error message */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-red-800 text-sm font-medium">
          {error.message}
        </p>
        {error.code && (
          <p className="text-red-600 text-xs mt-1">
            Error Code: {error.code}
          </p>
        )}
      </div>

      {/* Suggestions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-blue-900 mb-2">Try these solutions:</h4>
        <ul className="text-sm text-blue-800 text-left space-y-1">
          {getSuggestions().map((suggestion, index) => (
            <li key={index} className="flex items-start">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0" />
              {suggestion}
            </li>
          ))}
        </ul>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center space-x-2 px-6 py-3 bg-[#D4A574] text-white font-medium rounded-lg hover:bg-[#B8956A] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        )}
        
        <a
          href="https://status.instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Check Instagram Status</span>
        </a>
      </div>

      {/* Error details (for debugging) */}
      {showDetails && (
        <div className="border-t border-gray-200 pt-6">
          <button
            onClick={() => setShowErrorDetails(!showErrorDetails)}
            className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 mx-auto"
          >
            <span>Technical Details</span>
            {showErrorDetails ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showErrorDetails && (
            <div className="mt-4 text-left bg-gray-50 rounded-lg p-4">
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Error Type:</span> {error.type}
                </div>
                <div>
                  <span className="font-medium">Error Code:</span> {error.code}
                </div>
                <div>
                  <span className="font-medium">Timestamp:</span> {formatTimestamp(error.timestamp)}
                </div>
                {error.details && (
                  <div>
                    <span className="font-medium">Details:</span>
                    <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-x-auto">
                      {JSON.stringify(error.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Support contact */}
      <div className="text-center text-sm text-gray-500 mt-6">
        <p>
          Need help? Contact our{' '}
          <a
            href="mailto:support@nycayenmoore.com"
            className="text-[#D4A574] hover:text-[#B8956A] font-medium"
          >
            support team
          </a>
        </p>
      </div>
    </div>
  );
}