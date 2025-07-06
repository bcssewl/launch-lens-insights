
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChunkEmbeddingRequest {
  fileId: string;
  textChunks: string[];
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

    const { fileId, textChunks }: ChunkEmbeddingRequest = await req.json();

    if (!fileId || !textChunks || !Array.isArray(textChunks)) {
      throw new Error('Invalid request: fileId and textChunks are required');
    }

    console.log(`Processing ${textChunks.length} chunks for file ${fileId}`);

    // Verify user owns the file
    const { data: fileData, error: fileError } = await supabaseClient
      .from('client_files')
      .select('id, user_id, file_name')
      .eq('id', fileId)
      .eq('user_id', user.id)
      .single();

    if (fileError || !fileData) {
      console.error('File verification error:', fileError);
      throw new Error('File not found or access denied');
    }

    // Update file status to processing
    await supabaseClient
      .from('client_files')
      .update({ 
        embedding_status: 'processing',
        total_chunks: textChunks.length 
      })
      .eq('id', fileId);

    const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
    if (!GOOGLE_AI_API_KEY) {
      throw new Error('Google AI API key not configured');
    }

    let successCount = 0;
    let errorCount = 0;

    // Process chunks in batches to avoid overwhelming the API
    const BATCH_SIZE = 3; // Reduced batch size to be more conservative
    const embeddings: Array<{ chunkIndex: number; chunkText: string; embedding: number[] }> = [];

    for (let i = 0; i < textChunks.length; i += BATCH_SIZE) {
      const batch = textChunks.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(async (chunk, batchIndex) => {
        const chunkIndex = i + batchIndex;
        
        try {
          console.log(`Processing chunk ${chunkIndex + 1}/${textChunks.length}`);
          
          // Ensure chunk is not empty and has reasonable length
          const cleanChunk = chunk.trim();
          if (!cleanChunk || cleanChunk.length < 10) {
            console.log(`Skipping chunk ${chunkIndex} - too short or empty`);
            return null;
          }

          // Call Google AI Embedding API with better error handling
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${GOOGLE_AI_API_KEY}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'models/embedding-001',
                content: {
                  parts: [{ text: cleanChunk }]
                }
              })
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Gemini API error for chunk ${chunkIndex} (${response.status}):`, errorText);
            throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
          }

          const data = await response.json();
          const embedding = data.embedding?.values;

          if (!embedding || !Array.isArray(embedding)) {
            console.error(`Invalid embedding response for chunk ${chunkIndex}:`, data);
            throw new Error('Invalid embedding response from Gemini API');
          }

          // Validate embedding dimensions
          if (embedding.length !== 768) {
            console.error(`Unexpected embedding dimensions for chunk ${chunkIndex}: ${embedding.length}`);
            throw new Error(`Expected 768 dimensions, got ${embedding.length}`);
          }

          console.log(`Successfully generated embedding for chunk ${chunkIndex + 1} (${embedding.length} dimensions)`);
          
          return {
            chunkIndex,
            chunkText: cleanChunk,
            embedding
          };
        } catch (error) {
          console.error(`Error processing chunk ${chunkIndex}:`, error);
          errorCount++;
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      embeddings.push(...batchResults.filter(result => result !== null));
      
      // Small delay between batches to respect rate limits
      if (i + BATCH_SIZE < textChunks.length) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Increased delay
      }
    }

    // Store embeddings in database
    if (embeddings.length > 0) {
      // Delete existing embeddings for this file first
      await supabaseClient
        .from('file_embeddings')
        .delete()
        .eq('file_id', fileId);

      const embeddingRows = embeddings.map(({ chunkIndex, chunkText, embedding }) => ({
        file_id: fileId,
        chunk_index: chunkIndex,
        chunk_text: chunkText,
        embedding: `[${embedding.join(',')}]` // Convert to PostgreSQL vector format
      }));

      const { error: insertError } = await supabaseClient
        .from('file_embeddings')
        .insert(embeddingRows);

      if (insertError) {
        console.error('Error inserting embeddings:', insertError);
        throw insertError;
      }

      successCount = embeddings.length;
      console.log(`Successfully stored ${successCount} embeddings for file ${fileData.file_name}`);
    }

    // Update file status
    const finalStatus = errorCount === 0 ? 'completed' : (successCount > 0 ? 'partial' : 'error');
    await supabaseClient
      .from('client_files')
      .update({ 
        embedding_status: finalStatus,
        embedding_processed_at: new Date().toISOString()
      })
      .eq('id', fileId);

    return new Response(
      JSON.stringify({
        success: true,
        fileId,
        fileName: fileData.file_name,
        totalChunks: textChunks.length,
        successCount,
        errorCount,
        status: finalStatus
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in embed-file-chunks function:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
