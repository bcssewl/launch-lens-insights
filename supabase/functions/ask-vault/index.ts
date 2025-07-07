
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AskVaultResult {
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

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');

async function enhanceQueryWithGemini(query: string): Promise<string> {
  if (!GOOGLE_AI_API_KEY) {
    console.log('Google AI API key not found, using original query');
    return query;
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
            text: `Enhance this search query for a file vault system. Extract key concepts, synonyms, and related terms that would help find relevant documents. Return only the enhanced search terms separated by spaces, no explanations.

Original query: "${query}"

Enhanced search terms:`
          }]
        }],
        generationConfig: {
          maxOutputTokens: 100,
          temperature: 0.1,
        }
      })
    });

    const data = await response.json();
    const enhancedQuery = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (enhancedQuery) {
      console.log('Query enhanced from:', query, 'to:', enhancedQuery);
      return enhancedQuery;
    }
  } catch (error) {
    console.error('Error enhancing query with Gemini:', error);
  }

  return query;
}

async function generateSmartSnippet(fileName: string, category: string, query: string): Promise<string> {
  if (!GOOGLE_AI_API_KEY) {
    return `${category} document containing information related to your search.`;
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
            text: `Create a brief, informative snippet (max 2 sentences) explaining why this file would be relevant to the user's search query.

File name: "${fileName}"
Category: "${category}"
User query: "${query}"

Snippet:`
          }]
        }],
        generationConfig: {
          maxOutputTokens: 80,
          temperature: 0.3,
        }
      })
    });

    const data = await response.json();
    const snippet = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (snippet) {
      return snippet;
    }
  } catch (error) {
    console.error('Error generating snippet with Gemini:', error);
  }

  return `${category} document that may contain relevant information for your search.`;
}

async function rankResultsWithGemini(files: any[], originalQuery: string): Promise<AskVaultResult[]> {
  if (!GOOGLE_AI_API_KEY || files.length === 0) {
    return files.map(file => ({
      id: file.id,
      title: file.file_name,
      snippet: `${file.category || 'Document'} containing information related to your search.`,
      source: 'title' as const,
      fileType: file.file_type,
      relevanceScore: 0.5,
      filePath: file.file_path,
      fileSize: file.file_size,
      uploadDate: file.upload_date
    }));
  }

  const results: AskVaultResult[] = [];
  
  for (const file of files) {
    try {
      const snippet = await generateSmartSnippet(file.file_name, file.category || 'Document', originalQuery);
      
      // Simple relevance scoring based on query matching
      const fileName = file.file_name.toLowerCase();
      const queryWords = originalQuery.toLowerCase().split(' ');
      const matchScore = queryWords.reduce((score, word) => {
        return score + (fileName.includes(word) ? 0.3 : 0);
      }, 0.1);
      
      const relevanceScore = Math.min(matchScore, 1.0);
      
      results.push({
        id: file.id,
        title: file.file_name,
        snippet,
        source: 'content' as const,
        fileType: file.file_type,
        relevanceScore,
        filePath: file.file_path,
        matchedFragment: queryWords.find(word => fileName.includes(word)),
        fileSize: file.file_size,
        uploadDate: file.upload_date
      });
    } catch (error) {
      console.error('Error processing file:', file.file_name, error);
      // Fallback result
      results.push({
        id: file.id,
        title: file.file_name,
        snippet: `${file.category || 'Document'} that may be relevant to your search.`,
        source: 'title' as const,
        fileType: file.file_type,
        relevanceScore: 0.3,
        filePath: file.file_path,
        fileSize: file.file_size,
        uploadDate: file.upload_date
      });
    }
  }

  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, clientId } = await req.json();
    
    console.log('Ask Vault API called:', { query, clientId, timestamp: new Date().toISOString() });

    // Phase 1: Enhance query with Gemini
    const enhancedQuery = await enhanceQueryWithGemini(query);
    
    // Phase 2: Search real client files from database
    const { data: clientFiles, error } = await supabase
      .from('client_files')
      .select('*')
      .eq('client_id', clientId)
      .order('upload_date', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    if (!clientFiles || clientFiles.length === 0) {
      console.log('No files found for client:', clientId);
      return new Response(JSON.stringify({ 
        results: [],
        query,
        clientId,
        timestamp: new Date().toISOString(),
        message: 'No files found for this client'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Phase 3: Filter files based on enhanced query
    const searchTerms = enhancedQuery.toLowerCase().split(' ');
    const filteredFiles = clientFiles.filter(file => {
      const searchableText = `${file.file_name} ${file.category || ''}`.toLowerCase();
      return searchTerms.some(term => searchableText.includes(term));
    });

    // Phase 4: Rank results with Gemini and generate smart snippets
    const rankedResults = await rankResultsWithGemini(filteredFiles, query);

    console.log('Ask Vault results:', { 
      query, 
      enhancedQuery,
      clientId, 
      totalFiles: clientFiles.length,
      filteredFiles: filteredFiles.length,
      resultCount: rankedResults.length,
      results: rankedResults.map(r => ({ id: r.id, title: r.title, relevanceScore: r.relevanceScore }))
    });

    return new Response(JSON.stringify({ 
      results: rankedResults,
      query,
      enhancedQuery,
      clientId,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ask-vault function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      results: [],
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
