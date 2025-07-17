
import { useState, useCallback, useRef, useEffect } from 'react';
import { detectAlgeonResearchType, type AlgeonResearchType } from '@/utils/algeonResearchTypes';

// Configuration constants
const STREAMING_TIMEOUT_MS = 300000; // 5 minutes for complex research
const HEARTBEAT_INTERVAL = 30000; // 30 seconds keep-alive

// Enhanced event types from the Algeon WebSocket - Updated to match complete API schema
interface AlegeonStreamingEvent {
  type: string;
  content?: string;
  is_complete?: boolean;
  finish_reason?: string | null;
  citations?: Array<{
    name: string;
    url: string;
    type?: string;
  }>;
  // Enhanced fields from API schema
  sources?: Array<{
    url: string;
    title: string;
    snippet?: string;
    source_num?: number;
    credibility_score?: number;
  }>;
  metadata?: {
    citations_count?: number;
    credibility_score?: number;
    processing_time?: number;
    search_queries?: string[];
    [key: string]: any;
  };
  usage?: object;
  error?: string | null;
  message?: string; // for error messages
  // Additional fields that might be present
  response?: {
    content?: string;
    sources?: Array<{
      url: string;
      title: string;
      snippet?: string;
      source_num?: number;
      credibility_score?: number;
    }>;
    citations?: Array<{
      name: string;
      url: string;
      type?: string;
    }>;
  };
  final_answer?: string;
  search_results?: any[];
  [key: string]: any; // Allow for additional unknown fields
}

export interface AlegeonStreamingState {
  isStreaming: boolean;
  currentText: string;
  rawText: string; // Full text buffer for typewriter
  citations: Array<{
    name: string;
    url: string;
    type?: string;
  }>;
  error: string | null;
  isComplete: boolean;
  // New fields for better state management
  finalCitations: Array<{
    name: string;
    url: string;
    type?: string;
  }>;
  hasContent: boolean;
}

