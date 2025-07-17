
import { useState, useCallback, useRef, useEffect } from 'react';
import { detectAlgeonResearchType, type AlgeonResearchType } from '@/utils/algeonResearchTypes';

// Configuration constants
const STREAMING_TIMEOUT_MS = 300000; // 5 minutes for complex research
const HEARTBEAT_INTERVAL = 30000; // 30 seconds keep-alive

// API Source structure from the schema
interface APISource {
  url: string;
  title: string;
  snippet: string;
  source_num: number;
}

// Complete API Response structure
interface ResearchResponseCollapse {
  content: string;
  sources: APISource[];
  citations: string[];
  usage?: object;
  model_used?: string;
  research_type?: string;
  is_complete?: boolean;
  error?: string | null;
  citations_count?: number;
  credibility_score?: number;
  processing_time?: number;
  metadata?: object;
}

// Event types from the Algeon WebSocket
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
  usage?: object;
  error?: string | null;
  message?: string;
  // New: complete response structure
  response?: ResearchResponseCollapse;
}

export interface AlegeonStreamingState {
  isStreaming: boolean;
  currentText: string;
  rawText: string;
  citations: Array<{
    name: string;
    url: string;
    type?: string;
  }>;
  error: string | null;
  isComplete: boolean;
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
  
  const accumulatedTextRef = useRef<string>('');
  const accumulatedCitationsRef = useRef<Array<{ name: string; url: string; type?: string }>>([]);
  const messageCountRef = useRef<number>(0);
  const hasResolvedRef = useRef<boolean>(false);

  // Transform API sources to our citation format
  const transformSourcesToCitations = useCallback((sources: APISource[], citationUrls: string[] = []) => {
    console.log('🔄 Transforming API sources to citations:', { sourcesCount: sources.length, citationUrlsCount: citationUrls.length });
    
    const citations: Array<{ name: string; url: string; type?: string }> = [];
    
    // Process sources array
    sources.forEach((source, index) => {
      citations.push({
        name: source.title || `Source ${source.source_num || index + 1}`,
        url: source.url,
        type: 'web'
      });
    });
    
    // Add any additional citation URLs that aren't in sources
    citationUrls.forEach((url, index) => {
      if (!citations.find(c => c.url === url)) {
        citations.push({
          name: `Citation ${citations.length + 1}`,
          url: url,
          type: 'web'
        });
      }
    });
    
    console.log('✅ Transformed citations:', citations);
    return citations;
  }, []);

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
          
          // Updated payload to match API specification
          const payload = {
            query: query,
            research_type: detectedType,
            scope: "general", // Changed from "global" to match API spec
            depth: "detailed", // Changed from "executive_summary" to get more citations
            urgency: "medium",
            source_preferences: ["academic", "news", "reports", "web"], // Added for citation-rich sources
            tone: "professional",
            max_tokens: 4000,
            timeframe: "recent",
            model: "gpt-4o", // Explicit model selection
          };
          
          console.log('📤 Sending research request with updated payload:', payload);
          wsRef.current.send(JSON.stringify(payload));
        };

        wsRef.current.onmessage = (event) => {
          console.log('📨 Raw WebSocket message:', event.data);
          
          try {
            const data: AlegeonStreamingEvent = JSON.parse(event.data);
            messageCountRef.current += 1;
            
            console.log(`📨 Message #${messageCountRef.current}:`, {
              type: data.type,
              hasContent: !!data.content,
              contentLength: data.content?.length || 0,
              isComplete: data.is_complete,
              finishReason: data.finish_reason,
              error: data.error,
              citationsCount: data.citations?.length || 0,
              hasResponse: !!data.response
            });

            if (data.type === 'chunk') {
              // Handle streaming content
              if (data.content) {
                accumulatedTextRef.current += data.content;
                console.log(`📝 Accumulated text length: ${accumulatedTextRef.current.length}`);
                
                setStreamingState(prev => ({
                  ...prev,
                  rawText: accumulatedTextRef.current,
                  currentText: accumulatedTextRef.current,
                  hasContent: true
                }));
              }

              // Handle legacy citations format (fallback)
              if (data.citations && data.citations.length > 0) {
                accumulatedCitationsRef.current = data.citations;
                setStreamingState(prev => ({
                  ...prev,
                  citations: data.citations || [],
                  finalCitations: data.citations || []
                }));
              }
              
              // Check for completion with complete response structure
              if (data.is_complete === true) {
                console.log('✅ Stream completion detected');
                
                let finalCitations = accumulatedCitationsRef.current;
                
                // NEW: Handle complete response structure with sources and citations
                if (data.response) {
                  console.log('🔍 Processing complete response structure:', {
                    sourcesCount: data.response.sources?.length || 0,
                    citationsCount: data.response.citations?.length || 0,
                    content: data.response.content?.substring(0, 100) + '...'
                  });
                  
                  // Use content from response if available
                  if (data.response.content) {
                    accumulatedTextRef.current = data.response.content;
                  }
                  
                  // Transform API sources to our citation format
                  if (data.response.sources && data.response.sources.length > 0) {
                    finalCitations = transformSourcesToCitations(
                      data.response.sources, 
                      data.response.citations || []
                    );
                    accumulatedCitationsRef.current = finalCitations;
                    console.log('🎯 Extracted citations from API response:', finalCitations);
                  }
                }
                
                if (!hasResolvedRef.current) {
                  hasResolvedRef.current = true;
                  
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
                    citationsPreview: finalCitations.slice(0, 3).map(c => ({ name: c.name, url: c.url }))
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
  }, [resetState, cleanup, transformSourcesToCitations]);

  const stopStreaming = useCallback(() => {
    console.log('🛑 Stopping Algeon streaming by user');
    setStreamingState(prev => ({ ...prev, isStreaming: false, isComplete: false }));
    if (!hasResolvedRef.current && promiseRef.current) {
      hasResolvedRef.current = true;
      promiseRef.current.reject(new Error('Streaming stopped by user.'));
    }
    cleanup();
  }, [cleanup]);

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
