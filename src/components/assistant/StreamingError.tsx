
import React from 'react';
import { AlertCircle, Wifi, RefreshCw, Clock, AlertTriangle } from 'lucide-react';

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
    switch (errorCode) {
      case 'WEBSOCKET_CONNECTION_FAILED':
      case 'NETWORK_ERROR':
        return <Wifi className="w-5 h-5 text-red-500" />;
      case 'RATE_LIMITED':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'NO_RESPONSE':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
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
      case 'NO_RESPONSE':
        return 'No Response';
      case 'CONNECTION_LOST':
        return 'Connection Lost';
      case 'TIMEOUT':
        return 'Request Timeout';
      default:
        return 'Research Error';
    }
  };

  const getErrorMessage = () => {
    switch (errorCode) {
      case 'WEBSOCKET_CONNECTION_FAILED':
        return 'Unable to connect to research service. Please check your internet connection and try again.';
      case 'NETWORK_ERROR':
        return 'Network connection issue detected. Please check your internet connection.';
      case 'RATE_LIMITED':
        return `Too many requests. Please wait ${retryAfter || 60} seconds before trying again.`;
      case 'AGENT_FAILURE':
        return 'One or more research agents encountered an error. Continuing with available agents.';
      case 'NO_RESPONSE':
        return 'The research service is not responding. It may be temporarily unavailable.';
      case 'CONNECTION_LOST':
        return 'Connection to the research service was lost unexpectedly. Please try again.';
      case 'TIMEOUT':
        return 'The research request took longer than expected. You can try again or use a different approach.';
      default:
        return error || 'An unexpected error occurred during research.';
    }
  };

  const getErrorSeverity = () => {
    switch (errorCode) {
      case 'RATE_LIMITED':
        return 'warning';
      case 'NO_RESPONSE':
      case 'TIMEOUT':
        return 'caution';
      default:
        return 'error';
    }
  };

  const severity = getErrorSeverity();
  const bgColor = severity === 'error' ? 'bg-red-50' : severity === 'warning' ? 'bg-orange-50' : 'bg-yellow-50';
  const borderColor = severity === 'error' ? 'border-red-200' : severity === 'warning' ? 'border-orange-200' : 'border-yellow-200';
  const textColor = severity === 'error' ? 'text-red-800' : severity === 'warning' ? 'text-orange-800' : 'text-yellow-800';
  const descColor = severity === 'error' ? 'text-red-700' : severity === 'warning' ? 'text-orange-700' : 'text-yellow-700';

  return (
    <div className={`w-full max-w-3xl mx-auto ${bgColor} border ${borderColor} rounded-lg p-4 mb-4`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {getErrorIcon()}
        </div>
        <div className="flex-1">
          <h3 className={`text-sm font-medium ${textColor}`}>
            {getErrorTitle()}
          </h3>
          <p className={`text-sm ${descColor} mt-1`}>
            {getErrorMessage()}
          </p>
          
          {/* Retry button for recoverable errors */}
          {onRetry && (errorCode === 'WEBSOCKET_CONNECTION_FAILED' || errorCode === 'NETWORK_ERROR' || errorCode === 'NO_RESPONSE' || errorCode === 'CONNECTION_LOST') && (
            <div className="mt-3">
              <button
                onClick={onRetry}
                className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium ${textColor} ${bgColor} border ${borderColor} rounded hover:opacity-80 transition-opacity`}
              >
                <RefreshCw className="w-3 h-3" />
                Retry Connection
              </button>
            </div>
          )}
          
          {/* Rate limit countdown */}
          {errorCode === 'RATE_LIMITED' && retryAfter && (
            <div className="mt-2">
              <div className={`text-xs ${descColor}`}>
                Retry available in: {retryAfter}s
              </div>
            </div>
          )}

          {/* Troubleshooting tips */}
          {(errorCode === 'NO_RESPONSE' || errorCode === 'CONNECTION_LOST' || errorCode === 'TIMEOUT') && (
            <div className="mt-2">
              <div className={`text-xs ${descColor}`}>
                💡 Try refreshing the page or using a simpler query
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StreamingError;
