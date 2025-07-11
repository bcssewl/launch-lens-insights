import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StratixRequest {
  prompt: string;
  sessionId: string;
  deepDive?: boolean;
}

interface APIResponse {
  data: any;
  source_meta: {
    source: string;
    timestamp: string;
    confidence: number;
  };
  cost_ms: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { prompt, sessionId, deepDive = false }: StratixRequest = await req.json();
    
    console.log('Stratix Router: Processing request', { prompt, sessionId, deepDive });

    // Create a new Stratix project
    const { data: project, error: projectError } = await supabase
      .from('stratix_projects')
      .insert({
        user_id: await getUserIdFromSession(supabase, sessionId),
        session_id: sessionId,
        prompt: prompt,
        status: 'initializing',
        prompt_snapshot: prompt
      })
      .select()
      .single();

    if (projectError) {
      console.error('Error creating Stratix project:', projectError);
      throw new Error('Failed to create research project');
    }

    console.log('Created Stratix project:', project.id);

    // Start the Railway agent research process in the background
    EdgeRuntime.waitUntil(processRailwayResearch(supabase, project.id!, prompt, sessionId));

    // Return immediate response with project ID for streaming
    return new Response(JSON.stringify({
      projectId: project.id,
      status: 'started',
      streamUrl: `/functions/v1/stratix-stream/${project.id}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Stratix Router Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getUserIdFromSession(supabase: any, sessionId: string): Promise<string> {
  const { data: session } = await supabase
    .from('chat_sessions')
    .select('user_id')
    .eq('id', sessionId)
    .single();
  
  return session?.user_id || '00000000-0000-0000-0000-000000000000';
}

async function processRailwayResearch(
  supabase: any, 
  projectId: string, 
  prompt: string, 
  sessionId: string
) {
  let ws: WebSocket | null = null;
  let connectionTimeout: number | null = null;
  let heartbeatInterval: number | null = null;
  let requestTimeout: number | null = null;
  
  const cleanup = () => {
    if (connectionTimeout) clearTimeout(connectionTimeout);
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    if (requestTimeout) clearTimeout(requestTimeout);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  };
  
  try {
    console.log('Starting Railway research process for:', projectId);
    
    // Validate request size to prevent overwhelming Railway
    if (prompt.length > 10000) {
      throw new Error('Request too large. Please try with a shorter prompt.');
    }
    
    // Update status to running
    await supabase
      .from('stratix_projects')
      .update({ status: 'running' })
      .eq('id', projectId);

    const railwayUrl = Deno.env.get('STRATIX_RAILWAY_URL');
    if (!railwayUrl) {
      throw new Error('STRATIX_RAILWAY_URL not configured');
    }

    // For streaming research, use WebSocket
    const wsUrl = railwayUrl.replace('https://', 'wss://').replace('http://', 'ws://') + '/stream';
    console.log('Connecting to Railway WebSocket:', wsUrl);
    
    // Set connection timeout (30 seconds)
    connectionTimeout = setTimeout(() => {
      console.error('Railway WebSocket connection timeout');
      cleanup();
      throw new Error('Connection timeout - Railway agent did not respond');
    }, 30000);
    
    // Set overall request timeout (10 minutes for large requests)
    requestTimeout = setTimeout(async () => {
      console.error('Railway research request timeout');
      cleanup();
      await supabase
        .from('stratix_projects')
        .update({ status: 'error' })
        .eq('id', projectId);
    }, 600000); // 10 minutes
    
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('Connected to Railway agent');
      
      // Clear connection timeout since we're connected
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        connectionTimeout = null;
      }
      
      // Set up heartbeat to keep connection alive for long requests
      heartbeatInterval = setInterval(() => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000); // Ping every 30 seconds
      
      // Send the actual research request with limits
      ws.send(JSON.stringify({
        query: prompt,
        context: {
          platform: "optivise",
          session_id: sessionId,
          request_id: projectId,
          max_response_size: 50000, // Set reasonable limits
          timeout_minutes: 8 // Give Railway 8 minutes to complete
        }
      }));
      
      // Also poll the Railway status endpoint for additional progress info
      pollRailwayStatus(projectId, sessionId, supabase);
    };

    ws.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        
        // Ignore ping responses
        if (message.type === 'pong') {
          return;
        }
        
        console.log('Railway message:', message);
        
        // Store event for streaming - always store raw event first
        await supabase
          .from('stratix_events')
          .insert({
            project_id: projectId,
            event_type: message.type || 'unknown',
            event_data: message
          });

        // Handle different message types and create additional events for better UX
        switch (message.type) {
          case 'agent_start':
            // Create a clear agent start event
            await supabase
              .from('stratix_events')
              .insert({
                project_id: projectId,
                event_type: 'agent_start',
                event_data: {
                  type: 'agent_start',
                  agent: message.agent || 'Research Agent',
                  message: message.message || `${message.agent || 'Research Agent'} is starting analysis...`
                }
              });
            break;
            
          case 'source_discovered':
            // Store citation
            await supabase
              .from('stratix_citations')
              .insert({
                project_id: projectId,
                source_name: message.source_name,
                source_url: message.source_url,
                agent: message.agent,
                clickable: message.clickable !== false
              });
            break;
            
          case 'progress_update':
          case 'agent_progress':
            // Create progress update event
            await supabase
              .from('stratix_events')
              .insert({
                project_id: projectId,
                event_type: 'agent_progress',
                event_data: {
                  type: 'agent_progress',
                  agent: message.agent || 'Research Agent',
                  message: message.message || message.content || 'Analyzing data...'
                }
              });
            break;
            
          case 'intermediate_result':
            // Create intermediate result event
            await supabase
              .from('stratix_events')
              .insert({
                project_id: projectId,
                event_type: 'intermediate_result',
                event_data: {
                  type: 'intermediate_result',
                  content: message.content || message.message,
                  agent: message.agent
                }
              });
            break;
            
          case 'research_complete':
            // Store final result
            await supabase
              .from('stratix_results')
              .insert({
                project_id: projectId,
                content: message.final_answer || message.content,
                agents_consulted: message.agents_consulted || [],
                primary_agent: message.primary_agent,
                confidence: message.confidence,
                methodology: message.methodology,
                processing_time: message.processing_time,
                analysis_depth: message.analysis_depth
              });
            
            // Store clickable sources
            if (message.clickable_sources) {
              for (const source of message.clickable_sources) {
                await supabase
                  .from('stratix_citations')
                  .insert({
                    project_id: projectId,
                    source_name: source.name,
                    source_url: source.url,
                    source_type: source.type || 'Research',
                    clickable: true
                  });
              }
            }
            
            // Update project status to done
            await supabase
              .from('stratix_projects')
              .update({ 
                status: 'done',
                completed_at: new Date().toISOString()
              })
              .eq('id', projectId);
            
            ws.close();
            break;
            
          default:
            // Handle any unrecognized message types
            if (message.message || message.content) {
              await supabase
                .from('stratix_events')
                .insert({
                  project_id: projectId,
                  event_type: 'general_update',
                  event_data: {
                    type: 'general_update',
                    message: message.message || message.content,
                    agent: message.agent
                  }
                });
            }
            break;
        }
      } catch (error) {
        console.error('Error processing Railway message:', error);
      }
    };

    ws.onerror = async (error) => {
      console.error('Railway WebSocket error:', error);
      cleanup();
      
      // Update status to error
      await supabase
        .from('stratix_projects')
        .update({ status: 'error' })
        .eq('id', projectId);
    };

    ws.onclose = async (event) => {
      console.log('Railway WebSocket closed', { code: event.code, reason: event.reason });
      cleanup();
      
      // If closed without completion, mark as error
      const { data: project } = await supabase
        .from('stratix_projects')
        .select('status')
        .eq('id', projectId)
        .single();
        
      if (project?.status === 'running') {
        console.log('Connection closed prematurely, marking as error');
        await supabase
          .from('stratix_projects')
          .update({ status: 'error' })
          .eq('id', projectId);
      }
    };

    console.log('Railway research initiated for:', projectId);

  } catch (error) {
    console.error('Railway research error:', error);
    cleanup();
    
    // Update status to error
    await supabase
      .from('stratix_projects')
      .update({ status: 'error' })
      .eq('id', projectId);
  }
}

async function pollRailwayStatus(projectId: string, sessionId: string, supabase: any) {
  const railwayUrl = Deno.env.get('STRATIX_RAILWAY_URL');
  if (!railwayUrl) return;
  
  const statusUrl = `${railwayUrl}/stream/status/${sessionId}`;
  let isCompleted = false;
  
  // Poll every 2 seconds for status updates
  const statusInterval = setInterval(async () => {
    try {
      const response = await fetch(statusUrl, {
        headers: { 'accept': 'application/json' }
      });
      
      if (response.ok) {
        const statusData = await response.json();
        
        // Store status update as an event
        await supabase
          .from('stratix_events')
          .insert({
            project_id: projectId,
            event_type: 'status_update',
            event_data: {
              type: 'status_update',
              status: statusData.status,
              current_phase: statusData.current_phase,
              progress_percentage: statusData.progress_percentage,
              estimated_completion: statusData.estimated_completion,
              timestamp: statusData.timestamp,
              message: `${statusData.current_phase}: ${statusData.progress_percentage}% complete`
            }
          });
          
        // Stop polling if completed
        if (statusData.status !== 'active') {
          isCompleted = true;
          clearInterval(statusInterval);
        }
      }
    } catch (error) {
      console.error('Error polling Railway status:', error);
    }
  }, 2000);
  
  // Clean up after 10 minutes
  setTimeout(() => {
    if (!isCompleted) {
      clearInterval(statusInterval);
    }
  }, 600000);
}

// Old functions removed - now using Railway agent directly