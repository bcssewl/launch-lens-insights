
import { useState, useCallback, useRef, useEffect } from 'react';
import { detectAlgeonResearchType, type AlgeonResearchType } from '@/utils/algeonResearchTypes';

// Configuration constants
const STREAMING_TIMEOUT_MS = 300000; // 5 minutes for complex research
const HEARTBEAT_INTERVAL = 30000; // 30 seconds keep-alive
const TYPEWRITER_SPEED = 30; // characters per second

// Enhanced Event types from the Algeon WebSocket - Updated for new format
interface AlegeonStreamingEvent {
  type: string;
  content?: string; // Single character for typewriter effect
  accumulated_content?: string; // Full content so far
  is_complete?: boolean;
  finish_reason?: string | null;
  citations?: Array<{
    name: string;
    url: string;
    type?: string;
  }>;
  usage?: object;
  error?: string | null;
  message?: string; // for error messages
  progress?: {
    current_char: number;
    total_chars: number;
  };
}

export interface AlegeonStreamingState {
  isStreaming: boolean;
  currentText: string;
  rawText: string; // Full text buffer for typewriter
  typewriterText: string; // Text being displayed with typewriter effect
  citations: Array<{
    name: string;
    url: string;
    type?: string;
  }>;
  error: string | null;
  isComplete: boolean;
  // Enhanced fields for better state management
  finalCitations: Array<{
    name: string;
    url: string;
    type?: string;
  }>;
  hasContent: boolean;
  progress: {
    current_char: number;
    total_chars: number;
    percentage: number;
  };
}

