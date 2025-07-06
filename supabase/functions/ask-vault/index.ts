
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory cache with TTL
class SimpleCache {
  private cache = new Map<string, { data: any; expires: number }>();
  
  set(key: string, data: any, ttlMinutes: number = 10) {
    const expires = Date.now() + (ttlMinutes * 60 * 1000);
    this.cache.set(key, { data, expires });
  }
  
  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  // Clean expired entries periodically
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
  }
}

const cache = new SimpleCache();

// Cleanup expired cache entries every 5 minutes
setInterval(() => cache.cleanup(), 5 * 60 * 1000);

interface AskVaultRequest {
  query: string;
  clientId: string;
}

async function generateQueryEmbedding(query: string): Promise<number[]> {
  const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
  if (!GOOGLE_AI_API_KEY) {
    throw new Error('Google AI API key not configured');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${GOOGLE_AI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/embedding-001',
        content: { parts: [{ text: query }] }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to generate query embedding: ${response.status}`);
  }

  const data = await response.json();
  return data.embedding?.values || [];
}

async function searchSimilarChunks(supabaseClient: any, queryEmbedding: number[], clientId: string, userId: string) {
  const { data, error } = await supabaseClient.rpc('search_file_embeddings', {
    query_embedding: `[${queryEmbedding.join(',')}]`,
    client_id: clientId,
    user_id: userId,
    match_threshold: 0.7,
    match_count: 6
  });

  if (error) {
    console.error('Error searching embeddings:', error);
    throw error;
  }

  return data || [];
}

async function generateStreamingResponse(query: string, context: string, citations: any[]) {
  const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
  
  const prompt = `You are a helpful AI assistant that answers questions based on the provided context from uploaded files.

Context from files:
${context}

Question: ${query}

Instructions:
- Answer the question using only the information provided in the context
- If you can't find relevant information in the context, say so clearly
- Be concise and accurate
- Include relevant details from the source files when helpful
- Do not make up information that isn't in the context

Answer:`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${GOOGLE_AI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    }
  );

  return response;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Extract user from JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Invalid authentication');
    }

    const { query, clientId }: AskVaultRequest = await req.json();

    if (!query || !clientId) {
      throw new Error('Query and clientId are required');
    }

    // Generate cache key
    const cacheKey = `${query}|${clientId}|${user.id}`;
    
    // Check cache first
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      console.log('Cache hit for query:', query);
      return new Response(
        JSON.stringify({
          answer: cachedResult.answer,
          citations: cachedResult.citations,
          cached: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Cache miss - processing query:', query);

    // Generate query embedding
    const queryEmbedding = await generateQueryEmbedding(query);
    
    // Search for similar chunks
    const similarChunks = await searchSimilarChunks(supabaseClient, queryEmbedding, clientId, user.id);
    
    if (similarChunks.length === 0) {
      return new Response(
        JSON.stringify({
          answer: "I couldn't find any relevant information in the uploaded files to answer your question.",
          citations: [],
          cached: false
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Build context and citations
    const context = similarChunks
      .map((chunk: any, index: number) => 
        `[${index + 1}] From "${chunk.file_name}": ${chunk.chunk_text}`
      )
      .join('\n\n');

    const citations = similarChunks.map((chunk: any) => ({
      id: chunk.file_id,
      title: chunk.file_name,
      snippet: chunk.chunk_text.substring(0, 200) + '...',
      source: 'content',
      fileType: chunk.file_type,
      relevanceScore: chunk.similarity,
      filePath: chunk.file_path,
      matchedFragment: chunk.chunk_text.substring(0, 150) + '...',
      fileSize: chunk.file_size,
      uploadDate: chunk.upload_date
    }));

    // Check if streaming is requested
    const acceptHeader = req.headers.get('Accept') || '';
    const wantsStream = acceptHeader.includes('text/stream') || req.url.includes('stream=true');

    if (wantsStream) {
      // Streaming response
      const geminiResponse = await generateStreamingResponse(query, context, citations);
      
      if (!geminiResponse.ok) {
        throw new Error(`Streaming API error: ${geminiResponse.status}`);
      }

      // Create a transform stream to process the Gemini streaming response
      const readable = new ReadableStream({
        async start(controller) {
          const reader = geminiResponse.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }

          let fullAnswer = '';

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = new TextDecoder().decode(value);
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6));
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    if (text) {
                      fullAnswer += text;
                      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text, citations })}\n\n`));
                    }
                  } catch (e) {
                    // Skip invalid JSON
                  }
                }
              }
            }

            // Cache the complete answer
            if (fullAnswer) {
              cache.set(cacheKey, { answer: fullAnswer, citations }, 10);
            }

            controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          } catch (error) {
            console.error('Streaming error:', error);
          } finally {
            controller.close();
          }
        }
      });

      return new Response(readable, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Non-streaming response
      const geminiResponse = await generateStreamingResponse(query, context, citations);
      
      if (!geminiResponse.ok) {
        throw new Error(`API error: ${geminiResponse.status}`);
      }

      // Process the streaming response to get the full answer
      const reader = geminiResponse.body?.getReader();
      let fullAnswer = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                fullAnswer += text;
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      // Cache the result
      cache.set(cacheKey, { answer: fullAnswer, citations }, 10);

      return new Response(
        JSON.stringify({
          answer: fullAnswer,
          citations,
          cached: false
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

  } catch (error) {
    console.error('Error in ask-vault function:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        answer: '',
        citations: []
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
