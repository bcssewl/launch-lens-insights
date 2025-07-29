import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PodcastRequest {
  content: string;
  voice?: string;
  format?: string;
  speed?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { content, voice = 'alloy', format = 'mp3', speed = 1.0 }: PodcastRequest = await req.json()

    if (!content) {
      throw new Error('Content is required')
    }

    // For now, return a mock response since API key is not yet configured
    // TODO: Replace with actual ElevenLabs API call when API key is added
    
    console.log('Podcast generation requested for content length:', content.length)
    console.log('Voice:', voice, 'Format:', format, 'Speed:', speed)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Return mock response
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'ElevenLabs API key not configured. Please add your API key to generate podcasts.',
        mockGenerated: true
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

    /* 
    // TODO: Uncomment when ElevenLabs API key is added
    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')
    
    if (!elevenLabsApiKey) {
      throw new Error('ElevenLabs API key not configured')
    }

    // Generate speech from text using ElevenLabs
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
      body: JSON.stringify({
        text: content,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          speed: speed,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`ElevenLabs API error: ${error}`)
    }

    // Return the audio data
    const audioData = await response.arrayBuffer()
    
    return new Response(audioData, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'attachment; filename="podcast.mp3"',
      },
    })
    */
  } catch (error) {
    console.error('Podcast generation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})