export const useAlegeonStreaming = () => {
  const [streamingState, setStreamingState] = useState<AlegeonStreamingState>({
    isStreaming: false,
    currentText: '',
    rawText: '',
    typewriterText: '',
    citations: [],
    error: null,
    isComplete: false,
    finalCitations: [],
    hasContent: false,
    progress: {
      current_char: 0,
      total_chars: 0,
      percentage: 0
    }
  });

  const wsRef = useRef<WebSocket | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const heartbeatRef = useRef<number | null>(null);
  const promiseRef = useRef<{
    resolve: (value: { text: string; citations: Array<{ name: string; url: string; type?: string }> }) => void;
    reject: (reason?: any) => void;
  } | null>(null);
  
  // Use refs to track streaming state without React async issues
  const accumulatedTextRef = useRef<string>('');
  const typewriterIntervalRef = useRef<number | null>(null);
  const messageCountRef = useRef<number>(0);
  const hasResolvedRef = useRef<boolean>(false);

  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up Algeon WebSocket connection');
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    if (typewriterIntervalRef.current) {
      clearInterval(typewriterIntervalRef.current);
      typewriterIntervalRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;
      if (wsRef.current.readyState === WebSocket.OPEN) {
        console.log('🔌 Closing WebSocket connection');
        wsRef.current.close();
      }
      wsRef.current = null;
    }
    
    // Reset refs
    accumulatedTextRef.current = '';
    messageCountRef.current = 0;
    hasResolvedRef.current = false;
    promiseRef.current = null;
  }, []);

  const resetState = useCallback(() => {
    console.log('🔄 Resetting Algeon streaming state');
    setStreamingState({
      isStreaming: false,
      currentText: '',
      rawText: '',
      typewriterText: '',
      citations: [],
      error: null,
      isComplete: false,
      finalCitations: [],
      hasContent: false,
      progress: {
        current_char: 0,
        total_chars: 0,
        percentage: 0
      }
    });
    cleanup();
  }, [cleanup]);

  // Typewriter effect for accumulated content
  const startTypewriter = useCallback((targetText: string) => {
    if (typewriterIntervalRef.current) {
      clearInterval(typewriterIntervalRef.current);
    }

    let currentIndex = 0;
    const charsPerInterval = Math.max(1, Math.round(TYPEWRITER_SPEED / 10)); // 10 intervals per second
    
    typewriterIntervalRef.current = window.setInterval(() => {
      if (currentIndex < targetText.length) {
        const nextIndex = Math.min(currentIndex + charsPerInterval, targetText.length);
        const displayText = targetText.slice(0, nextIndex);
        
        setStreamingState(prev => ({
          ...prev,
          typewriterText: displayText
        }));
        
        currentIndex = nextIndex;
      } else {
        if (typewriterIntervalRef.current) {
          clearInterval(typewriterIntervalRef.current);
          typewriterIntervalRef.current = null;
        }
      }
    }, 100); // 10 times per second for smooth typewriter effect
  }, []);

  const startStreaming = useCallback(async (query: string, researchType?: AlgeonResearchType): Promise<{ text: string; citations: Array<{ name: string; url: string; type?: string }> }> => {
    const detectedType = researchType || detectAlgeonResearchType(query);
    console.log('🚀 Starting Algeon streaming for query:', query.substring(0, 100));
    console.log('📋 Using research type:', detectedType);
    
    resetState();

    return new Promise((resolve, reject) => {
      promiseRef.current = { resolve, reject };
      hasResolvedRef.current = false;
      accumulatedTextRef.current = '';
      messageCountRef.current = 0;

      setStreamingState(prev => ({ 
        ...prev, 
        isStreaming: true,
        isComplete: false,
        error: null,
        hasContent: false
      }));

      // Set overall timeout
      timeoutRef.current = window.setTimeout(() => {
        console.log('⏰ Algeon streaming timeout reached after 5 minutes');
        if (!hasResolvedRef.current) {
          hasResolvedRef.current = true;
          const finalText = accumulatedTextRef.current;
          if (finalText) {
            console.log('⏰ Timeout but have content, resolving with:', finalText.substring(0, 100));
            resolve({ text: finalText, citations: [] });
          } else {
            reject(new Error('Streaming timeout - research taking longer than expected'));
          }
          cleanup();
        }
      }, STREAMING_TIMEOUT_MS);

      try {
        const wsUrl = 'wss://opti-agent3-wrappers.up.railway.app/api/research/stream';
        console.log('🔌 Connecting to Algeon WebSocket:', wsUrl);
        
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log('WebSocket opened successfully');
          
          heartbeatRef.current = window.setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: 'ping' }));
            }
          }, HEARTBEAT_INTERVAL);
          
          const payload = {
            query: query,
            research_type: detectedType,
            scope: "global",
            depth: "executive_summary", 
            urgency: "medium",
            stream: true
          };
          
          console.log('📤 Sending research request:', payload);
          wsRef.current.send(JSON.stringify(payload));
        };

        wsRef.current.onmessage = (event) => {
          console.log('Received WebSocket message:', event.data);
          
          try {
            const data: AlegeonStreamingEvent = JSON.parse(event.data);
            messageCountRef.current += 1;
            
            console.log(`📨 Message #${messageCountRef.current}:`, {
              type: data.type,
              hasContent: !!data.content,
              hasAccumulatedContent: !!data.accumulated_content,
              accumulatedLength: data.accumulated_content?.length || 0,
              isComplete: data.is_complete,
              finishReason: data.finish_reason,
              error: data.error,
              citationsCount: data.citations?.length || 0,
              progress: data.progress
            });

            if (data.type === 'chunk') {
              // Use accumulated_content as source of truth
              if (data.accumulated_content !== undefined) {
                accumulatedTextRef.current = data.accumulated_content;
                
                // Update state with new accumulated content
                setStreamingState(prev => ({
                  ...prev,
                  rawText: data.accumulated_content!,
                  currentText: data.accumulated_content!,
                  hasContent: data.accumulated_content!.length > 0,
                  progress: data.progress ? {
                    current_char: data.progress.current_char,
                    total_chars: data.progress.total_chars,
                    percentage: data.progress.total_chars > 0 
                      ? Math.round((data.progress.current_char / data.progress.total_chars) * 100)
                      : 0
                  } : prev.progress
                }));

                // Start typewriter effect for new content
                if (data.accumulated_content.length > 0) {
                  startTypewriter(data.accumulated_content);
                }
              }
              
              // Handle completion - only when is_complete is true
              if (data.is_complete === true) {
                console.log('✅ Stream completion detected via is_complete flag');
                
                if (typewriterIntervalRef.current) {
                  clearInterval(typewriterIntervalRef.current);
                  typewriterIntervalRef.current = null;
                }
                
                if (!hasResolvedRef.current) {
                  hasResolvedRef.current = true;
                  
                  const finalText = data.accumulated_content || accumulatedTextRef.current;
                  const finalCitations = data.citations || [];
                  
                  setStreamingState(prev => ({
                    ...prev,
                    isStreaming: false,
                    isComplete: true,
                    currentText: finalText,
                    rawText: finalText,
                    typewriterText: finalText,
                    citations: finalCitations,
                    finalCitations: finalCitations,
                    hasContent: true
                  }));
                  
                  console.log('✅ Resolving with final result and citations:', {
                    textLength: finalText.length,
                    citationsCount: finalCitations.length
                  });
                  resolve({ text: finalText, citations: finalCitations });
                  cleanup();
                }
              }
            } else if (data.error) {
              console.error('❌ Stream error received:', data.error);
              if (!hasResolvedRef.current) {
                hasResolvedRef.current = true;
                setStreamingState(prev => ({ 
                  ...prev, 
                  isStreaming: false, 
                  error: data.error || 'An error occurred during research',
                  isComplete: false
                }));
                reject(new Error(data.error || 'Research failed'));
                cleanup();
              }
            }
            
          } catch (parseError) {
            console.error('❌ Error parsing WebSocket message:', parseError, event.data);
          }
        };

        wsRef.current.onerror = (error) => {
          console.log('WebSocket error:', error);
          if (!hasResolvedRef.current) {
            hasResolvedRef.current = true;
            setStreamingState(prev => ({ 
              ...prev, 
              isStreaming: false, 
              error: 'WebSocket connection failed.',
              isComplete: false
            }));
            reject(new Error('WebSocket connection failed'));
            cleanup();
          }
        };

        wsRef.current.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason);
          console.log('Was clean close:', event.wasClean);
          
          setStreamingState(prev => ({ ...prev, isStreaming: false }));
          
          if (!hasResolvedRef.current) {
            hasResolvedRef.current = true;
            const finalText = accumulatedTextRef.current;
            
            if (finalText && finalText.length > 50 && (event.code === 1000 || event.wasClean)) {
              console.log('✅ Normal closure with content, resolving with accumulated text');
              setStreamingState(prev => ({
                ...prev,
                isComplete: true,
                currentText: finalText,
                rawText: finalText,
                typewriterText: finalText,
                hasContent: true
              }));
              resolve({ text: finalText, citations: [] });
            } else if (event.code === 1006) {
              reject(new Error('Connection lost unexpectedly'));
            } else if (!finalText) {
              reject(new Error(`Connection closed without receiving content: ${event.code} ${event.reason || ''}`));
            } else {
              reject(new Error(`WebSocket closed unexpectedly: ${event.code} ${event.reason || 'No reason given'}`));
            }
            
            cleanup();
          }
        };

      } catch (error) {
        console.error('❌ Failed to establish Algeon WebSocket connection:', error);
        if (!hasResolvedRef.current) {
          hasResolvedRef.current = true;
          reject(error);
          cleanup();
        }
      }
    });
  }, [resetState, cleanup, startTypewriter]);

  const stopStreaming = useCallback(() => {
    console.log('🛑 Stopping Algeon streaming by user');
    setStreamingState(prev => ({ ...prev, isStreaming: false, isComplete: false }));
    if (!hasResolvedRef.current && promiseRef.current) {
      hasResolvedRef.current = true;
      promiseRef.current.reject(new Error('Streaming stopped by user.'));
    }
    cleanup();
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, [stopStreaming]);

  return {
    streamingState,
    startStreaming,
    stopStreaming,
    resetState
  };
};
