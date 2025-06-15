
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { type, ...payload } = await req.json()
    
    let webhookUrl = ''
    let requestBody = {}

    if (type === 'validation') {
      // Original validation webhook
      webhookUrl = Deno.env.get('N8N_WEBHOOK_URL') ?? ''
      requestBody = payload
    } else if (type === 'audio') {
      // Audio recording webhook
      webhookUrl = 'https://n8n-launchlens.botica.it.com/webhook/voice-transcribe-form'
      requestBody = {
        voice_url: payload.voice_url,
        recording_id: payload.recording_id,
        user_id: payload.user_id,
        file_name: payload.file_name,
        duration_seconds: payload.duration_seconds
      }
    } else if (type === 'pitch_deck') {
      // Pitch deck upload webhook
      webhookUrl = 'https://n8n-launchlens.botica.it.com/webhook/presentation-transcribe-form'
      requestBody = {
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
    console.log('Request body:', requestBody)

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
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
