import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StratixProgressEvent } from '@/components/assistant/StratixProgressIndicator';

export interface StratixEvent extends StratixProgressEvent {
  // Extends StratixProgressEvent for compatibility
}

export interface StratixStreamState {
  status: string;
  events: StratixEvent[];
  isConnected: boolean;
  connectionError: string | null;
}

export const useStratixEventStream = (projectId: string | null) => {
  const [streamState, setStreamState] = useState<StratixStreamState>({
    status: 'idle',
    events: [],
    isConnected: false,
    connectionError: null
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);

  const connectToStream = useCallback(async () => {
    if (!projectId || !isActiveRef.current) return;

    console.log('Connecting to Stratix stream for project:', projectId);

    try {
      // Get the current session for auth
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.error('No session available for Stratix stream');
        return;
      }

      // Create SSE connection to stratix-stream function
      const streamUrl = `https://jtnedstugyvkfthtsumh.supabase.co/functions/v1/stratix-stream/${projectId}`;
      const eventSource = new EventSource(streamUrl + `?authorization=${encodeURIComponent('Bearer ' + session.access_token)}`);

      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('Stratix stream connected');
        setStreamState(prev => ({
          ...prev,
          isConnected: true,
          connectionError: null
        }));
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Stratix stream event:', data);

          const stratixEvent: StratixEvent = {
            type: data.event_type,
            message: data.message,
            timestamp: new Date(),
            progress_percentage: data.progress_percentage,
            data: data.data
          };

          setStreamState(prev => ({
            ...prev,
            status: data.event_type,
            events: [...prev.events, stratixEvent]
          }));

          // Close connection if done or error
          if (data.event_type === 'done' || data.event_type === 'error') {
            eventSource.close();
          }

        } catch (error) {
          console.error('Error parsing Stratix stream event:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('Stratix stream error:', error);
        setStreamState(prev => ({
          ...prev,
          isConnected: false,
          connectionError: 'Stream connection failed'
        }));
        
        eventSource.close();
        
        // Attempt to reconnect after 3 seconds if still active
        if (isActiveRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect to Stratix stream...');
            connectToStream();
          }, 3000);
        }
      };

    } catch (error) {
      console.error('Failed to connect to Stratix stream:', error);
      setStreamState(prev => ({
        ...prev,
        connectionError: 'Failed to establish connection'
      }));
    }
  }, [projectId]);

  const disconnectStream = useCallback(() => {
    isActiveRef.current = false;
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setStreamState({
      status: 'idle',
      events: [],
      isConnected: false,
      connectionError: null
    });
  }, []);

  const resetStream = useCallback(() => {
    setStreamState(prev => ({
      ...prev,
      status: 'idle',
      events: []
    }));
  }, []);

  // Connect when projectId changes
  useEffect(() => {
    if (projectId) {
      isActiveRef.current = true;
      connectToStream();
    } else {
      disconnectStream();
    }

    return () => {
      isActiveRef.current = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [projectId, connectToStream, disconnectStream]);

  return {
    streamState,
    connectToStream,
    disconnectStream,
    resetStream
  };
};