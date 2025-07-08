import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const projectId = url.pathname.split('/').pop();

  if (!projectId) {
    return new Response(JSON.stringify({ error: 'Project ID required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Set up Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      console.log(`Starting Stratix stream for project: ${projectId}`);
      
      // Send initial connection event
      controller.enqueue(`data: ${JSON.stringify({
        type: 'connected',
        timestamp: new Date().toISOString(),
        message: 'Connected to Stratix research stream'
      })}\n\n`);

      // Set up periodic status checks
      const intervalId = setInterval(async () => {
        try {
          const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
          const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
          const supabase = createClient(supabaseUrl, supabaseServiceKey);

          // Check project status
          const { data: project } = await supabase
            .from('stratix_projects')
            .select('status, updated_at')
            .eq('id', projectId)
            .single();

          if (project) {
            controller.enqueue(`data: ${JSON.stringify({
              type: 'status',
              timestamp: new Date().toISOString(),
              status: project.status,
              message: getStatusMessage(project.status)
            })}\n\n`);

            // If project is done, get final results
            if (project.status === 'done') {
              const { data: results } = await supabase
                .from('stratix_results')
                .select(`
                  *,
                  stratix_citations (*)
                `)
                .eq('project_id', projectId);

              controller.enqueue(`data: ${JSON.stringify({
                type: 'done',
                timestamp: new Date().toISOString(),
                message: 'Research complete',
                results: results
              })}\n\n`);

              clearInterval(intervalId);
              controller.close();
              return;
            }

            // If project failed, send error and close
            if (project.status === 'needs_review') {
              controller.enqueue(`data: ${JSON.stringify({
                type: 'error',
                timestamp: new Date().toISOString(),
                message: 'Research failed and needs manual review'
              })}\n\n`);

              clearInterval(intervalId);
              controller.close();
              return;
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
          controller.enqueue(`data: ${JSON.stringify({
            type: 'error',
            timestamp: new Date().toISOString(),
            message: error.message
          })}\n\n`);
        }
      }, 2000); // Check every 2 seconds

      // Clean up on stream close
      return () => {
        clearInterval(intervalId);
        console.log(`Stratix stream closed for project: ${projectId}`);
      };
    }
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
});

function getStatusMessage(status: string): string {
  switch (status) {
    case 'queued':
      return 'Research request queued for processing...';
    case 'running':
      return 'Actively researching and collecting data...';
    case 'needs_review':
      return 'Research completed but requires manual review';
    case 'done':
      return 'Research completed successfully';
    default:
      return `Status: ${status}`;
  }
}

// Mock thinking events for demonstration
// In production, these would be triggered by the main research process
const mockThinkingEvents = [
  {
    type: 'search',
    message: 'Searching industry databases for market size data...',
    queries: ['market analysis', 'industry trends', 'competitor research']
  },
  {
    type: 'snippet',
    message: 'Found market size data from industry report',
    snippet: 'Global market valued at $2.4B with 15.2% CAGR',
    source: 'Industry Research Corp',
    confidence: 0.85
  },
  {
    type: 'thought',
    message: 'Cross-referencing competitor data across sources...',
    confidence: 0.78
  },
  {
    type: 'merge',
    message: 'Synthesizing findings into comprehensive report...',
    sections: ['market_size', 'competitor_analysis', 'trend_forecast']
  }
];