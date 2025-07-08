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
        title: prompt.slice(0, 100) + (prompt.length > 100 ? '...' : ''),
        status: 'running',
        deep_dive: deepDive,
        user_id: await getUserIdFromSession(supabase, sessionId)
      })
      .select()
      .single();

    if (projectError) {
      console.error('Error creating Stratix project:', projectError);
      throw new Error('Failed to create research project');
    }

    console.log('Created Stratix project:', project.id);

    // Start the research process in the background
    EdgeRuntime.waitUntil(processStratixResearch(supabase, project.id!, prompt, deepDive));

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

async function processStratixResearch(
  supabase: any, 
  projectId: string, 
  prompt: string, 
  deepDive: boolean
) {
  try {
    console.log('Starting Stratix research process for:', projectId);
    
    // Update status to running
    await supabase
      .from('stratix_projects')
      .update({ status: 'running' })
      .eq('id', projectId);

    // Stream thinking event
    await broadcastThinkingEvent(supabase, projectId, 'search', {
      message: 'Analyzing research requirements and planning data collection strategy...',
      queries: extractSearchQueries(prompt)
    });

    // Perform research across multiple APIs
    const results = await performResearch(supabase, projectId, prompt, deepDive);
    
    // Stream synthesis event
    await broadcastThinkingEvent(supabase, projectId, 'thought', {
      message: 'Synthesizing findings and cross-referencing sources...',
      confidence: calculateOverallConfidence(results)
    });

    // Generate final formatted response
    const finalResponse = await synthesizeResponse(supabase, projectId, results, deepDive);
    
    // Stream completion event
    await broadcastThinkingEvent(supabase, projectId, 'done', {
      message: 'Research complete',
      response: finalResponse
    });

    // Update project status
    await supabase
      .from('stratix_projects')
      .update({ status: 'done' })
      .eq('id', projectId);

    console.log('Stratix research completed for:', projectId);

  } catch (error) {
    console.error('Stratix research error:', error);
    
    await broadcastThinkingEvent(supabase, projectId, 'error', {
      message: `Research failed: ${error.message}`,
      error: error.message
    });

    await supabase
      .from('stratix_projects')
      .update({ status: 'needs_review' })
      .eq('id', projectId);
  }
}

function extractSearchQueries(prompt: string): string[] {
  // Simple query extraction - in production, use NLP
  const queries = [
    `market analysis ${prompt}`,
    `industry trends ${prompt}`,
    `competitor research ${prompt}`,
    `financial data ${prompt}`
  ];
  return queries.slice(0, 3); // Limit to 3 initial queries
}

async function performResearch(
  supabase: any, 
  projectId: string, 
  prompt: string, 
  deepDive: boolean
): Promise<APIResponse[]> {
  const results: APIResponse[] = [];
  
  // Mock research results - replace with actual API calls
  const mockResults = await generateMockResearchData(prompt, deepDive);
  
  for (const result of mockResults) {
    // Store result in database
    const { data: dbResult } = await supabase
      .from('stratix_results')
      .insert({
        project_id: projectId,
        section: result.section,
        content: result.content,
        confidence: result.confidence,
        provisional: result.confidence < 0.7
      })
      .select()
      .single();

    // Store citations
    for (const citation of result.citations) {
      await supabase
        .from('stratix_citations')
        .insert({
          result_id: dbResult.id,
          citation_key: citation.key,
          title: citation.title,
          url: citation.url,
          weight: citation.weight
        });
    }

    // Stream snippet event
    await broadcastThinkingEvent(supabase, projectId, 'snippet', {
      message: `Found ${result.section} data`,
      snippet: result.content.summary || 'Data collected',
      source: result.source_meta.source,
      confidence: result.confidence
    });

    results.push(result);
  }

  return results;
}

async function generateMockResearchData(prompt: string, deepDive: boolean) {
  // Mock data structure - replace with real API integration
  return [
    {
      section: 'market_size',
      content: {
        summary: `Market analysis for ${prompt}`,
        data: { size: '$2.4B', growth: '15.2%', year: '2024' },
        insights: ['Growing demand', 'Emerging technologies', 'Regulatory support']
      },
      confidence: 0.85,
      source_meta: { source: 'industry_reports', timestamp: new Date().toISOString(), confidence: 0.85 },
      citations: [
        { key: '[1]', title: 'Industry Report 2024', url: 'https://example.com/report', weight: 1.0 }
      ]
    },
    {
      section: 'competitor_analysis', 
      content: {
        summary: `Competitive landscape for ${prompt}`,
        data: { leaders: ['CompanyA', 'CompanyB'], market_share: { CompanyA: '25%', CompanyB: '18%' } },
        insights: ['Market fragmentation', 'Innovation focus', 'Price competition']
      },
      confidence: 0.78,
      source_meta: { source: 'crunchbase', timestamp: new Date().toISOString(), confidence: 0.78 },
      citations: [
        { key: '[2]', title: 'Market Analysis Q4 2024', url: 'https://example.com/analysis', weight: 0.9 }
      ]
    }
  ];
}

function calculateOverallConfidence(results: APIResponse[]): number {
  if (results.length === 0) return 0;
  return results.reduce((sum, r) => sum + r.source_meta.confidence, 0) / results.length;
}

async function synthesizeResponse(
  supabase: any,
  projectId: string, 
  results: APIResponse[], 
  deepDive: boolean
): Promise<string> {
  // Simple synthesis - in production, use GPT-4o
  let response = "# Research Summary\n\n";
  
  for (const result of results) {
    response += `## ${result.section.replace('_', ' ').toUpperCase()}\n\n`;
    response += `${result.content.summary}\n\n`;
    
    if (result.content.data) {
      response += "**Key Metrics:**\n";
      for (const [key, value] of Object.entries(result.content.data)) {
        response += `- ${key}: ${value}\n`;
      }
      response += "\n";
    }
    
    if (result.content.insights) {
      response += "**Key Insights:**\n";
      for (const insight of result.content.insights) {
        response += `- ${insight}\n`;
      }
      response += "\n";
    }
    
    response += `*Confidence: ${Math.round(result.confidence * 100)}%*\n\n`;
  }
  
  return response;
}

async function broadcastThinkingEvent(
  supabase: any,
  projectId: string,
  eventType: string,
  payload: any
) {
  // In a real implementation, this would broadcast to SSE clients
  // For now, we'll just log the thinking events
  console.log(`Stratix Thinking [${projectId}] ${eventType}:`, payload);
  
  // Could store thinking events in a separate table for debugging
  // or broadcast via Supabase realtime channels
}