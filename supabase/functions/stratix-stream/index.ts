import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract project ID from URL path: /functions/v1/stratix-stream/{projectId}
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const projectId = pathParts[pathParts.length - 1];

    if (!projectId || projectId === 'stratix-stream') {
      return new Response('Project ID is required', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    console.log('Stratix Stream: Starting SSE for project', projectId);

    // Verify project exists and user has access
    const { data: project, error: projectError } = await supabase
      .from('stratix_projects')
      .select('id, user_id, status')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return new Response('Project not found', { 
        status: 404,
        headers: corsHeaders 
      });
    }

    // Set up Server-Sent Events
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // SSE headers
    const sseHeaders = {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    };

    // Send initial connection event
    await writer.write(encoder.encode(`data: ${JSON.stringify({
      event_type: 'connected',
      message: 'Stream connected',
      progress_percentage: 0,
      project_id: projectId
    })}\n\n`));

    // If project is already done, send existing events and close
    if (project.status === 'done' || project.status === 'error') {
      console.log('Project already completed, sending existing events');
      
      const { data: existingEvents } = await supabase
        .from('stratix_events')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (existingEvents) {
        for (const event of existingEvents) {
          await writer.write(encoder.encode(`data: ${JSON.stringify({
            event_type: event.event_type,
            message: event.message,
            progress_percentage: event.progress_percentage,
            data: event.data,
            project_id: projectId
          })}\n\n`));
        }
      }

      await writer.write(encoder.encode(`data: ${JSON.stringify({
        event_type: 'stream_complete',
        message: 'Stream complete',
        progress_percentage: 100,
        project_id: projectId
      })}\n\n`));

      await writer.close();
      return new Response(readable, { headers: sseHeaders });
    }

    // Set up realtime subscription for new events
    let streamClosed = false;
    
    const channel = supabase
      .channel(`stratix_events_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stratix_events',
          filter: `project_id=eq.${projectId}`
        },
        async (payload) => {
          if (streamClosed) return;

          console.log('Stratix Stream: Received event', payload.new);
          
          const event = payload.new;
          const eventData = {
            event_type: event.event_type,
            message: event.message,
            progress_percentage: event.progress_percentage,
            data: event.data,
            project_id: projectId
          };

          try {
            await writer.write(encoder.encode(`data: ${JSON.stringify(eventData)}\n\n`));

            // Close stream if research is complete
            if (event.event_type === 'done' || event.event_type === 'error') {
              console.log('Stratix Stream: Research complete, closing stream');
              streamClosed = true;
              
              await writer.write(encoder.encode(`data: ${JSON.stringify({
                event_type: 'stream_complete',
                message: 'Stream complete',
                progress_percentage: 100,
                project_id: projectId
              })}\n\n`));

              await writer.close();
              await supabase.removeChannel(channel);
            }
          } catch (error) {
            console.error('Error writing to stream:', error);
            streamClosed = true;
            await writer.close();
            await supabase.removeChannel(channel);
          }
        }
      )
      .subscribe((status) => {
        console.log('Stratix Stream: Subscription status', status);
      });

    // Handle client disconnect
    req.signal?.addEventListener('abort', async () => {
      console.log('Stratix Stream: Client disconnected');
      streamClosed = true;
      await writer.close();
      await supabase.removeChannel(channel);
    });

    // Set up timeout to prevent infinite streams (30 minutes max)
    const timeout = setTimeout(async () => {
      if (!streamClosed) {
        console.log('Stratix Stream: Timeout reached, closing stream');
        streamClosed = true;
        
        await writer.write(encoder.encode(`data: ${JSON.stringify({
          event_type: 'timeout',
          message: 'Stream timeout',
          progress_percentage: 0,
          project_id: projectId
        })}\n\n`));

        await writer.close();
        await supabase.removeChannel(channel);
      }
    }, 30 * 60 * 1000); // 30 minutes

    // Clean up timeout when stream closes
    const originalClose = writer.close.bind(writer);
    writer.close = async () => {
      clearTimeout(timeout);
      return originalClose();
    };

    return new Response(readable, { headers: sseHeaders });

  } catch (error) {
    console.error('Stratix Stream Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});