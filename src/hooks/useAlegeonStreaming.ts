
import { useState, useCallback, useRef, useEffect } from 'react';
import { detectAlgeonResearchType, type AlgeonResearchType } from '@/utils/algeonResearchTypes';
import { useReasoning } from '@/contexts/ReasoningContext';
import { useAlegeonTypewriter } from './useAlegeonTypewriter';

// Configuration constants - Updated to 12 minutes
const STREAMING_TIMEOUT_MS = 720000; // 12 minutes
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

interface AlegeonStreamingEvent {
  type: string;
  content?: string;
  accumulated_content?: string;
  is_complete?: boolean;
  finish_reason?: string | null;
  citations?: Array<{
    name: string;
    url: string;
    type?: string;
  }>;
  sources?: Array<{
    name: string;
    url: string;
    type?: string;
  }>;
  usage?: object;
  error?: string | null;
  message?: string;
  progress?: {
    chunk_number: number;
    characters_sent: number;
  };
}

export interface AlegeonStreamingState {
  isStreaming: boolean;
  displayedText: string;
  bufferedText: string;
  citations: Array<{
    name: string;
    url: string;
    type?: string;
  }>;
  error: string | null;
  isComplete: boolean;
  progress: number;
  finalCitations: Array<{
    name: string;
    url: string;
    type?: string;
  }>;
  hasContent: boolean;
  currentPhaseMessage: string;
  phaseStartTime: number;
  isTyping: boolean;
  typewriterProgress: number;
}

