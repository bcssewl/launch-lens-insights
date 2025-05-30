
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, user } = await req.json();
    
    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const webhookUrl = Deno.env.get('N8N_WEBHOOK_URL');
    
    if (!webhookUrl) {
      console.error('N8N_WEBHOOK_URL not configured in secrets');
      return new Response(
        JSON.stringify({ error: 'N8N webhook URL not configured' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Extract the auth token from the request headers
    const authHeader = req.headers.get('authorization');
    const authToken = authHeader?.replace('Bearer ', '') || null;

    console.log('Sending message to n8n webhook:', webhookUrl);
    console.log('User info:', user);
    console.log('Auth token present:', !!authToken);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'chat_message',
        message: message,
        user: user,
        auth_token: authToken,
        timestamp: new Date().toISOString(),
        metadata: {
          source: 'ai_assistant',
          function_origin: 'supabase_edge_function',
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`N8N webhook responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received response from n8n:', data);

    // Extract the AI response from the n8n response
    const aiResponse = data.response || data.message || 'I received your message but couldn\'t generate a response.';

    return new Response(
      JSON.stringify({ response: aiResponse }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in n8n-webhook function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to communicate with N8N webhook' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
