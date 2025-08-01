import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

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
    const { message, user, session_id, client_message_id } = await req.json();
    
    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Extract the auth token from the request headers
    const authHeader = req.headers.get('authorization');
    const authToken = authHeader?.replace('Bearer ', '') || null;

    if (!authToken) {
      return new Response(
        JSON.stringify({ error: 'Authentication token is required' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate the token using our validate-token function
    const validateResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/validate-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
      },
      body: JSON.stringify({ token: authToken }),
    });

    const validationResult = await validateResponse.json();

    if (!validationResult.is_valid) {
      console.error('Token validation failed:', validationResult.error);
      return new Response(
        JSON.stringify({ error: validationResult.error || 'Invalid authentication token' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const authenticatedUser = validationResult.user;

    // Verify that the user info matches the authenticated user
    if (user && user.id !== authenticatedUser.id) {
      return new Response(
        JSON.stringify({ error: 'User ID mismatch' }), 
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Authenticated user:', authenticatedUser.id, authenticatedUser.email);
    console.log('Client message ID:', client_message_id);
    
    // Initialize Supabase client for saving to chat history
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
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

    console.log('Sending request to n8n webhook:', webhookUrl);
    
    // Prepare the request body
    const requestBody = {
      user: {
        id: authenticatedUser.id,
        email: authenticatedUser.email,
        full_name: authenticatedUser.full_name,
        created_at: authenticatedUser.created_at
      },
      auth_token: authToken,
      timestamp: new Date().toISOString(),
      metadata: {
        source: 'ai_assistant',
        function_origin: 'supabase_edge_function',
        authenticated: true,
      },
      type: 'chat_message',
      message: message,
      session_id: session_id || null,
      client_message_id: client_message_id || null,
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`N8N webhook responded with status: ${response.status}`, errorText);
      throw new Error(`N8N webhook responded with status: ${response.status}`);
    }

    const responseText = await response.text();
    console.log('N8n webhook raw response:', responseText);

    if (!responseText || responseText.trim() === '') {
      throw new Error('Empty response from N8N webhook');
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.log('Response is not JSON, treating as plain text');
      data = { response: responseText };
    }

    console.log('Received response from n8n:', data);

    // Extract the response from the n8n response
    const responseMessage = data.response || data.message || 'No response received from service.';

    // Save the AI response to chat history with client_message_id correlation
    if (session_id && client_message_id) {
      try {
        const { error: historyError } = await supabase
          .from('n8n_chat_history')
          .insert([
            {
              session_id: session_id,
              message: `AI: ${responseMessage}`,
              client_message_id: client_message_id,
            }
          ]);

        if (historyError) {
          console.error('Error saving AI response to history:', historyError);
        } else {
          console.log('Successfully saved AI response to history with client_message_id:', client_message_id);
        }
      } catch (saveError) {
        console.error('Error saving AI response to chat history:', saveError);
      }
    }

    return new Response(
      JSON.stringify({ 
        response: responseMessage,
        client_message_id: client_message_id // Return the client message ID for correlation
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in n8n-chat-webhook function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to communicate with N8N webhook',
        details: error.message 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});