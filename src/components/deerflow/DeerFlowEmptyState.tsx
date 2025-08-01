import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { InputBox } from './InputBox';
import { useGreeting } from '@/hooks/useGreeting';
import { getConsultingPlaceholder } from '@/lib/geolocation';

interface DeerFlowEmptyStateProps {
  onSendMessage: (message: string, options?: { interruptFeedback?: string }) => void;
  onStartChat?: () => void;
}

const DeerFlowEmptyState: React.FC<DeerFlowEmptyStateProps> = ({ 
  onSendMessage, 
  onStartChat 
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasUserInput, setHasUserInput] = useState(false);
  const { primaryGreeting, assistanceMessage, isLoading: greetingLoading, userCountry } = useGreeting();
  
  // Placeholder rotation state
  const [placeholderText, setPlaceholderText] = useState<string>('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate new placeholder text
  const generatePlaceholder = useCallback(() => {
    const placeholder = getConsultingPlaceholder(userCountry || 'United States');
    console.log('Generated placeholder:', placeholder);
    return placeholder;
  }, [userCountry]);

  // Clear existing timer
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Start rotation timer only if user hasn't started typing
  const startRotationTimer = useCallback(() => {
    if (hasUserInput) return; // Don't start timer if user has input
    
    clearTimer();
    timerRef.current = setInterval(() => {
      setPlaceholderText(generatePlaceholder());
    }, 12000); // 12 seconds
  }, [clearTimer, generatePlaceholder, hasUserInput]);

  // Stop placeholder rotation when user starts typing
  const handleUserInput = useCallback(() => {
    if (!hasUserInput) {
      setHasUserInput(true);
      clearTimer(); // Stop the rotation immediately
    }
  }, [hasUserInput, clearTimer]);

  // Initialize placeholder and start rotation timer
  useEffect(() => {
    console.log('useEffect triggered, userCountry:', userCountry);
    // Set initial placeholder immediately
    const initialPlaceholder = generatePlaceholder();
    setPlaceholderText(initialPlaceholder);
    
    // Start rotation timer only if user hasn't typed
    if (!hasUserInput) {
      startRotationTimer();
    }

    // Cleanup on unmount
    return () => {
      clearTimer();
    };
  }, [userCountry, generatePlaceholder, startRotationTimer, clearTimer, hasUserInput]);

  const handleSendMessage = (message: string, options?: { interruptFeedback?: string }) => {
    if (onStartChat) {
      onStartChat();
    }
    setIsTransitioning(true);
    onSendMessage(message, options);
  };

  return (
    <>
      {/* Content Container - Perfectly centered */}
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-3xl mx-auto px-6 py-12 text-center bg-transparent relative z-10">
        {/* Greeting Section - Perfectly centered */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: isTransitioning ? 0 : 1, 
            y: isTransitioning ? -50 : 0 
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mb-12 flex flex-col items-center"
        >
          {!greetingLoading && (
            <>
              <h1 className="text-4xl font-light text-foreground tracking-tight mb-2 text-center">
                {primaryGreeting}
              </h1>
              <h2 className="text-lg font-normal text-muted-foreground mt-2 text-center">
                {assistanceMessage}
              </h2>
            </>
          )}
        </motion.div>

        {/* Input Box Section - Wider and thinner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: isTransitioning ? 0 : 1, 
            y: isTransitioning ? 100 : 0 
          }}
          transition={{ duration: 0.3, ease: "easeOut", delay: isTransitioning ? 0 : 0.1 }}
          className="w-full max-w-4xl flex justify-center"
        >
          <InputBox 
            onSend={handleSendMessage}
            className="w-full"
            size="large"
            dynamicPlaceholder={placeholderText || "Ask anything..."}
            onUserInput={handleUserInput}
          />
        </motion.div>
      </div>
    </>
  );
};

export default DeerFlowEmptyState;
