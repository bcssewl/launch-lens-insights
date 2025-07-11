import React from 'react';
import { AlertCircle, Wifi, RefreshCw } from 'lucide-react';

interface StreamingErrorProps {
  error: string;
  errorCode?: string;
  retryAfter?: number;
  onRetry?: () => void;
  isVisible?: boolean;
}

const StreamingError: React.FC<StreamingErrorProps> = ({
  error,
  errorCode,
  retryAfter,
  onRetry,
  isVisible = true
}) => {
  if (!isVisible) return null;

  const getErrorIcon = () => {
    if (errorCode === 'WEBSOCKET_CONNECTION_FAILED' || errorCode === 'NETWORK_ERROR') {
      return <Wifi className="w-5 h-5 text-red-500" />;
    }
    return <AlertCircle className="w-5 h-5 text-red-500" />;
  };

  const getErrorTitle = () => {
    switch (errorCode) {
      case 'WEBSOCKET_CONNECTION_FAILED':
        return 'Connection Failed';
      case 'NETWORK_ERROR':
        return 'Network Error';
      case 'RATE_LIMITED':
        return 'Rate Limited';
      case 'AGENT_FAILURE':
        return 'Research Agent Error';
      default:
        return 'Research Error';
    }
  };

  const getErrorMessage = () => {
    switch (errorCode) {
      case 'WEBSOCKET_CONNECTION_FAILED':
        return 'Unable to connect to research service. Falling back to standard response.';
      case 'NETWORK_ERROR':
        return 'Network connection issue detected. Please check your internet connection.';
      case 'RATE_LIMITED':
        return `Too many requests. Please wait ${retryAfter || 60} seconds before trying again.`;
      case 'AGENT_FAILURE':
        return 'One or more research agents encountered an error. Continuing with available agents.';
      default:
        return error || 'An unexpected error occurred during research.';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {getErrorIcon()}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {getErrorTitle()}
          </h3>
          <p className="text-sm text-red-700 mt-1">
            {getErrorMessage()}
          </p>
          
          {/* Retry button for certain error types */}
          {onRetry && (errorCode === 'WEBSOCKET_CONNECTION_FAILED' || errorCode === 'NETWORK_ERROR') && (
            <div className="mt-3">
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 border border-red-300 rounded hover:bg-red-200 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Retry Connection
              </button>
            </div>
          )}
          
          {/* Rate limit countdown */}
          {errorCode === 'RATE_LIMITED' && retryAfter && (
            <div className="mt-2">
              <div className="text-xs text-red-600">
                Retry available in: {retryAfter}s
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StreamingError;
