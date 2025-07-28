/**
 * @file enhancedStreamingHook.ts
 * @description Enhanced streaming hook with robust message handling
 */

import { useState, useCallback, useRef } from 'react';
import { useDeerFlowStore } from '@/stores/deerFlowStore';
import { DeerMessage } from '@/stores/deerFlowMessageStore';
import { mergeMessage, finalizeMessage, StreamEvent } from '@/utils/mergeMessage';
import { useToast } from '@/hooks/use-toast';

interface StreamingState {
  isStreaming: boolean;
  currentMessage: Partial<DeerMessage> | null;
  error: string | null;
  canAbort: boolean;
}

export const useEnhancedStreaming = () => {
  const [streamingState, setStreamingState] = useState<StreamingState>({
    isStreaming: false,
    currentMessage: null,
    error: null,
    canAbort: false
  });

  const {
    addMessage,
    updateMessage,
    existsMessage,
    addMessageWithId,
    settings,
    setIsResponding,
    currentThreadId
  } = useDeerFlowStore();

  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentMessageIdRef = useRef<string | null>(null);

  const startStreaming = useCallback(async (
    endpoint: string,
    requestData: any,
    messageId?: string
  ) => {
    // Clean up any existing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    currentMessageIdRef.current = messageId || crypto.randomUUID();

    setStreamingState({
      isStreaming: true,
      currentMessage: null,
      error: null,
      canAbort: true
    });

    setIsResponding(true);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...requestData,
          thread_id: currentThreadId
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let currentMessage: Partial<DeerMessage> | null = null;
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        // Decode and buffer the chunk
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

          const dataStr = trimmedLine.slice(6); // Remove 'data: '
          if (dataStr === '[DONE]') {
            // Stream completed
            if (currentMessage) {
              const finalMessage = finalizeMessage(currentMessage, currentMessageIdRef.current!);
              
              if (existsMessage(currentMessageIdRef.current!)) {
                updateMessage(currentMessageIdRef.current!, finalMessage);
              } else {
                addMessageWithId(finalMessage);
              }
            }
            break;
          }

          try {
            const event: StreamEvent = JSON.parse(dataStr);
            // console.log('📡 Raw SSE Event:', event); // Debug logging
            currentMessage = mergeMessage(currentMessage, event);

            // Update the streaming state
            setStreamingState(prev => ({
              ...prev,
              currentMessage,
              error: null
            }));

            // Update or add the message in the store
            if (currentMessage && currentMessageIdRef.current) {
              const tempMessage = {
                ...currentMessage,
                id: currentMessageIdRef.current,
                timestamp: new Date(),
                metadata: {
                  ...currentMessage.metadata,
                  threadId: currentThreadId
                }
              } as DeerMessage;

              if (existsMessage(currentMessageIdRef.current)) {
                updateMessage(currentMessageIdRef.current, tempMessage);
              } else {
                addMessageWithId(tempMessage);
              }
            }

            // Handle special events
            if ('event' in event) {
              if (event.event === 'error') {
                throw new Error(event.data.error);
              }

              if (event.event === 'done' || event.event === 'interrupt') {
                break;
              }
            }

          } catch (parseError) {
            console.warn('Failed to parse SSE data:', dataStr, parseError);
          }
        }
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Stream was aborted - this is expected
        setStreamingState(prev => ({
          ...prev,
          isStreaming: false,
          canAbort: false
        }));
      } else {
        // Actual error occurred
        const errorMessage = error.message || 'An unexpected error occurred';
        
        setStreamingState(prev => ({
          ...prev,
          error: errorMessage,
          isStreaming: false,
          canAbort: false
        }));

        toast({
          title: "Streaming Error",
          description: errorMessage,
          variant: "destructive",
        });

        // Add error message to chat
        if (currentMessageIdRef.current) {
          const errorMsg: DeerMessage = {
            id: currentMessageIdRef.current,
            role: 'assistant',
            content: `**Error:** ${errorMessage}`,
            timestamp: new Date(),
            isStreaming: false,
            finishReason: 'interrupt',
            metadata: {
              threadId: currentThreadId
            }
          };

          if (existsMessage(currentMessageIdRef.current)) {
            updateMessage(currentMessageIdRef.current, errorMsg);
          } else {
            addMessageWithId(errorMsg);
          }
        }
      }
    } finally {
      setIsResponding(false);
      setStreamingState(prev => ({
        ...prev,
        isStreaming: false,
        canAbort: false
      }));
      abortControllerRef.current = null;
      currentMessageIdRef.current = null;
    }
  }, [
    addMessage,
    updateMessage,
    existsMessage,
    addMessageWithId,
    setIsResponding,
    currentThreadId,
    toast
  ]);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const resetState = useCallback(() => {
    setStreamingState({
      isStreaming: false,
      currentMessage: null,
      error: null,
      canAbort: false
    });
    currentMessageIdRef.current = null;
  }, []);

  return {
    streamingState,
    startStreaming,
    stopStreaming,
    resetState
  };
};