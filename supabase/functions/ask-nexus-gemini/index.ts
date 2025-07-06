
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');

async function checkCachedResponse(questionHash: string, userId: string, fileId?: string): Promise<any> {
  try {
    console.log('Checking cache for question hash:', questionHash, 'user:', userId);
    
    const query = supabase
      .from('nexus_query_cache')
      .select('*')
      .eq('user_id', userId)
      .eq('question_hash', questionHash)
      .eq('is_valid', true);
    
    if (fileId) {
      query.eq('file_id', fileId);
    } else {
      query.is('file_id', null);
    }
    
    const { data, error } = await query
      .order('last_used_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Cache check error:', error);
      return null;
    }

    if (data) {
      console.log('Found cached response, updating usage stats');
      
      // Update usage statistics
      await supabase
        .from('nexus_query_cache')
        .update({
          last_used_at: new Date().toISOString(),
          use_count: data.use_count + 1
        })
        .eq('id', data.id);
      
      return data;
    }
    
    return null;
  } catch (error) {
    console.error('Cache check failed:', error);
    return null;
  }
}

async function saveToCache(questionHash: string, question: string, answer: string, userId: string, fileId?: string, contextUsed?: string, responseTime?: number) {
  try {
    console.log('Saving response to cache for user:', userId);
    
    const { error } = await supabase
      .from('nexus_query_cache')
      .insert({
        user_id: userId,
        file_id: fileId || null,
        question_hash: questionHash,
        question: question,
        answer: answer,
        context_used: contextUsed || null,
        response_time_ms: responseTime || null,
        api_cost_estimate: 0.001 // Rough estimate for Gemini Flash
      });

    if (error) {
      console.error('Error saving to cache:', error);
    }
  } catch (error) {
    console.error('Cache save failed:', error);
  }
}

async function generateQuestionHash(question: string, fileId?: string): Promise<string> {
  try {
    const { data, error } = await supabase.rpc('generate_question_hash', {
      question_text: question,
      file_id: fileId || null
    });
    
    if (error) {
      console.error('Hash generation error:', error);
      // Fallback hash generation
      const normalizedQuestion = question.toLowerCase().replace(/[?.!,;:\s]+/g, ' ').trim();
      const hashInput = normalizedQuestion + (fileId || '');
      return btoa(hashInput).replace(/[^a-zA-Z0-9]/g, '').substring(0, 64);
    }
    
    return data;
  } catch (error) {
    console.error('Hash generation failed:', error);
    return btoa(question).replace(/[^a-zA-Z0-9]/g, '').substring(0, 64);
  }
}

async function askGemini(question: string, context: string = '', fileId?: string): Promise<{answer: string, fullContext: string}> {
  if (!GOOGLE_AI_API_KEY) {
    throw new Error('Google AI API key not configured');
  }

  const systemPrompt = `You are Nexus, an AI assistant specialized in analyzing documents and answering questions about their content. You provide clear, accurate, and helpful responses based on the provided document content.

Guidelines:
- Answer questions directly and concisely
- Use specific information from the document when available
- If information isn't in the document, clearly state that
- Provide relevant quotes or references when helpful
- Be professional and informative`;

  const userPrompt = context 
    ? `Document Content:\n${context}\n\nQuestion: ${question}`
    : `Question: ${question}`;

  try {
    console.log('Calling Gemini API...');
    const startTime = Date.now();
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${userPrompt}`
          }]
        }],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.3,
        }
      })
    });

    const responseTime = Date.now() - startTime;
    console.log(`Gemini API response received in ${responseTime}ms`);

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!answer) {
      throw new Error('No response generated from Gemini');
    }

    return {
      answer: answer.trim(),
      fullContext: context
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

serve(async (req) => {
  console.log('=== Ask Nexus Gemini function called ===', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, fileId } = await req.json();
    
    if (!question?.trim()) {
      return new Response(JSON.stringify({ error: 'Question is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing question:', question, 'for fileId:', fileId);

    // Get user from JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create a supabase client with the user's JWT to get their ID
    const userSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    );

    const { data: { user }, error: userError } = await userSupabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id;
    console.log('Authenticated user:', userId);

    // Generate question hash for caching
    const questionHash = await generateQuestionHash(question, fileId);
    
    // Check cache first
    const cachedResponse = await checkCachedResponse(questionHash, userId, fileId);
    if (cachedResponse) {
      console.log('Returning cached response');
      
      // Store conversation
      await supabase
        .from('nexus_conversations')
        .insert({
          user_id: userId,
          file_id: fileId || null,
          question: question.trim(),
          response: cachedResponse.answer,
          context_used: cachedResponse.context_used
        });

      return new Response(JSON.stringify({
        response: cachedResponse.answer,
        cached: true,
        useCount: cachedResponse.use_count
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let context = '';
    
    // Get file content if fileId is provided
    if (fileId) {
      console.log('Fetching file content for context...');
      const { data: file, error: fileError } = await supabase
        .from('client_files')
        .select('file_content_text, content_summary, file_name')
        .eq('id', fileId)
        .single();

      if (fileError) {
        console.error('File fetch error:', fileError);
        return new Response(JSON.stringify({ error: 'File not found or not accessible' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!file.file_content_text) {
        return new Response(JSON.stringify({ 
          error: 'File content not yet extracted. Please extract content first.',
          needsExtraction: true
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      context = `File: ${file.file_name}\nSummary: ${file.content_summary || 'No summary available'}\n\nContent:\n${file.file_content_text}`;
      console.log('Using file context, length:', context.length);
    }

    // Ask Gemini
    const startTime = Date.now();
    const { answer, fullContext } = await askGemini(question, context, fileId);
    const responseTime = Date.now() - startTime;

    // Save to cache
    await saveToCache(questionHash, question, answer, userId, fileId, fullContext, responseTime);

    // Store conversation
    await supabase
      .from('nexus_conversations')
      .insert({
        user_id: userId,
        file_id: fileId || null,
        question: question.trim(),
        response: answer,
        context_used: fullContext.substring(0, 1000) // Truncate for storage
      });

    console.log('Question processed successfully');

    return new Response(JSON.stringify({
      response: answer,
      cached: false,
      responseTime: responseTime
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ask-nexus-gemini function:', error);
    
    let errorMessage = 'An error occurred while processing your question';
    if (error.message.includes('API key')) {
      errorMessage = 'AI service not properly configured';
    } else if (error.message.includes('not found')) {
      errorMessage = 'Requested file not found';
    }
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
