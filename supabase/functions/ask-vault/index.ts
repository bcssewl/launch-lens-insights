
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchRequest {
  query: string;
  clientId: string;
  limit?: number;
}

interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  source: 'content' | 'title' | 'metadata';
  fileType: string;
  relevanceScore: number;
  filePath: string;
  matchedFragment?: string;
  fileSize?: number;
  uploadDate?: string;
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

    const { query, clientId, limit = 10 }: SearchRequest = await req.json();

    if (!query || !clientId) {
      throw new Error('Query and clientId are required');
    }

    console.log(`Searching vault for client ${clientId} with query: "${query}"`);

    // Get user from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user } } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (!user) {
      throw new Error('Invalid authentication');
    }

    const results: SearchResult[] = [];

    // First, try semantic search using embeddings
    try {
      const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
      
      if (GOOGLE_AI_API_KEY) {
        console.log('Generating query embedding...');
        
        // Generate embedding for the search query
        const embeddingResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${GOOGLE_AI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'models/embedding-001',
              content: {
                parts: [{ text: query }]
              }
            })
          }
        );

        if (embeddingResponse.ok) {
          const embeddingData = await embeddingResponse.json();
          const queryEmbedding = embeddingData.embedding?.values;

          if (queryEmbedding && Array.isArray(queryEmbedding)) {
            console.log('Performing semantic search...');
            
            // Perform vector similarity search
            const { data: semanticResults, error: semanticError } = await supabaseClient.rpc('search_file_embeddings', {
              query_embedding: `[${queryEmbedding.join(',')}]`,
              client_id: clientId,
              user_id: user.id,
              match_threshold: 0.7,
              match_count: Math.floor(limit / 2)
            });

            if (!semanticError && semanticResults) {
              console.log(`Found ${semanticResults.length} semantic matches`);
              
              semanticResults.forEach((result: any) => {
                results.push({
                  id: result.file_id,
                  title: result.file_name,
                  snippet: result.chunk_text.substring(0, 200) + '...',
                  source: 'content',
                  fileType: result.file_type,
                  relevanceScore: 1 - result.similarity, // Convert distance to similarity
                  filePath: result.file_path,
                  matchedFragment: result.chunk_text,
                  fileSize: result.file_size,
                  uploadDate: result.upload_date
                });
              });
            }
          }
        }
      }
    } catch (error) {
      console.log('Semantic search failed, falling back to keyword search:', error);
    }

    // Add keyword-based search as fallback/supplement
    const keywordQuery = `%${query.toLowerCase()}%`;
    
    const { data: keywordResults, error: keywordError } = await supabaseClient
      .from('client_files')
      .select('*')
      .eq('client_id', clientId)
      .eq('user_id', user.id)
      .or(`file_name.ilike.${keywordQuery},file_content_text.ilike.${keywordQuery}`)
      .limit(limit - results.length);

    if (!keywordError && keywordResults) {
      console.log(`Found ${keywordResults.length} keyword matches`);
      
      keywordResults.forEach((file: any) => {
        // Avoid duplicates from semantic search
        if (!results.some(r => r.id === file.id)) {
          const snippet = file.file_content_text 
            ? file.file_content_text.substring(0, 200) + '...'
            : `${file.category || 'File'} • ${(file.file_size / 1024 / 1024).toFixed(2)} MB`;

          results.push({
            id: file.id,
            title: file.file_name,
            snippet,
            source: file.file_name.toLowerCase().includes(query.toLowerCase()) ? 'title' : 'content',
            fileType: file.file_type,
            relevanceScore: 0.5, // Default relevance for keyword matches
            filePath: file.file_path,
            fileSize: file.file_size,
            uploadDate: file.upload_date
          });
        }
      });
    }

    // Sort by relevance score (highest first)
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    console.log(`Returning ${results.length} total results`);

    return new Response(
      JSON.stringify({
        results: results.slice(0, limit),
        query,
        enhancedQuery: query, // Could be enhanced with AI later
        resultCount: results.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in ask-vault function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        results: [],
        resultCount: 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// Database function for semantic search (to be created via SQL)
/*
CREATE OR REPLACE FUNCTION search_file_embeddings(
  query_embedding vector(1536),
  client_id text,
  user_id uuid,
  match_threshold float DEFAULT 0.8,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  file_id uuid,
  file_name text,
  file_type text,
  file_path text,
  file_size int,
  upload_date timestamptz,
  chunk_text text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cf.id as file_id,
    cf.file_name,
    cf.file_type,
    cf.file_path,
    cf.file_size,
    cf.upload_date,
    fe.chunk_text,
    (1 - (fe.embedding <=> query_embedding)) as similarity
  FROM file_embeddings fe
  JOIN client_files cf ON fe.file_id = cf.id
  WHERE cf.client_id = search_file_embeddings.client_id
    AND cf.user_id = search_file_embeddings.user_id
    AND (1 - (fe.embedding <=> query_embedding)) > match_threshold
  ORDER BY fe.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
*/
