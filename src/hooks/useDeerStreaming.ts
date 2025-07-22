import { useState, useCallback, useRef } from 'react';

export interface DeerStreamingState {
  isStreaming: boolean;
  finalContent: string;
  activities: DeerActivity[];
  error: string | null;
  isCompleted: boolean;
  sources: DeerSource[];
}

export interface DeerActivity {
  id: string;
  toolName: string;
  content: string;
  timestamp: Date;
  toolCallId?: string;
}

export interface DeerSource {
  title: string;
  url: string;
}

interface DeerMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface DeerRequestBody {
  messages: DeerMessage[];
  thread_id: string;
  resources?: any[];
  max_plan_iterations?: number;
}

interface StreamEvent {
  type: 'ToolMessage' | 'AIMessageChunk';
  content: string;
  name?: string;
  tool_call_id?: string;
}

const DEER_API_URL = 'https://amused-amazement-deer-agent.up.railway.app/api/chat/stream';

export const useDeerStreaming = () => {
  const [streamingState, setStreamingState] = useState<DeerStreamingState>({
    isStreaming: false,
    finalContent: '',
    activities: [],
    error: null,
    isCompleted: false,
    sources: []
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const resetState = useCallback(() => {
    setStreamingState({
      isStreaming: false,
      finalContent: '',
      activities: [],
      error: null,
      isCompleted: false,
      sources: []
    });
  }, []);

  const extractSourcesFromToolMessage = (content: string): DeerSource[] => {
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed
          .filter(item => item.title && item.url)
          .map(item => ({
            title: item.title,
            url: item.url
          }));
      }
    } catch (e) {
      console.warn('Failed to parse tool message content as JSON:', e);
    }
    return [];
  };

  const processStreamEvent = useCallback((event: StreamEvent) => {
    setStreamingState(prev => {
      if (event.type === 'ToolMessage' && event.name) {
        const newActivity: DeerActivity = {
          id: event.tool_call_id || `${Date.now()}-${Math.random()}`,
          toolName: event.name,
          content: event.content,
          timestamp: new Date(),
          toolCallId: event.tool_call_id
        };

        // Extract sources if this is a search tool
        let newSources = prev.sources;
        if (event.name === 'tavily_search') {
          const extractedSources = extractSourcesFromToolMessage(event.content);
          newSources = [...prev.sources, ...extractedSources];
        }

        return {
          ...prev,
          activities: [...prev.activities, newActivity],
          sources: newSources
        };
      }

      if (event.type === 'AIMessageChunk') {
        return {
          ...prev,
          finalContent: prev.finalContent + event.content
        };
      }

      return prev;
    });
  }, []);

  const startStreaming = useCallback(async (
    prompt: string,
    sessionId: string,
    conversationHistory: DeerMessage[] = []
  ): Promise<void> => {
    console.log('🦌 Starting Deer streaming...', { prompt, sessionId });
    
    // Reset state and prepare for new stream
    resetState();
    abortControllerRef.current = new AbortController();

    setStreamingState(prev => ({
      ...prev,
      isStreaming: true,
      error: null
    }));

    try {
      // Prepare request body
      const messages: DeerMessage[] = [
        ...conversationHistory,
        { role: 'user', content: prompt }
      ];

      const requestBody: DeerRequestBody = {
        messages,
        thread_id: sessionId,
        resources: [],
        max_plan_iterations: 3
      };

      console.log('🦌 Sending request to Deer API:', requestBody);

      // Make the streaming request
      const response = await fetch(DEER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('🦌 Stream completed');
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        
        // Process complete JSON objects from buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine) {
            try {
              const event: StreamEvent = JSON.parse(trimmedLine);
              console.log('🦌 Processing event:', event.type, event.name || 'N/A');
              processStreamEvent(event);
            } catch (e) {
              console.warn('🦌 Failed to parse JSON line:', trimmedLine, e);
            }
          }
        }
      }

      // Mark as completed
      setStreamingState(prev => ({
        ...prev,
        isStreaming: false,
        isCompleted: true
      }));

    } catch (error: any) {
      console.error('🦌 Deer streaming error:', error);
      
      if (error.name === 'AbortError') {
        console.log('🦌 Deer streaming aborted');
        setStreamingState(prev => ({
          ...prev,
          isStreaming: false
        }));
      } else {
        setStreamingState(prev => ({
          ...prev,
          isStreaming: false,
          error: error.message || 'An error occurred during streaming'
        }));
      }
    }
  }, [processStreamEvent, resetState]);

  const stopStreaming = useCallback(() => {
    console.log('🦌 Stopping Deer streaming...');
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setStreamingState(prev => ({
      ...prev,
      isStreaming: false
    }));
  }, []);

  return {
    streamingState,
    startStreaming,
    stopStreaming,
    resetState
  };
};