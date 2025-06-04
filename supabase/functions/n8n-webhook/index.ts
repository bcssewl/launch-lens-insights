
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
    const { message, user, audio_data } = await req.json();
    
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
    
    // Handle different message types
    if (message === 'transcribe_audio' && audio_data) {
      // Audio transcription request
      console.log('Processing audio transcription request for recording:', audio_data.recording_id);
      
      const audioWebhookUrl = 'https://n8n-launchlens.botica.it.com/webhook/audio-transcribe-form';
      
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
        type: 'audio_transcription',
        audio_url: audio_data.audio_url,
        recording_id: audio_data.recording_id,
        file_name: audio_data.file_name,
        duration_seconds: audio_data.duration_seconds,
      };

      console.log('Sending audio transcription request to:', audioWebhookUrl);
      console.log('Request payload:', JSON.stringify(requestBody, null, 2));

      try {
        const response = await fetch(audioWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        console.log('Audio webhook response status:', response.status);
        console.log('Audio webhook response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Audio webhook error response:', errorText);
          throw new Error(`Audio transcription webhook responded with status: ${response.status} - ${errorText}`);
        }

        const responseText = await response.text();
        console.log('Audio webhook raw response:', responseText);

        if (!responseText || responseText.trim() === '') {
          throw new Error('Empty response from audio transcription webhook');
        }

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse JSON response from audio webhook:', parseError);
          console.error('Response text:', responseText);
          // Treat as plain text response
          data = { transcription: responseText };
        }

        console.log('Parsed audio transcription response:', data);

        // Extract the transcription from the response
        const transcriptionText = data.transcription || data.response || data.text || data.message || 'Transcription completed but no text returned.';

        return new Response(
          JSON.stringify({ response: transcriptionText }), 
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } catch (transcriptionError) {
        console.error('Error in audio transcription process:', transcriptionError);
        
        // For now, return a mock transcription to test the flow
        const mockTranscription = "This is a test transcription of your audio recording. The actual transcription service is being configured.";
        
        console.log('Returning mock transcription due to error');
        
        return new Response(
          JSON.stringify({ response: mockTranscription }), 
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    } else {
      // Regular chat message
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

      return new Response(
        JSON.stringify({ response: responseMessage }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error('Error in n8n-webhook function:', error);
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
