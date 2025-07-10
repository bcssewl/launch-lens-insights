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
  try {
    console.log('Starting Railway research process for:', projectId);
    
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
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('Connected to Railway agent');
      ws.send(JSON.stringify({
        query: prompt,
        context: {
          platform: "optivise",
          session_id: sessionId
        }
      }));
    };

    ws.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Railway message:', message);
        
        // Store event for streaming
        await supabase
          .from('stratix_events')
          .insert({
            project_id: projectId,
            event_type: message.type,
            event_data: message
          });

        // Handle different message types
        switch (message.type) {
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
            
          case 'research_complete':
            // Store final result
            await supabase
              .from('stratix_results')
              .insert({
                project_id: projectId,
                content: message.final_answer,
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
        }
      } catch (error) {
        console.error('Error processing Railway message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('Railway WebSocket error:', error);
      throw new Error('WebSocket connection failed');
    };

    ws.onclose = () => {
      console.log('Railway WebSocket closed');
    };

    console.log('Railway research initiated for:', projectId);

  } catch (error) {
    console.error('Railway research error:', error);
    
    // Update status to error
    await supabase
      .from('stratix_projects')
      .update({ status: 'error' })
      .eq('id', projectId);
  }
}

// Old functions removed - now using Railway agent directly