
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

async function getFileContent(fileId: string): Promise<string | null> {
  try {
    const { data: file, error } = await supabase
      .from('client_files')
      .select('file_content_text, file_name, file_type, category')
      .eq('id', fileId)
      .single();

    if (error) {
      console.error('Error fetching file:', error);
      return null;
    }

    // If we have extracted text content, use it
    if (file.file_content_text) {
      return `File: ${file.file_name} (${file.file_type})\nCategory: ${file.category || 'Uncategorized'}\n\nContent:\n${file.file_content_text}`;
    }

    // Fallback to basic file info
    return `File: ${file.file_name} (${file.file_type})\nCategory: ${file.category || 'Uncategorized'}\n\nNote: Text content not yet extracted from this file.`;
  } catch (error) {
    console.error('Error in getFileContent:', error);
    return null;
  }
}

async function getConversationHistory(fileId: string, userId: string): Promise<string> {
  try {
    const { data: conversations, error } = await supabase
      .from('nexus_conversations')
      .select('question, response, created_at')
      .eq('file_id', fileId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(5); // Last 5 conversations for context

    if (error || !conversations || conversations.length === 0) {
      return '';
    }

    return conversations.map(conv => 
      `Previous Q: ${conv.question}\nPrevious A: ${conv.response}\n`
    ).join('\n');
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    return '';
  }
}

async function callGeminiAPI(prompt: string): Promise<string> {
  if (!GOOGLE_AI_API_KEY) {
    throw new Error('Google AI API key not configured');
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No response generated from Gemini');
    }

    return generatedText;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, fileId } = await req.json();
    
    if (!question || !fileId) {
      return new Response(JSON.stringify({ error: 'Question and fileId are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the current user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Ask Nexus request:', { question, fileId, userId: user.id });

    // Get file content and conversation history
    const [fileContent, conversationHistory] = await Promise.all([
      getFileContent(fileId),
      getConversationHistory(fileId, user.id)
    ]);

    if (!fileContent) {
      return new Response(JSON.stringify({ error: 'File not found or content not accessible' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Construct the prompt for Gemini
    const systemPrompt = `You are Nexus, an intelligent AI assistant that helps users understand and analyze their documents. You have access to the content of a specific file and should provide helpful, accurate, and contextual responses based on that content.

Guidelines:
- Answer questions directly based on the file content provided
- If the question cannot be answered from the file content, say so clearly
- Provide specific details and references when possible
- Be concise but comprehensive
- If asked about topics not in the file, politely redirect to the file's content
- Use a professional but friendly tone

${conversationHistory ? `Previous conversation context:\n${conversationHistory}` : ''}

Current file information:
${fileContent}

User question: ${question}

Please provide a helpful response based on the file content:`;

    // Call Gemini API
    const response = await callGeminiAPI(systemPrompt);

    // Store the conversation in the database
    const { error: insertError } = await supabase
      .from('nexus_conversations')
      .insert({
        user_id: user.id,
        file_id: fileId,
        question,
        response,
        context_used: fileContent.substring(0, 500) // Store first 500 chars as context
      });

    if (insertError) {
      console.error('Error storing conversation:', insertError);
      // Don't fail the request if storage fails
    }

    return new Response(JSON.stringify({ response }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ask-nexus-gemini function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process your question. Please try again.',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
