/**
 * @file EnhancedDeerFlowPage.tsx
 * @description Enhanced DeerFlow page with Phase 3 features
 */

import React from 'react';
import { useLiveActivityTracker } from '@/hooks/useLiveActivityTracker';
import { StreamingActivityIndicator } from './StreamingActivityIndicator';
import { ErrorRecoveryPanel } from './ErrorRecoveryPanel';
import { motion, AnimatePresence } from 'motion/react';

interface EnhancedDeerFlowPageProps {
  children: React.ReactNode;
  isStreaming?: boolean;
}

export const EnhancedDeerFlowPage: React.FC<EnhancedDeerFlowPageProps> = ({
  children,
  isStreaming = false
}) => {
  const {
    activities,
    currentActivity,
    errors,
    dismissError,
    updateError
  } = useLiveActivityTracker();

  const handleRetry = (errorId: string) => {
    const error = errors.find(e => e.id === errorId);
    if (error) {
      const newRetryCount = (error.retryCount || 0) + 1;
      updateError(errorId, { retryCount: newRetryCount });
      
      // Implement retry logic here
      console.log(`Retrying operation for error ${errorId}, attempt ${newRetryCount}`);
    }
  };

  const handleResume = (errorId: string) => {
    const error = errors.find(e => e.id === errorId);
    if (error?.context?.lastSuccessfulStep) {
      console.log(`Resuming from step: ${error.context.lastSuccessfulStep}`);
      dismissError(errorId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Live Activity Indicator */}
      {(activities.length > 0 || isStreaming) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <StreamingActivityIndicator
            activities={activities}
            isStreaming={isStreaming}
            currentActivity={currentActivity}
          />
        </motion.div>
      )}

      {/* Error Recovery Panels */}
      <AnimatePresence mode="popLayout">
        {errors.map((error) => (
          <ErrorRecoveryPanel
            key={error.id}
            error={error}
            onRetry={() => handleRetry(error.id)}
            onResume={() => handleResume(error.id)}
            onDismiss={() => dismissError(error.id)}
          />
        ))}
      </AnimatePresence>

      {/* Main Content */}
      {children}
    </div>
  );
};