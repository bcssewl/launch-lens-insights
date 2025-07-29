import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface DeerStreamRequest {
  content?: string;
  thread_id: string;
  interrupt_feedback?: string;
  resources?: Array<{
    id: string;
    type: string;
    content: string;
  }>;
  auto_accepted_plan?: boolean;
  enable_deep_thinking?: boolean;
  enable_background_investigation?: boolean;
  max_plan_iterations?: number;
  max_step_num?: number;
  max_search_results?: number;
  report_style?: string;
  mcp_settings?: any;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Extract auth token
    const authHeader = req.headers.get('authorization');
    const authToken = authHeader?.replace('Bearer ', '');

    if (!authToken) {
      return new Response(
        JSON.stringify({ error: 'Authentication token is required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const validateResponse = await fetch(`${supabaseUrl}/functions/v1/validate-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ token: authToken }),
    });

    const validationResult = await validateResponse.json();
    if (!validationResult.is_valid) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const user = validationResult.user;
    const requestData: DeerStreamRequest = await req.json();

    console.log('DeerFlow stream request:', {
      user_id: user.id,
      content: requestData.content?.slice(0, 100),
      thread_id: requestData.thread_id,
      interrupt_feedback: requestData.interrupt_feedback
    });

    // Set up Server-Sent Events stream
    const stream = new ReadableStream({
      start(controller) {
        startDeerFlowStream(controller, requestData, user);
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

  } catch (error) {
    console.error('DeerFlow stream error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to start stream', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function startDeerFlowStream(
  controller: ReadableStreamDefaultController,
  request: DeerStreamRequest,
  user: any
) {
  try {
    // Generate unique message IDs
    const generateId = () => crypto.randomUUID();
    
    // Send events in proper DeerFlow format
    const sendEvent = (type: string, data: any) => {
      const event = { type, data };
      controller.enqueue(`data: ${JSON.stringify(event)}\n\n`);
    };

    // If no interrupt feedback, provide basic assistant response
    if (!request.interrupt_feedback) {
      const messageId = generateId();
      
      // Start basic assistant message
      sendEvent('message_start', {
        id: messageId,
        thread_id: request.thread_id,
        role: 'assistant',
        content: ''
      });

      let responseContent = '';
      if (request.content?.toLowerCase().includes('research') || request.content?.toLowerCase().includes('analyze')) {
        responseContent = 'I can help you with research and analysis. Let me create a comprehensive plan for this.';
      } else {
        responseContent = `I understand you're asking about: "${request.content}". I'm here to help with research, analysis, and answering your questions.`;
      }

      // Stream response content
      for (const char of responseContent) {
        sendEvent('message_chunk', {
          id: messageId,
          thread_id: request.thread_id,
          content: char
        });
        await new Promise(resolve => setTimeout(resolve, 20));
      }

      sendEvent('message_end', {
        id: messageId,
        thread_id: request.thread_id,
        isStreaming: false
      });

      // For research queries, also send planner response
      if (request.content?.toLowerCase().includes('research') || request.content?.toLowerCase().includes('analyze')) {
        await generatePlannerResponse(sendEvent, request);
      }
    }

    // Handle plan acceptance and research flow
    if (request.interrupt_feedback === 'accepted') {
      await startResearchAgents(sendEvent, request);
    }

    // Close the stream
    controller.close();

  } catch (error) {
    console.error('Stream generation error:', error);
    controller.enqueue(`data: ${JSON.stringify({
      type: 'error',
      data: { error: error.message }
    })}\n\n`);
    controller.close();
  }
}

async function generatePlannerResponse(sendEvent: Function, request: DeerStreamRequest) {
  const plannerMessageId = crypto.randomUUID();
  
  sendEvent('message_start', {
    id: plannerMessageId,
    thread_id: request.thread_id,
    role: 'assistant',
    agent: 'planner',
    content: ''
  });

  const planContent = JSON.stringify({
    title: 'Research Analysis Plan',
    thought: 'I need to create a comprehensive research plan for this topic.',
    steps: [
      {
        title: 'Initial Research',
        description: 'Gather basic information about the topic',
        step_type: 'research',
        need_web_search: true
      },
      {
        title: 'Analysis',
        description: 'Analyze the gathered information',
        step_type: 'processing',
        need_web_search: false
      }
    ]
  });

  // Stream plan content
  for (let i = 0; i < planContent.length; i += 10) {
    const chunk = planContent.slice(i, i + 10);
    sendEvent('message_chunk', {
      id: plannerMessageId,
      thread_id: request.thread_id,
      content: chunk
    });
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  sendEvent('message_end', {
    id: plannerMessageId,
    thread_id: request.thread_id,
    isStreaming: false,
    options: [
      { text: 'Accept Plan', value: 'accepted' },
      { text: 'Modify Plan', value: 'modify' },
      { text: 'Reject Plan', value: 'reject' }
    ]
  });
}

async function startResearchAgents(sendEvent: Function, request: DeerStreamRequest) {
  // Simulate researcher agent
  const researcherId = crypto.randomUUID();
  sendEvent('message_start', {
    id: researcherId,
    thread_id: request.thread_id,
    role: 'assistant',
    agent: 'researcher',
    content: ''
  });

  const researchContent = 'Starting comprehensive research on the topic...';
  for (const char of researchContent) {
    sendEvent('message_chunk', {
      id: researcherId,
      thread_id: request.thread_id,
      content: char
    });
    await new Promise(resolve => setTimeout(resolve, 30));
  }

  sendEvent('message_end', {
    id: researcherId,
    thread_id: request.thread_id,
    isStreaming: false
  });

  // Simulate reporter agent
  const reporterId = crypto.randomUUID();
  sendEvent('message_start', {
    id: reporterId,
    thread_id: request.thread_id,
    role: 'assistant',
    agent: 'reporter',
    content: ''
  });

  const reportContent = '# Research Report\n\nBased on the research conducted, here are the key findings...\n\n## Summary\n\nThe analysis reveals important insights about the topic.';
  for (let i = 0; i < reportContent.length; i += 5) {
    const chunk = reportContent.slice(i, i + 5);
    sendEvent('message_chunk', {
      id: reporterId,
      thread_id: request.thread_id,
      content: chunk
    });
    await new Promise(resolve => setTimeout(resolve, 40));
  }

  sendEvent('message_end', {
    id: reporterId,
    thread_id: request.thread_id,
    isStreaming: false
  });
}