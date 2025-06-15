
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role for admin access
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the Authorization header to validate the user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Extract the JWT token
    const token = authHeader.replace('Bearer ', '')
    
    // Verify the user with the token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Authentication failed:', authError)
      throw new Error('Invalid or expired token')
    }

    console.log('Authenticated user:', user.id, user.email)

    const requestBody = await req.json()
    const { type, user: userInfo, ...payload } = requestBody
    
    let webhookUrl = ''
    let webhookPayload = {}

    if (type === 'validation') {
      // Original validation webhook
      webhookUrl = Deno.env.get('N8N_WEBHOOK_URL') ?? ''
      webhookPayload = {
        user: userInfo || {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || null,
          created_at: user.created_at
        },
        auth_token: token,
        ...payload
      }
    } else if (type === 'audio') {
      // Audio recording webhook
      webhookUrl = 'https://n8n-launchlens.botica.it.com/webhook/voice-transcribe-form'
      webhookPayload = {
        user: userInfo || {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || null,
          created_at: user.created_at
        },
        auth_token: token,
        voice_url: payload.voice_url,
        recording_id: payload.recording_id,
        user_id: payload.user_id,
        file_name: payload.file_name,
        duration_seconds: payload.duration_seconds
      }
    } else if (type === 'pitch_deck') {
      // Pitch deck upload webhook
      webhookUrl = 'https://n8n-launchlens.botica.it.com/webhook/presentation-transcribe-form'
      webhookPayload = {
        user: userInfo || {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || null,
          created_at: user.created_at
        },
        auth_token: token,
        file_url: payload.file_url,
        upload_id: payload.upload_id,
        user_id: payload.user_id,
        file_name: payload.file_name,
        file_type: payload.file_type
      }
    } else {
      throw new Error('Unknown webhook type')
    }

    console.log(`Sending ${type} webhook to:`, webhookUrl)
    console.log('Request body:', webhookPayload)

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Webhook failed with status: ${response.status}, body: ${errorText}`)
      throw new Error(`Webhook failed with status: ${response.status}`)
    }

    const result = await response.json()
    console.log('Webhook response:', result)

    return new Response(
      JSON.stringify({ success: true, result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
