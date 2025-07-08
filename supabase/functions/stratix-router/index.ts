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
    
    console.log('Stratix Router: Processing request', { prompt, sessionId, deepDive });

    // Get user ID from session
    const userId = await getUserIdFromSession(supabase, sessionId);
    
    // Determine if this is a research request or simple conversation
    const isResearchRequest = await classifyRequest(prompt);
    
    if (!isResearchRequest) {
      // Handle as simple conversation
      console.log('Stratix Router: Handling as simple conversation');
      const conversationalResponse = await generateConversationalResponse(supabase, prompt, sessionId);
      
      return new Response(JSON.stringify({
        type: 'conversation',
        response: conversationalResponse
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create a new Stratix project for research request
    const { data: project, error: projectError } = await supabase
      .from('stratix_projects')
      .insert({
        title: prompt.slice(0, 100) + (prompt.length > 100 ? '...' : ''),
        status: 'running',
        deep_dive: deepDive,
        user_id: userId,
        prompt_snapshot: await assembleSystemPrompt(supabase, prompt)
      })
      .select()
      .single();

    if (projectError) {
      console.error('Error creating Stratix project:', projectError);
      throw new Error('Failed to create research project');
    }

    console.log('Created Stratix project:', project.id);

    // Store conversation context
    await supabase
      .from('stratix_conversations')
      .insert({
        session_id: sessionId,
        project_id: project.id,
        conversation_context: { original_prompt: prompt, timestamp: new Date().toISOString() }
      });

    // Start the research process in background
    const workerPayload = {
      projectId: project.id,
      prompt: prompt,
      deepDive: deepDive,
      sessionId: sessionId
    };

    // Invoke the background worker
    supabase.functions.invoke('stratix-worker', {
      body: workerPayload
    }).catch(error => {
      console.error('Error invoking stratix-worker:', error);
    });

    // Return immediate conversational acknowledgment
    const acknowledgment = generateAcknowledgment(prompt);

    return new Response(JSON.stringify({
      type: 'research',
      projectId: project.id,
      acknowledgment: acknowledgment,
      streamUrl: `/functions/v1/stratix-stream/${project.id}`
    }), {
      status: 202,
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

async function classifyRequest(prompt: string): Promise<boolean> {
  // Simple heuristics to determine if request needs research
  const researchKeywords = [
    'market', 'TAM', 'competitor', 'analysis', 'research', 'estimate', 'forecast',
    'industry', 'trends', 'size', 'growth', 'CAGR', 'revenue', 'share',
    'benchmark', 'landscape', 'opportunity', 'potential', 'valuation'
  ];

  const chitChatKeywords = [
    'hi', 'hello', 'how are you', 'what can you do', 'help', 'thanks', 'goodbye'
  ];

  const lowerPrompt = prompt.toLowerCase();
  
  // Check for chit-chat first
  if (chitChatKeywords.some(keyword => lowerPrompt.includes(keyword)) && prompt.length < 50) {
    return false;
  }
  
  // Check for research keywords
  return researchKeywords.some(keyword => lowerPrompt.includes(keyword)) || prompt.length > 100;
}

async function generateConversationalResponse(supabase: any, prompt: string, sessionId: string): Promise<string> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    return "Hello! I'm Stratix, your business research consultant. I can help you with market analysis, competitive intelligence, and strategic insights. What would you like to research today?";
  }

  try {
    // Get conversation context
    const { data: context } = await supabase
      .from('stratix_conversations')
      .select('conversation_context')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(3);

    const contextPrompt = context?.length > 0 
      ? `Previous conversation context: ${JSON.stringify(context)}\n\n`
      : '';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are Stratix, an elite business research consultant. For simple greetings and questions, respond conversationally and helpfully. Keep responses concise and professional. If the user asks about research capabilities, mention you can help with market analysis, competitive intelligence, TAM estimation, and strategic insights.'
          },
          {
            role: 'user',
            content: contextPrompt + prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices[0].message.content;
    }
  } catch (error) {
    console.error('Error generating conversational response:', error);
  }

  // Fallback responses
  if (prompt.toLowerCase().includes('help') || prompt.toLowerCase().includes('what can you do')) {
    return "I'm Stratix, your business research consultant. I can help you with:\n\n• Market size estimation and TAM analysis\n• Competitive landscape research\n• Industry trend forecasting\n• Strategic recommendations\n• Regulatory landscape assessment\n\nJust ask me something like 'Estimate the 2028 TAM for European e-scooters' or 'Analyze the top competitors in the fintech space.'";
  }

  return "Hello! I'm here to help with your business research needs. What market or industry would you like me to analyze?";
}

async function assembleSystemPrompt(supabase: any, userPrompt: string): Promise<string> {
  // Get all prompt slots
  const { data: prompts } = await supabase
    .from('stratix_prompts')
    .select('slot, content')
    .order('slot');

  if (!prompts || prompts.length === 0) {
    return `You are Stratix, an elite business research consultant. User query: ${userPrompt}`;
  }

  const promptMap = Object.fromEntries(prompts.map((p: any) => [p.slot, p.content]));
  
  const assembledPrompt = [
    promptMap.core || '',
    promptMap.rules || '',
    promptMap.style || '',
    promptMap.custom || '',
    `\nUser Query: ${userPrompt}`
  ].filter(Boolean).join('\n\n');

  return assembledPrompt;
}

function generateAcknowledgment(prompt: string): string {
  const acknowledgments = [
    "I'll analyze that for you right away. Let me gather the latest market intelligence...",
    "Great question! I'm diving into comprehensive research on this topic...",
    "I'll provide you with detailed market analysis. Starting my research now...",
    "Excellent research request. Let me compile the most current data for you...",
    "I'm on it! Accessing multiple data sources to give you accurate insights..."
  ];
  
  return acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
}