export const useAlegeonStreaming = (messageId: string | null) => {
  const [streamingState, setStreamingState] = useState<AlegeonStreamingState>({
    isStreaming: false,
    displayedText: '',
    bufferedText: '',
    citations: [],
    error: null,
    isComplete: false,
    progress: 0,
    finalCitations: [],
    hasContent: false,
    currentPhaseMessage: '',
    phaseStartTime: Date.now(),
    isTyping: false,
    typewriterProgress: 0,
  });

  const { setThinkingState } = useReasoning();

  // Typewriter effect for smooth display
  const { displayedText: typewriterText, isTyping, progress: typewriterProgress, fastForward } = useAlegeonTypewriter(
    streamingState.bufferedText,
    {
      speed: 25, // 25 characters per second
      enabled: streamingState.isStreaming || streamingState.bufferedText.length > 0,
      onComplete: () => {
        console.log('🎯 Typewriter animation completed');
      }
    }
  );

  const wsRef = useRef<WebSocket | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const heartbeatRef = useRef<number | null>(null);
  const promiseRef = useRef<{
    resolve: (value: string) => void;
    reject: (reason?: any) => void;
  } | null>(null);
  const hasResolvedRef = useRef<boolean>(false);
  const requestCompletedRef = useRef<boolean>(false);

  // Update streaming state with typewriter values
  useEffect(() => {
    setStreamingState(prev => ({
      ...prev,
      displayedText: typewriterText,
      isTyping,
      typewriterProgress
    }));
  }, [typewriterText, isTyping, typewriterProgress]);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }
    hasResolvedRef.current = false;
    promiseRef.current = null;
  }, []);

  const resetState = useCallback(() => {
    console.log('🔄 Resetting Algeon streaming state');
    setStreamingState({
      isStreaming: false,
      displayedText: '',
      bufferedText: '',
      citations: [],
      error: null,
      isComplete: false,
      progress: 0,
      finalCitations: [],
      hasContent: false,
      currentPhaseMessage: '',
      phaseStartTime: Date.now(),
      isTyping: false,
      typewriterProgress: 0,
    });
    setThinkingState(null);
    cleanup();
  }, [cleanup, setThinkingState]);

  const startStreaming = useCallback(async (query: string, researchType?: AlgeonResearchType): Promise<string> => {
    const selectedType = researchType || 'quick_facts';
    
    console.log('🚀 Starting Algeon streaming request for:', query.substring(0, 50));
    console.log('🔬 Research Type Selected:', selectedType);
    console.log('⏱️ Session timeout set to 12 minutes');
    
    resetState();
    setStreamingState(prev => ({ ...prev, isStreaming: true }));

    return new Promise((resolve, reject) => {
      promiseRef.current = { resolve, reject };
      hasResolvedRef.current = false;
      requestCompletedRef.current = false;

      timeoutRef.current = window.setTimeout(() => {
        if (!hasResolvedRef.current) {
          hasResolvedRef.current = true;
          setStreamingState(prev => {
            const finalText = prev.bufferedText || prev.displayedText;
            if (finalText) {
              resolve(finalText);
            } else {
              reject(new Error('Research session timeout - taking longer than 12 minutes'));
            }
            return { ...prev, isStreaming: false };
          });
          cleanup();
        }
      }, STREAMING_TIMEOUT_MS);

      try {
        const wsUrl = 'wss://opti-agent3-wrappers.up.railway.app/api/research/stream';
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log('🔗 WebSocket connection opened');
          heartbeatRef.current = window.setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: 'ping' }));
            }
          }, HEARTBEAT_INTERVAL);
          
          const payload = {
            query: query,
            research_type: selectedType,
            scope: "global",
            depth: "executive_summary", 
            urgency: "medium",
            stream: true
          };
          
          console.log('📤 Sending WebSocket payload:', payload);
          wsRef.current.send(JSON.stringify(payload));
        };

        let hasReceivedContent = false;

        wsRef.current.onmessage = (event) => {
          console.log('🟦 RAW WebSocket message received:', event.data);
          
          try {
            const data: AlegeonStreamingEvent = JSON.parse(event.data);
            console.log('📊 Parsed WebSocket data:', data);
            
            setStreamingState(prev => {
              const newState = { ...prev };
              
              // Handle chunk events - buffer the content for typewriter effect
              if (data.type === 'chunk' && data.accumulated_content) {
                hasReceivedContent = true;
                newState.bufferedText = data.accumulated_content;
                newState.hasContent = true;
                
                console.log('📝 Content chunk received, accumulated length:', data.accumulated_content.length);
                console.log('📝 Content preview:', data.accumulated_content.substring(0, 100) + '...');
                
                // Update streaming progress
                if (data.progress) {
                  const streamingProgress = Math.min(85, (data.progress.characters_sent / 5000) * 85);
                  newState.progress = streamingProgress;
                  newState.currentPhaseMessage = `Processing... ${data.progress.chunk_number} chunks received`;
                }
              }
              // Handle completion - use backend-formatted content directly
              else if (data.is_complete === true) {
                if (!requestCompletedRef.current) {
                  requestCompletedRef.current = true;
                  newState.isComplete = true;
                  newState.isStreaming = false;
                  
                  // Extract citations with comprehensive debugging
                  const rawCitations = data.citations || data.sources || [];
                  console.log('🔍 RAW citation data from backend:', rawCitations);
                  console.log('🔍 Full completion data structure:', {
                    citations: data.citations,
                    sources: data.sources,
                    accumulated_content_preview: data.accumulated_content?.substring(0, 200),
                    accumulated_content_length: data.accumulated_content?.length,
                    other_keys: Object.keys(data).filter(key => !['type', 'accumulated_content', 'is_complete', 'citations', 'sources'].includes(key))
                  });
                  
                  // Process and validate citations
                  const processedCitations = rawCitations.map((citation: any, index: number) => {
                    console.log(`📚 Processing citation ${index + 1}:`, {
                      original: citation,
                      name: citation.name || citation.title || 'Unknown Source',
                      url: citation.url || citation.link || citation.href,
                      type: citation.type || 'web'
                    });
                    
                    return {
                      name: citation.name || citation.title || `Source ${index + 1}`,
                      url: citation.url || citation.link || citation.href || '',
                      type: citation.type || 'web'
                    };
                  });
                  
                  newState.citations = processedCitations;
                  newState.finalCitations = processedCitations;
                  
                  console.log('✅ Processed citations for frontend:', processedCitations);
                  
                  // Use the backend-formatted content directly (already includes citations)
                  const finalContent = data.accumulated_content || prev.bufferedText;
                  newState.bufferedText = finalContent;
                  newState.progress = 85; // Leave room for typewriter to complete
                  newState.currentPhaseMessage = 'Research completed - displaying results';
                  
                  console.log('✅ Algeon request completed');
                  console.log('📚 Final citations count:', processedCitations.length);
                  console.log('📝 Final content length:', finalContent.length);
                  console.log('🔗 Citations with URLs:', processedCitations.filter(c => c.url));
                  
                  // Don't resolve immediately - wait for typewriter to finish
                  if (!hasResolvedRef.current) {
                    // Set a timeout to resolve after typewriter has had time to complete
                    setTimeout(() => {
                      if (!hasResolvedRef.current) {
                        hasResolvedRef.current = true;
                        resolve(finalContent);
                        cleanup();
                      }
                    }, Math.max(1000, (finalContent.length / 25) * 1000)); // Wait for typewriter
                  }
                }
              }
              // Handle errors
              else if (data.error) {
                console.error('❌ Backend error:', data.error);
                newState.error = data.error;
                newState.isStreaming = false;
                
                if (!hasResolvedRef.current) {
                  hasResolvedRef.current = true;
                  reject(new Error(data.error));
                  cleanup();
                }
              }
              
              return newState;
            });
            
          } catch (parseError) {
            console.error('❌ Error parsing WebSocket message:', parseError);
            console.error('📄 Raw message that failed to parse:', event.data);
            
            setStreamingState(prev => ({ 
              ...prev, 
              error: 'Failed to parse server response',
              isStreaming: false 
            }));
            
            if (!hasResolvedRef.current) {
              hasResolvedRef.current = true;
              reject(new Error('Failed to parse server response'));
              cleanup();
            }
          }
        };

        wsRef.current.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          if (!hasResolvedRef.current) {
            hasResolvedRef.current = true;
            setStreamingState(prev => ({ 
              ...prev, 
              isStreaming: false, 
              error: 'WebSocket connection failed.' 
            }));
            reject(new Error('WebSocket connection failed'));
            cleanup();
          }
        };

        wsRef.current.onclose = (event) => {
          console.log('🔌 WebSocket connection closed:', event.code, event.reason);
          
          if (!hasResolvedRef.current) {
            hasResolvedRef.current = true;
            
            // If we have received content and connection closed normally, treat as success
            if (hasReceivedContent && event.code === 1000) {
              setStreamingState(prev => {
                const finalText = prev.bufferedText || prev.displayedText;
                resolve(finalText);
                return { ...prev, isStreaming: false, isComplete: true };
              });
            } else if (event.code === 1006) {
              setStreamingState(prev => ({ 
                ...prev, 
                error: 'Connection lost unexpectedly',
                isStreaming: false 
              }));
              reject(new Error('Connection lost unexpectedly'));
            } else {
              const errorMsg = `WebSocket closed unexpectedly: ${event.code} ${event.reason || 'No reason given'}`;
              setStreamingState(prev => ({ 
                ...prev, 
                error: errorMsg,
                isStreaming: false 
              }));
              reject(new Error(errorMsg));
            }
            
            cleanup();
          }
        };

      } catch (error) {
        console.error('❌ Error setting up WebSocket:', error);
        if (!hasResolvedRef.current) {
          hasResolvedRef.current = true;
          reject(error);
          cleanup();
        }
      }
    });
  }, [resetState, cleanup, setThinkingState]);

  const stopStreaming = useCallback(() => {
    console.log('🛑 Stopping Algeon streaming');
    setStreamingState(prev => ({ ...prev, isStreaming: false }));
    setThinkingState(null);
    promiseRef.current?.reject(new Error('Streaming stopped by user.'));
    cleanup();
  }, [cleanup, setThinkingState]);

  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, [stopStreaming]);

  return {
    streamingState,
    startStreaming,
    stopStreaming,
    resetState,
    fastForward // Allow users to skip typewriter animation
  };
};
