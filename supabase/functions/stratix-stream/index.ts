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

      let lastEventId = 0;
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Set up periodic checks for new events
      const intervalId = setInterval(async () => {
        try {
          // Get new events since last check
          const { data: events } = await supabase
            .from('stratix_events')
            .select('*')
            .eq('project_id', projectId)
            .gt('id', lastEventId)
            .order('created_at', { ascending: true });

          // Send new events
          if (events && events.length > 0) {
            for (const event of events) {
              const eventData = event.event_data;
              
              // Convert Railway agent events to Stratix format
              let stratixEvent;
              switch (eventData.type) {
                case 'started':
                  stratixEvent = { 
                    type: 'status', 
                    status: 'searching', 
                    message: 'Initializing research...' 
                  };
                  break;
                case 'agents_selected':
                  stratixEvent = { 
                    type: 'status', 
                    status: 'reading', 
                    message: eventData.message || 'Consulting specialists...' 
                  };
                  break;
                case 'agent_started':
                  stratixEvent = { 
                    type: 'status', 
                    status: 'reading', 
                    message: `${eventData.agent_name || eventData.agent} analyzing...` 
                  };
                  break;
                case 'source_discovered':
                  stratixEvent = { 
                    type: 'snippet', 
                    source: eventData.source_name,
                    url: eventData.source_url,
                    message: `Found: ${eventData.source_name}`
                  };
                  break;
                case 'research_progress':
                  stratixEvent = { 
                    type: 'thought', 
                    message: eventData.content_preview || 'Processing research data...' 
                  };
                  break;
                case 'synthesis_started':
                  stratixEvent = { 
                    type: 'status', 
                    status: 'synthesizing', 
                    message: 'Synthesizing insights...' 
                  };
                  break;
                case 'research_complete':
                  stratixEvent = { 
                    type: 'done', 
                    message: 'Research completed successfully',
                    content: eventData.final_answer 
                  };
                  break;
                default:
                  stratixEvent = { 
                    type: 'status', 
                    message: eventData.message || `Status: ${eventData.type}` 
                  };
              }

              controller.enqueue(`data: ${JSON.stringify({
                ...stratixEvent,
                timestamp: event.created_at
              })}\n\n`);

              lastEventId = Math.max(lastEventId, parseInt(event.id));
            }
          }

          // Check project status
          const { data: project } = await supabase
            .from('stratix_projects')
            .select('status, updated_at')
            .eq('id', projectId)
            .single();

          if (project) {
            // If project is done or error, close stream
            if (project.status === 'done' || project.status === 'error') {
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
      }, 1000); // Check every second for real-time updates

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