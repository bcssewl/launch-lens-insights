/**
 * @file useEnhancedDeerStreaming.ts  
 * @description Simplified streaming hook that uses the exact DeerFlow sendMessage implementation
 */

import { useState, useCallback, useRef } from 'react';
import { useDeerFlowMessageStore } from '@/stores/deerFlowMessageStore';
import { sendMessage } from '@/utils/sendMessage';
import { useToast } from '@/hooks/use-toast';

// Simplified interfaces to match the exact DeerFlow behavior
interface DeerStreamingOptions {
  interruptFeedback?: string;
  resources?: Array<{
    id: string;
    type: string;
    content: string;
  }>;
}

interface ConnectionStatus {
  connected: boolean;
  error?: string;
}

export const useEnhancedDeerStreaming = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [eventCount, setEventCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: true
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();
  const { isResponding } = useDeerFlowMessageStore();

  /**
   * Main streaming function that wraps the exact DeerFlow sendMessage
   */
  const startDeerFlowStreaming = useCallback(async (
    question: string,
    options: DeerStreamingOptions = {}
  ) => {
    console.log('🌊 startDeerFlowStreaming called:', { question, options });
    
    // Prevent multiple concurrent streams
    if (isStreaming || isResponding) {
      console.warn('🚫 Streaming already in progress, ignoring request');
      return;
    }

    // Create abort controller for this stream
    abortControllerRef.current = new AbortController();
    
    try {
      setIsStreaming(true);
      setEventCount(0);
      setConnectionStatus({ connected: true });

      // Use the exact DeerFlow sendMessage function
      await sendMessage(
        question,
        {
          interruptFeedback: options.interruptFeedback,
          resources: options.resources
        },
        {
          abortSignal: abortControllerRef.current.signal
        }
      );

      console.log('✅ DeerFlow streaming completed successfully');
      
    } catch (error: any) {
      console.error('❌ DeerFlow streaming error:', error);
      
      // Don't show error toast for aborted requests
      if (error.name !== 'AbortError') {
        setConnectionStatus({ 
          connected: false, 
          error: error.message || 'Streaming failed' 
        });
        
        toast({
          title: "Streaming Error",
          description: error.message || "Failed to complete the request. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [isStreaming, isResponding, toast]);

  /**
   * Stop streaming function
   */
  const stopStreaming = useCallback(() => {
    console.log('🛑 Stopping DeerFlow streaming');
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setIsStreaming(false);
    
    // Clear responding state in store
    const { setIsResponding } = useDeerFlowMessageStore.getState();
    setIsResponding(false);
    
    toast({
      title: "Streaming Stopped",
      description: "The request has been cancelled.",
    });
  }, [toast]);

  /**
   * Cleanup function
   */
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setEventCount(0);
    setConnectionStatus({ connected: true });
  }, []);

  return {
    startDeerFlowStreaming,
    stopStreaming,
    cleanup,
    isStreaming: isStreaming || isResponding, // Include store responding state
    eventCount,
    connectionStatus
  };
};