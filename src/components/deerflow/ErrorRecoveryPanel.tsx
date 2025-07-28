/**
 * @file ErrorRecoveryPanel.tsx
 * @description Enhanced error handling with retry mechanisms and recovery options
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  AlertTriangle, 
  RefreshCw, 
  Play, 
  ChevronDown, 
  ChevronRight,
  Clock,
  Wifi,
  Server,
  Code,
  HelpCircle
} from 'lucide-react';

interface ErrorInfo {
  id: string;
  type: 'network' | 'server' | 'timeout' | 'validation' | 'unknown';
  message: string;
  timestamp: Date;
  isRecoverable: boolean;
  retryCount?: number;
  maxRetries?: number;
  context?: {
    operation?: string;
    toolCall?: string;
    lastSuccessfulStep?: string;
  };
}

interface ErrorRecoveryPanelProps {
  error: ErrorInfo;
  onRetry?: () => void;
  onResume?: () => void;
  onDismiss?: () => void;
  isRetrying?: boolean;
}

const getErrorIcon = (type: string) => {
  switch (type) {
    case 'network': return Wifi;
    case 'server': return Server;
    case 'timeout': return Clock;
    case 'validation': return Code;
    default: return HelpCircle;
  }
};

const getErrorSeverity = (type: string) => {
  switch (type) {
    case 'network':
    case 'timeout':
      return { level: 'warning', color: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' };
    case 'server':
    case 'validation':
      return { level: 'error', color: 'border-red-500 bg-red-50 dark:bg-red-950/20' };
    default:
      return { level: 'info', color: 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' };
  }
};

const getRecoveryOptions = (type: string, context?: any) => {
  switch (type) {
    case 'network':
      return {
        primary: 'Retry Connection',
        secondary: 'Check Network',
        description: 'Network connection lost. This usually resolves automatically.'
      };
    case 'timeout':
      return {
        primary: 'Retry Request',
        secondary: 'Resume from Last Step',
        description: 'Operation timed out. You can retry or resume from the last successful step.'
      };
    case 'server':
      return {
        primary: 'Retry Request',
        secondary: 'Report Issue',
        description: 'Server encountered an error. This may be temporary.'
      };
    case 'validation':
      return {
        primary: 'Fix and Retry',
        secondary: 'Skip Step',
        description: 'Input validation failed. Please review your request.'
      };
    default:
      return {
        primary: 'Retry Operation',
        secondary: 'Start Over',
        description: 'An unexpected error occurred. Retrying may resolve the issue.'
      };
  }
};

export const ErrorRecoveryPanel: React.FC<ErrorRecoveryPanelProps> = ({
  error,
  onRetry,
  onResume,
  onDismiss,
  isRetrying = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const ErrorIcon = getErrorIcon(error.type);
  const severity = getErrorSeverity(error.type);
  const recoveryOptions = getRecoveryOptions(error.type, error.context);
  
  const canRetry = error.isRecoverable && (error.retryCount || 0) < (error.maxRetries || 3);
  const hasContext = error.context && Object.keys(error.context).length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`p-4 border-2 ${severity.color}`}>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <ErrorIcon className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="text-xs">
                  {error.type.charAt(0).toUpperCase() + error.type.slice(1)} Error
                </Badge>
                {error.retryCount && error.retryCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    Retry {error.retryCount}/{error.maxRetries || 3}
                  </Badge>
                )}
              </div>
              
              <div>
                <p className="text-sm font-medium text-foreground">
                  {error.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {recoveryOptions.description}
                </p>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground">
              {error.timestamp.toLocaleTimeString()}
            </div>
          </div>

          {/* Context Information */}
          {hasContext && (
            <Collapsible open={showDetails} onOpenChange={setShowDetails}>
              <CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
                {showDetails ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                Error Details
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="bg-background/50 rounded p-2 space-y-1 text-xs">
                  {error.context?.operation && (
                    <div><span className="font-medium">Operation:</span> {error.context.operation}</div>
                  )}
                  {error.context?.toolCall && (
                    <div><span className="font-medium">Tool:</span> {error.context.toolCall}</div>
                  )}
                  {error.context?.lastSuccessfulStep && (
                    <div><span className="font-medium">Last Success:</span> {error.context.lastSuccessfulStep}</div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Recovery Actions */}
          <div className="flex flex-wrap gap-2">
            {canRetry && onRetry && (
              <Button
                size="sm"
                onClick={onRetry}
                disabled={isRetrying}
                className="text-xs"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    {recoveryOptions.primary}
                  </>
                )}
              </Button>
            )}
            
            {error.context?.lastSuccessfulStep && onResume && (
              <Button
                size="sm"
                variant="outline"
                onClick={onResume}
                disabled={isRetrying}
                className="text-xs"
              >
                <Play className="h-3 w-3 mr-1" />
                {recoveryOptions.secondary}
              </Button>
            )}
            
            {onDismiss && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onDismiss}
                className="text-xs"
              >
                Dismiss
              </Button>
            )}
          </div>

          {/* Retry Exhausted Warning */}
          {!canRetry && error.isRecoverable && (
            <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Maximum retry attempts reached. You can start a new request or contact support if the issue persists.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </Card>
    </motion.div>
  );
};