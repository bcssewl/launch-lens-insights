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
        // Defensive handling for any event type
        const eventType = event.type?.toLowerCase() || 'unknown';
        const eventData = event.data || {};
        const eventMessage = event.message || '';

        try {
          switch (eventType) {
            case 'connection_confirmed':
            case 'connected':
              console.log('🔗 Stratix connection confirmed:', event.connection_id);
              newState.isStreaming = true;
              newState.currentPhase = eventMessage || 'Connected to Stratix Research Engine';
              newState.overallProgress = Math.max(5, newState.overallProgress);
              newState.connectionId = event.connection_id;
              newState.lastHeartbeat = Date.now();
              break;

            case 'routing_analysis':
            case 'agent_selection':
            case 'agents_selected':
              console.log('🎯 Agent routing analysis:', eventData.agents);
              const agentCount = Array.isArray(eventData.agents) ? eventData.agents.length : 0;
              newState.currentPhase = eventMessage || `Routing to ${agentCount} specialists`;
              newState.overallProgress = Math.max(15, newState.overallProgress);
              newState.collaborationMode = eventData.collaboration_pattern;
              
              // Initialize agents based on routing (defensive)
              if (Array.isArray(eventData.agents)) {
                newState.activeAgents = eventData.agents.map((agentType, index) => ({
                  id: String(agentType),
                  name: String(agentType).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                  role: agentType as any,
                  status: 'idle' as const,
                  progress: 0
                }));
              }
              break;

            case 'research_progress':
            case 'agent_progress':
            case 'progress_update':
              console.log('📊 Research progress:', eventData.progress || 'ongoing');
              if (eventMessage) {
                newState.currentPhase = eventMessage;
              } else if (eventData.status) {
                newState.currentPhase = String(eventData.status);
              }
              
              // Handle progress defensively
              if (typeof eventData.progress === 'number') {
                // Map backend progress to our range (15-70% for research phase)
                newState.overallProgress = Math.max(15, Math.min(70, 15 + (eventData.progress * 0.55)));
              } else {
                // Incremental progress if no specific value
                newState.overallProgress = Math.min(70, newState.overallProgress + 5);
              }
              
              // Update specific agent if mentioned (defensive)
              const agentId = event.agent || eventData.agent;
              if (agentId && newState.activeAgents.length > 0) {
                newState.activeAgents = newState.activeAgents.map(agent => 
                  agent.id === agentId 
                    ? { ...agent, status: 'analyzing' as const, progress: eventData.progress || 50 }
                    : agent
                );
              }
              break;

            case 'source_discovered':
            case 'source_found':
              console.log('📚 Source discovered:', eventData.source_name || 'New source');
              if (eventData.source_name) {
                const newSource: StratixSource = {
                  name: String(eventData.source_name),
                  url: String(eventData.source_url || ''),
                  type: (eventData.source_type as any) || 'web',
                  confidence: typeof eventData.confidence === 'number' ? eventData.confidence : 0.85,
                  clickable: eventData.clickable !== false && Boolean(eventData.source_url),
                  discoveredBy: event.agent_name || event.agent || 'Research Agent',
                  timestamp: event.timestamp || new Date().toISOString()
                };
                
                // Avoid duplicates (defensive)
                const exists = newState.discoveredSources.some(s => 
                  s.url === newSource.url || s.name === newSource.name
                );
                if (!exists) {
                  newState.discoveredSources = [...newState.discoveredSources, newSource];
                }
              }
              newState.overallProgress = Math.min(65, newState.overallProgress + 2);
              break;

            case 'sources_complete':
            case 'source_discovery_complete':
              console.log('✅ Source discovery complete:', eventData.sources_found || newState.discoveredSources.length);
              const sourceCount = eventData.sources_found || newState.discoveredSources.length;
              newState.currentPhase = eventMessage || `Found ${sourceCount} sources`;
              newState.overallProgress = Math.max(70, newState.overallProgress);
              break;

            case 'expert_analysis_started':
            case 'analysis_started':
              console.log('🔬 Expert analysis started:', event.agent_name || event.agent);
              const analystName = event.agent_name || event.agent || 'Research Specialist';
              newState.currentPhase = eventMessage || `${analystName} analyzing data...`;
              newState.overallProgress = Math.max(70, newState.overallProgress);
              
              // Update agent status (defensive)
              const startedAgentId = event.agent || eventData.agent;
              if (startedAgentId && newState.activeAgents.length > 0) {
                newState.activeAgents = newState.activeAgents.map(agent => 
                  agent.id === startedAgentId 
                    ? { ...agent, status: 'analyzing' as const }
                    : agent
                );
              }
              break;

            case 'expert_analysis_complete':
            case 'analysis_complete':
              console.log('✅ Expert analysis complete:', event.agent_name || event.agent);
              newState.overallProgress = Math.min(85, newState.overallProgress + 5);
              
              // Mark agent as complete (defensive)
              const completeAgentId = event.agent || eventData.agent;
              if (completeAgentId && newState.activeAgents.length > 0) {
                newState.activeAgents = newState.activeAgents.map(agent => 
                  agent.id === completeAgentId 
                    ? { ...agent, status: 'complete' as const, progress: 100 }
                    : agent
                );
              }
              break;

            case 'synthesis_progress':
            case 'synthesis_start':
            case 'synthesis_started':
              console.log('🧠 Synthesis in progress:', eventData.model || 'AI model');
              newState.currentPhase = eventMessage || 'Synthesizing insights from all specialists...';
              newState.overallProgress = Math.max(85, Math.min(95, newState.overallProgress + 2));
              newState.synthesisModel = eventData.model || 'AI Model';
              break;

            case 'partial_result':
            case 'streaming_content':
              console.log('📝 Partial result received, length:', eventData.text?.length || 0);
              // ChatGPT-like streaming: append text chunks (defensive)
              if (eventData.text && typeof eventData.text === 'string') {
                newState.partialText += eventData.text;
              }
              break;

            case 'complete':
            case 'research_complete':
            case 'finished':
              console.log('✅ Stratix research complete');
              newState.isStreaming = false;
              newState.currentPhase = eventMessage || 'Research completed';
              newState.overallProgress = 100;
              
              // Mark all agents as complete
              newState.activeAgents = newState.activeAgents.map(agent => ({
                ...agent,
                status: 'complete' as const,
                progress: 100
              }));
              
              // Final answer handling (defensive)
              if (eventData.final_answer && typeof eventData.final_answer === 'string') {
                newState.partialText = eventData.final_answer;
              }
              break;

            case 'error':
            case 'failed':
              console.error('❌ Stratix streaming error:', eventMessage);
              newState.isStreaming = false;
              newState.error = eventMessage || 'An error occurred during research';
              newState.currentPhase = 'Error occurred';
              break;

            case 'ping':
            case 'heartbeat':
              // Update heartbeat for connection health
              newState.lastHeartbeat = Date.now();
              break;

            default:
              console.log('📦 Unknown Stratix event type:', eventType, 'Data:', eventData);
              // For unknown events, try to extract useful information
              if (eventMessage) {
                newState.currentPhase = eventMessage;
              }
              if (typeof eventData.progress === 'number') {
                newState.overallProgress = Math.min(95, Math.max(newState.overallProgress, eventData.progress));
              }
              break;
          }
        } catch (error) {
          console.error('Error processing Stratix event:', eventType, error);
          // Don't break the entire flow for one bad event
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
