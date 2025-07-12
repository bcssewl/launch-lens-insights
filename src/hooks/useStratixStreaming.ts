import { useState, useCallback, useRef, useEffect } from 'react';
import type { 
  StratixStreamingEvent, 
  StratixSource, 
  StratixAgent, 
  StratixStreamingState 
} from '@/types/stratixStreaming';

// Configuration constants with throttling for smooth UX
const STREAMING_TIMEOUT_MS = 300000; // 5 minutes for complex research
const HEARTBEAT_INTERVAL = 30000; // 30 seconds keep-alive
const EVENT_THROTTLE_MS = 100; // Throttle UI updates to 60fps for performance

export const useStratixStreaming = () => {
  const [streamingState, setStreamingState] = useState<StratixStreamingState>({
    isStreaming: false,
    currentPhase: '',
    overallProgress: 0,
    activeAgents: [],
    discoveredSources: [],
    partialText: '',
    error: null,
    lastHeartbeat: Date.now()
  });

  const wsRef = useRef<WebSocket | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const heartbeatRef = useRef<number | null>(null);
  const eventQueueRef = useRef<StratixStreamingEvent[]>([]);
  const throttleRef = useRef<number | null>(null);

  // Process event queue with throttling for smooth performance
  const processEventQueue = useCallback(() => {
    if (eventQueueRef.current.length === 0) return;

    const events = [...eventQueueRef.current];
    eventQueueRef.current = [];

    setStreamingState(prev => {
      let newState = { ...prev };

      events.forEach(event => {
        switch (event.type) {
          case 'connection_confirmed':
            console.log('🔗 Stratix connection confirmed:', event.connection_id);
            newState.isStreaming = true;
            newState.currentPhase = 'Connected to Stratix Research Engine';
            newState.overallProgress = 5;
            newState.connectionId = event.connection_id;
            newState.lastHeartbeat = Date.now();
            break;

          case 'routing_analysis':
            console.log('🎯 Agent routing analysis:', event.data?.agents);
            newState.currentPhase = `Routing to ${event.data?.agents?.length || 0} specialists`;
            newState.overallProgress = 15;
            newState.collaborationMode = event.data?.collaboration_pattern;
            
            // Initialize agents based on routing
            if (event.data?.agents) {
              newState.activeAgents = event.data.agents.map((agentType, index) => ({
                id: agentType,
                name: agentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                role: agentType as any,
                status: 'idle' as const,
                progress: 0
              }));
            }
            break;

          case 'research_progress':
            console.log('📊 Research progress:', event.data?.progress);
            if (event.data?.status) {
              newState.currentPhase = event.data.status;
            }
            if (event.data?.progress) {
              // Map backend progress to our range (15-70% for research phase)
              newState.overallProgress = Math.max(15, Math.min(70, 15 + (event.data.progress * 0.55)));
            }
            
            // Update specific agent if mentioned
            if (event.agent && newState.activeAgents.length > 0) {
              newState.activeAgents = newState.activeAgents.map(agent => 
                agent.id === event.agent 
                  ? { ...agent, status: 'analyzing' as const, progress: event.data?.progress }
                  : agent
              );
            }
            break;

          case 'source_discovered':
            console.log('📚 Source discovered:', event.data?.source_name);
            if (event.data?.source_name && event.data?.source_url) {
              const newSource: StratixSource = {
                name: event.data.source_name,
                url: event.data.source_url,
                type: (event.data.source_type as any) || 'web',
                confidence: 0.85, // Default confidence
                clickable: event.data.clickable !== false,
                discoveredBy: event.agent_name || event.agent,
                timestamp: event.timestamp
              };
              
              // Avoid duplicates
              const exists = newState.discoveredSources.some(s => s.url === newSource.url);
              if (!exists) {
                newState.discoveredSources = [...newState.discoveredSources, newSource];
              }
            }
            newState.overallProgress = Math.min(65, newState.overallProgress + 2);
            break;

          case 'sources_complete':
            console.log('✅ Source discovery complete:', event.data?.sources_found);
            newState.currentPhase = `Found ${event.data?.sources_found || newState.discoveredSources.length} sources`;
            newState.overallProgress = 70;
            break;

          case 'expert_analysis_started':
            console.log('🔬 Expert analysis started:', event.agent_name);
            newState.currentPhase = `${event.agent_name} analyzing data...`;
            newState.overallProgress = Math.max(70, newState.overallProgress);
            
            // Update agent status
            if (event.agent && newState.activeAgents.length > 0) {
              newState.activeAgents = newState.activeAgents.map(agent => 
                agent.id === event.agent 
                  ? { ...agent, status: 'analyzing' as const }
                  : agent
              );
            }
            break;

          case 'expert_analysis_complete':
            console.log('✅ Expert analysis complete:', event.agent_name);
            newState.overallProgress = Math.min(85, newState.overallProgress + 5);
            
            // Mark agent as complete
            if (event.agent && newState.activeAgents.length > 0) {
              newState.activeAgents = newState.activeAgents.map(agent => 
                agent.id === event.agent 
                  ? { ...agent, status: 'complete' as const, progress: 100 }
                  : agent
              );
            }
            break;

          case 'synthesis_progress':
            console.log('🧠 Synthesis in progress:', event.data?.model);
            newState.currentPhase = 'Synthesizing insights from all specialists...';
            newState.overallProgress = Math.max(85, Math.min(95, newState.overallProgress + 2));
            newState.synthesisModel = event.data?.model;
            break;

          case 'partial_result':
            console.log('📝 Partial result received, length:', event.data?.text?.length);
            // ChatGPT-like streaming: append text chunks
            if (event.data?.text) {
              newState.partialText += event.data.text;
            }
            break;

          case 'complete':
            console.log('✅ Stratix research complete');
            newState.isStreaming = false;
            newState.currentPhase = 'Research completed';
            newState.overallProgress = 100;
            
            // Mark all agents as complete
            newState.activeAgents = newState.activeAgents.map(agent => ({
              ...agent,
              status: 'complete' as const,
              progress: 100
            }));
            
            // Final answer handling
            if (event.data?.final_answer) {
              newState.partialText = event.data.final_answer;
            }
            break;

          case 'error':
            console.error('❌ Stratix streaming error:', event.message);
            newState.isStreaming = false;
            newState.error = event.message || 'An error occurred during research';
            newState.currentPhase = 'Error occurred';
            break;

          case 'ping':
            // Update heartbeat for connection health
            newState.lastHeartbeat = Date.now();
            break;

          default:
            console.warn('⚠️ Unknown Stratix event type:', event.type);
        }
      });

      return newState;
    });
  }, []);

  // Throttled event processing for smooth UI updates
  const queueEvent = useCallback((event: StratixStreamingEvent) => {
    eventQueueRef.current.push(event);
    
    if (throttleRef.current) {
      clearTimeout(throttleRef.current);
    }
    
    throttleRef.current = window.setTimeout(processEventQueue, EVENT_THROTTLE_MS);
  }, [processEventQueue]);

  const resetState = useCallback(() => {
    console.log('🔄 Resetting Stratix streaming state');
    setStreamingState({
      isStreaming: false,
      currentPhase: '',
      overallProgress: 0,
      activeAgents: [],
      discoveredSources: [],
      partialText: '',
      error: null,
      lastHeartbeat: Date.now()
    });
    eventQueueRef.current = [];
  }, []);

  const startStreaming = useCallback(async (query: string, sessionId: string): Promise<string> => {
    console.log('🚀 Starting Stratix streaming for query:', query.substring(0, 100));
    
    resetState();

    return new Promise((resolve, reject) => {
      // Clear any existing connections
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }

      // Set timeout for the streaming request
      timeoutRef.current = window.setTimeout(() => {
        console.log('⏰ Stratix streaming timeout reached after 5 minutes');
        if (wsRef.current) {
          wsRef.current.close();
        }
        reject(new Error('Streaming timeout - research taking longer than expected'));
      }, STREAMING_TIMEOUT_MS);

      try {
        const wsUrl = 'wss://ai-agent-research-optivise-production.up.railway.app/stream';
        console.log('🔌 Connecting to Stratix WebSocket:', wsUrl);
        
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log('✅ Stratix WebSocket connected');
          
          // Set up heartbeat to maintain connection
          heartbeatRef.current = window.setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: 'ping' }));
            }
          }, HEARTBEAT_INTERVAL);
          
          // Send query with Stratix format
          const payload = {
            query: query,
            context: { 
              sessionId: sessionId,
              platform: 'Stratix',
              timestamp: new Date().toISOString()
            }
          };
          
          console.log('📤 Sending Stratix query:', payload);
          wsRef.current.send(JSON.stringify(payload));
        };

        wsRef.current.onmessage = (event) => {
          try {
            console.log('📨 Raw Stratix message:', event.data);
            const data: StratixStreamingEvent = JSON.parse(event.data);
            console.log('📋 Parsed Stratix event:', {
              type: data.type,
              message: data.message?.substring(0, 100),
              agent: data.agent_name || data.agent
            });
            
            queueEvent(data);

            // Resolve when we get the complete event
            if (data.type === 'complete') {
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
              
              if (heartbeatRef.current) {
                clearInterval(heartbeatRef.current);
                heartbeatRef.current = null;
              }
              
              const finalAnswer = data.data?.final_answer || streamingState.partialText || 'Research completed successfully.';
              console.log('✅ Stratix streaming completed with response length:', finalAnswer.length);
              resolve(finalAnswer);
            }
          } catch (error) {
            console.error('❌ Error parsing Stratix event:', error);
            console.log('Raw event data:', event.data);
          }
        };

        wsRef.current.onerror = (error) => {
          console.error('❌ Stratix WebSocket error:', error);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          if (heartbeatRef.current) {
            clearInterval(heartbeatRef.current);
            heartbeatRef.current = null;
          }
          reject(new Error('WebSocket connection failed'));
        };

        wsRef.current.onclose = (event) => {
          console.log('🔌 Stratix WebSocket closed:', event.code, event.reason);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          if (heartbeatRef.current) {
            clearInterval(heartbeatRef.current);
            heartbeatRef.current = null;
          }
          
          if (event.code !== 1000 && event.code !== 1005) {
            // Unexpected close
            reject(new Error(`WebSocket closed unexpectedly: ${event.code} ${event.reason}`));
          }
        };

      } catch (error) {
        console.error('❌ Failed to establish Stratix WebSocket connection:', error);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        reject(error);
      }
    });
  }, [queueEvent, resetState, streamingState.partialText]);

  const stopStreaming = useCallback(() => {
    console.log('🛑 Stopping Stratix streaming');
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    
    if (throttleRef.current) {
      clearTimeout(throttleRef.current);
      throttleRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    resetState();
  }, [resetState]);

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
