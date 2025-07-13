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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { prompt, sessionId, deepDive = false }: StratixRequest = await req.json();
    
    console.log('New Stratix Router: Processing request', { prompt, sessionId, deepDive });

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

    // Start the new Railway agent research process in the background
    EdgeRuntime.waitUntil(processNewRailwayResearch(supabase, project.id!, prompt, sessionId));

    // Return immediate response with project ID for streaming
    return new Response(JSON.stringify({
      projectId: project.id,
      status: 'started',
      streamUrl: `/functions/v1/stratix-stream/${project.id}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('New Stratix Router Error:', error);
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

async function processNewRailwayResearch(
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
    console.log('Starting new Railway research process for:', projectId);
    
    // Validate request size
    if (prompt.length > 10000) {
      throw new Error('Request too large. Please try with a shorter prompt.');
    }
    
    // Update status to running
    await supabase
      .from('stratix_projects')
      .update({ status: 'running' })
      .eq('id', projectId);

    // Use new Railway URL with user ID pattern
    const railwayUrl = 'https://web-production-06ef2.up.railway.app';
    
    // Get user ID from session
    const userId = await getUserIdFromSession(supabase, sessionId);
    
    // For streaming research, use WebSocket with user ID
    const wsUrl = `wss://web-production-06ef2.up.railway.app/ws/${userId}`;
    console.log('Connecting to new Railway WebSocket:', wsUrl);
    
    // Set connection timeout (30 seconds)
    connectionTimeout = setTimeout(() => {
      console.error('New Railway WebSocket connection timeout');
      cleanup();
      throw new Error('Connection timeout - Railway agent did not respond');
    }, 30000);
    
    // Set overall request timeout (10 minutes for large requests)
    requestTimeout = setTimeout(async () => {
      console.error('New Railway research request timeout');
      cleanup();
      await supabase
        .from('stratix_projects')
        .update({ status: 'error' })
        .eq('id', projectId);
    }, 600000); // 10 minutes
    
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('Connected to new Railway agent');
      
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
      
      // Send the actual research request with new format
      ws.send(JSON.stringify({
        message: prompt,
        provider: 'openai', // Default to OpenAI, let agent handle selection
        session_id: null // Start new session for each request
      }));
    };

    ws.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        
        // Ignore ping responses
        if (message.type === 'pong') {
          return;
        }
        
        console.log('New Railway message:', message);
        
        // Store event for streaming - always store raw event first
        await supabase
          .from('stratix_events')
          .insert({
            project_id: projectId,
            event_type: message.type || 'unknown',
            event_data: message
          });

        // Handle different message types from new agent
        switch (message.type) {
          case 'session_id':
            // Store session ID for future reference
            await supabase
              .from('stratix_events')
              .insert({
                project_id: projectId,
                event_type: 'session_established',
                event_data: {
                  type: 'session_established',
                  session_id: message.session_id,
                  message: 'Research session established'
                }
              });
            break;
            
          case 'stream_start':
            // Research has started
            await supabase
              .from('stratix_events')
              .insert({
                project_id: projectId,
                event_type: 'research_started',
                event_data: {
                  type: 'research_started',
                  message: 'Research analysis has begun'
                }
              });
            break;
            
          case 'stream_chunk':
            // Streaming content chunk
            await supabase
              .from('stratix_events')
              .insert({
                project_id: projectId,
                event_type: 'content_chunk',
                event_data: {
                  type: 'content_chunk',
                  content: message.content,
                  message: 'Streaming research content...'
                }
              });
            break;
            
          case 'stream_end':
            // Research completed
            await supabase
              .from('stratix_results')
              .insert({
                project_id: projectId,
                content: message.final_answer || 'Research completed',
                agents_consulted: ['new_railway_agent'],
                primary_agent: 'new_railway_agent',
                confidence: 0.9,
                methodology: 'Advanced AI Research',
                processing_time: Date.now(),
                analysis_depth: 'comprehensive'
              });
            
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
            
          case 'error':
            // Handle error from new agent
            await supabase
              .from('stratix_events')
              .insert({
                project_id: projectId,
                event_type: 'error',
                event_data: {
                  type: 'error',
                  message: message.message || 'Unknown error occurred'
                }
              });
            
            await supabase
              .from('stratix_projects')
              .update({ status: 'error' })
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
                    message: message.message || message.content
                  }
                });
            }
            break;
        }
      } catch (error) {
        console.error('Error processing new Railway message:', error);
      }
    };

    ws.onerror = async (error) => {
      console.error('New Railway WebSocket error:', error);
      cleanup();
      
      // Update status to error
      await supabase
        .from('stratix_projects')
        .update({ status: 'error' })
        .eq('id', projectId);
    };

    ws.onclose = async (event) => {
      console.log('New Railway WebSocket closed', { code: event.code, reason: event.reason });
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

    console.log('New Railway research initiated for:', projectId);

  } catch (error) {
    console.error('New Railway research error:', error);
    cleanup();
    
    // Update status to error
    await supabase
      .from('stratix_projects')
      .update({ status: 'error' })
      .eq('id', projectId);
  }
}