export const useAlegeonStreaming = () => {
  const [streamingState, setStreamingState] = useState<AlegeonStreamingState>({
    isStreaming: false,
    currentText: '',
    rawText: '',
    citations: [],
    error: null,
    isComplete: false,
    finalCitations: [],
    hasContent: false,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const heartbeatRef = useRef<number | null>(null);
  const promiseRef = useRef<{
    resolve: (value: { text: string; citations: Array<{ name: string; url: string; type?: string }> }) => void;
    reject: (reason?: any) => void;
  } | null>(null);
  
  // Use ref to track accumulated text to avoid React state async issues
  const accumulatedTextRef = useRef<string>('');
  const accumulatedCitationsRef = useRef<Array<{ name: string; url: string; type?: string }>>([]);
  const messageCountRef = useRef<number>(0);
  const hasResolvedRef = useRef<boolean>(false);

  // Enhanced citation transformation function
  const transformSourcesToCitations = useCallback((sources: any[]): Array<{ name: string; url: string; type?: string }> => {
    if (!sources || !Array.isArray(sources)) return [];
    
    return sources.map((source, index) => ({
      name: source.title || source.name || `Source ${index + 1}`,
      url: source.url || '',
      type: source.type || 'web'
    })).filter(citation => citation.url); // Only include citations with valid URLs
  }, []);

  // Enhanced message processing function
  const processMessageForCitations = useCallback((data: AlegeonStreamingEvent): Array<{ name: string; url: string; type?: string }> => {
    let foundCitations: Array<{ name: string; url: string; type?: string }> = [];

    // Check multiple possible locations for citations/sources
    if (data.citations && Array.isArray(data.citations)) {
      foundCitations = [...foundCitations, ...data.citations];
    }

    if (data.sources && Array.isArray(data.sources)) {
      foundCitations = [...foundCitations, ...transformSourcesToCitations(data.sources)];
    }

    if (data.response?.citations && Array.isArray(data.response.citations)) {
      foundCitations = [...foundCitations, ...data.response.citations];
    }

    if (data.response?.sources && Array.isArray(data.response.sources)) {
      foundCitations = [...foundCitations, ...transformSourcesToCitations(data.response.sources)];
    }

    if (data.metadata?.sources && Array.isArray(data.metadata.sources)) {
      foundCitations = [...foundCitations, ...transformSourcesToCitations(data.metadata.sources)];
    }

    // Remove duplicates based on URL
    const uniqueCitations = foundCitations.filter((citation, index, self) => 
      index === self.findIndex(c => c.url === citation.url)
    );

    return uniqueCitations;
  }, [transformSourcesToCitations]);

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
    accumulatedCitationsRef.current = [];
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
      citations: [],
      error: null,
      isComplete: false,
      finalCitations: [],
      hasContent: false,
    });
    cleanup();
  }, [cleanup]);

  const startStreaming = useCallback(async (query: string, researchType?: AlgeonResearchType): Promise<{ text: string; citations: Array<{ name: string; url: string; type?: string }> }> => {
    const detectedType = researchType || detectAlgeonResearchType(query);
    console.log('🚀 Starting Algeon streaming for query:', query.substring(0, 100));
    console.log('📋 Using research type:', detectedType);
    
    resetState();

    return new Promise((resolve, reject) => {
      promiseRef.current = { resolve, reject };
      hasResolvedRef.current = false;
      accumulatedTextRef.current = '';
      accumulatedCitationsRef.current = [];
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
          const finalCitations = accumulatedCitationsRef.current;
          if (finalText) {
            console.log('⏰ Timeout but have content, resolving with:', finalText.substring(0, 100));
            resolve({ text: finalText, citations: finalCitations });
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
          
          // Enhanced payload with citation-friendly parameters
          const payload = {
            query: query,
            research_type: detectedType,
            scope: "general", // Changed from "global" to match API schema
            depth: "detailed", // Changed from "executive_summary" for more comprehensive responses
            urgency: "medium",
            source_preferences: ["academic", "news", "reports", "official"], // Added for better citations
            model: "gpt-4", // Added model specification
            tone: "professional", // Added tone
            max_tokens: 4000, // Added reasonable token limit
            timeframe: "recent" // Added timeframe
          };
          
          console.log('📤 Sending enhanced research request:', payload);
          wsRef.current.send(JSON.stringify(payload));
        };

        wsRef.current.onmessage = (event) => {
          console.log('📨 Raw WebSocket message received:', event.data);
          
          try {
            const data: AlegeonStreamingEvent = JSON.parse(event.data);
            messageCountRef.current += 1;
            
            // Enhanced logging to capture all fields
            console.log(`📨 Message #${messageCountRef.current} - Complete structure:`, {
              type: data.type,
              hasContent: !!data.content,
              contentLength: data.content?.length || 0,
              isComplete: data.is_complete,
              finishReason: data.finish_reason,
              error: data.error,
              citationsCount: data.citations?.length || 0,
              sourcesCount: data.sources?.length || 0,
              hasMetadata: !!data.metadata,
              hasResponse: !!data.response,
              allKeys: Object.keys(data),
              rawData: data // Log the complete raw data
            });

            // Process citations from multiple possible locations
            const foundCitations = processMessageForCitations(data);
            if (foundCitations.length > 0) {
              console.log('📎 Found citations in message:', foundCitations);
              accumulatedCitationsRef.current = foundCitations;
              setStreamingState(prev => ({
                ...prev,
                citations: foundCitations,
                finalCitations: foundCitations
              }));
            }

            if (data.type === 'chunk') {
              // Handle content from multiple possible sources
              let content = data.content || data.response?.content || data.final_answer || '';
              
              if (content) {
                accumulatedTextRef.current += content;
                console.log(`📝 Accumulated text length: ${accumulatedTextRef.current.length}`);
                
                // Update streaming state with raw text for typewriter effect
                setStreamingState(prev => ({
                  ...prev,
                  rawText: accumulatedTextRef.current,
                  currentText: accumulatedTextRef.current,
                  hasContent: true
                }));
              }
              
              // Check for completion using multiple indicators
              if (data.is_complete === true || data.finish_reason || data.type === 'complete') {
                console.log('✅ Stream completion detected:', {
                  isComplete: data.is_complete,
                  finishReason: data.finish_reason,
                  type: data.type
                });
                
                if (!hasResolvedRef.current) {
                  hasResolvedRef.current = true;
                  
                  const finalCitations = foundCitations.length > 0 ? foundCitations : accumulatedCitationsRef.current;
                  
                  setStreamingState(prev => ({
                    ...prev,
                    isStreaming: false,
                    isComplete: true,
                    currentText: accumulatedTextRef.current,
                    rawText: accumulatedTextRef.current,
                    citations: finalCitations,
                    finalCitations: finalCitations,
                    hasContent: true
                  }));
                  
                  const finalResult = accumulatedTextRef.current || 'Research completed successfully.';
                  console.log('✅ Resolving with final result and citations:', {
                    textLength: finalResult.length,
                    citationsCount: finalCitations.length,
                    citations: finalCitations
                  });
                  resolve({ text: finalResult, citations: finalCitations });
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
            const finalCitations = accumulatedCitationsRef.current;
            
            if (finalText && finalText.length > 50 && (event.code === 1000 || event.wasClean)) {
              console.log('✅ Normal closure with content, resolving with accumulated text and citations');
              setStreamingState(prev => ({
                ...prev,
                isComplete: true,
                currentText: finalText,
                rawText: finalText,
                finalCitations: finalCitations,
                hasContent: true
              }));
              resolve({ text: finalText, citations: finalCitations });
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
  }, [resetState, cleanup, processMessageForCitations]);

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
