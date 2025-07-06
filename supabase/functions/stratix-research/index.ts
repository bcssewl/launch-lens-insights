import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { stepType, query, stepName, previousResult } = await req.json();
    
    console.log(`Stratix Research Step: ${stepName} for query: ${query}`);

    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Create specialized prompt for each research step
    let systemPrompt = getSystemPromptForStep(stepType);
    let userPrompt = buildUserPrompt(query, stepName, previousResult);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    const result = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      result,
      stepType,
      stepName,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Stratix Research Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      result: `Research step encountered an issue: ${error.message}`
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getSystemPromptForStep(stepType: string): string {
  const basePrompt = "You are Stratix, an elite research agent specializing in deep consulting-level analysis. You excel at multi-dimensional strategic research and provide actionable business insights.";
  
  switch (stepType) {
    case 'analyze-and-plan':
      return `${basePrompt} Your task is to analyze the research query and create a strategic research plan. Break down complex queries into research vectors, identify key stakeholders, and outline methodology.`;
    
    case 'gather-data':
      return `${basePrompt} Your task is to systematically gather relevant information from multiple perspectives. Focus on market dynamics, competitive landscape, regulatory factors, and industry best practices.`;
    
    case 'analyze-synthesize':
      return `${basePrompt} Your task is to synthesize gathered information using strategic frameworks. Identify patterns, correlations, and strategic implications. Apply consulting methodologies for deep analysis.`;
    
    case 'generate-insights':
      return `${basePrompt} Your task is to generate strategic insights and actionable recommendations. Focus on practical implementation, risk mitigation, and success factors.`;
    
    case 'executive-summary':
      return `${basePrompt} Your task is to create an executive summary with clear action plans. Provide strategic recommendations, timeline, and key performance indicators.`;
    
    default:
      return basePrompt;
  }
}

function buildUserPrompt(query: string, stepName: string, previousResult?: string): string {
  let prompt = `Research Query: "${query}"\nCurrent Step: ${stepName}\n\n`;
  
  if (previousResult) {
    prompt += `Previous Research Results:\n${previousResult}\n\nBuild upon these findings for the current step.\n\n`;
  }
  
  prompt += "Please provide comprehensive analysis appropriate for this research step. Focus on actionable insights and strategic value.";
  
  return prompt;
}