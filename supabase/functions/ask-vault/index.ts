
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, clientId } = await req.json();
    
    console.log('Ask Vault API called:', { query, clientId, timestamp: new Date().toISOString() });

    // Mock semantic search results
    // TODO: Replace with actual vector search implementation
    // Integration points:
    // 1. pgvector extension for semantic similarity
    // 2. OpenAI embeddings for query and document vectors  
    // 3. Supabase client_files table for metadata
    // 4. File content extraction and indexing pipeline
    
    const mockResults: AskVaultResult[] = [
      {
        id: 'mock-file-1',
        title: 'Tesla Pricing Strategy Analysis.pdf',
        snippet: 'Comprehensive market analysis covering Tesla Model S, 3, X, and Y pricing strategies. Includes competitive positioning against traditional OEMs and emerging EV manufacturers. Revenue impact projections for 2024-2025.',
        source: 'content',
        fileType: 'application/pdf',
        relevanceScore: 0.95,
        filePath: `client-files/${clientId}/tesla-pricing-analysis.pdf`,
        matchedFragment: query.toLowerCase().includes('tesla') ? 'Tesla' : 
                         query.toLowerCase().includes('pricing') ? 'pricing' : 
                         query.toLowerCase().includes('strategy') ? 'strategy' : undefined,
        fileSize: 2450000,
        uploadDate: '2024-01-15T10:30:00Z'
      },
      {
        id: 'mock-file-2', 
        title: 'Q4 Financial Projections - Updated.xlsx',
        snippet: 'Detailed quarterly financial forecasts with updated market assumptions. Includes revenue breakdowns by product line, cost structure analysis, and sensitivity scenarios for different market conditions.',
        source: 'title',
        fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        relevanceScore: 0.87,
        filePath: `client-files/${clientId}/q4-financial-projections.xlsx`,
        matchedFragment: query.toLowerCase().includes('financial') ? 'Financial' :
                         query.toLowerCase().includes('projection') ? 'projection' : undefined,
        fileSize: 1200000,
        uploadDate: '2024-01-12T14:20:00Z'
      },
      {
        id: 'mock-file-3',
        title: 'Brand Identity Guidelines v3.2.pdf',
        snippet: 'Complete brand guidelines including logo specifications, color palettes, typography standards, and marketing asset templates. Updated with new digital-first design system and accessibility requirements.',
        source: 'metadata',
        fileType: 'application/pdf',  
        relevanceScore: 0.73,
        filePath: `client-files/${clientId}/brand-guidelines-v3.pdf`,
        matchedFragment: query.toLowerCase().includes('brand') ? 'brand' :
                         query.toLowerCase().includes('guideline') ? 'guideline' : undefined,
        fileSize: 5600000,
        uploadDate: '2024-01-08T09:15:00Z'
      }
    ];

    // Filter results based on query relevance
    const filteredResults = mockResults.filter(result => {
      const searchableText = `${result.title} ${result.snippet}`.toLowerCase();
      const queryLower = query.toLowerCase();
      return searchableText.includes(queryLower);
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);

    console.log('Ask Vault results:', { 
      query, 
      clientId, 
      resultCount: filteredResults.length,
      results: filteredResults.map(r => ({ id: r.id, title: r.title, relevanceScore: r.relevanceScore }))
    });

    return new Response(JSON.stringify({ 
      results: filteredResults,
      query,
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
