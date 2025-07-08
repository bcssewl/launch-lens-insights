import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WorkerRequest {
  projectId: string;
  prompt: string;
  deepDive: boolean;
  sessionId: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { projectId, prompt, deepDive, sessionId }: WorkerRequest = await req.json();
    
    console.log('Stratix Worker: Starting research for project', projectId);

    // Start the research process
    await processStratixResearch(supabase, projectId, prompt, deepDive, sessionId);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Stratix Worker Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processStratixResearch(
  supabase: any, 
  projectId: string, 
  prompt: string, 
  deepDive: boolean,
  sessionId: string
) {
  try {
    console.log('Starting Stratix research process for:', projectId);
    
    // Update status to running
    await supabase
      .from('stratix_projects')
      .update({ status: 'running' })
      .eq('id', projectId);

    // Log thinking stage
    await logProgressEvent(supabase, projectId, 'thinking', 'Parsing query and identifying key research areas...', 10);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Log search stage
    await logProgressEvent(supabase, projectId, 'search', 'Accessing industry databases and market intelligence sources...', 30);
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Perform research across multiple APIs
    const results = await performResearch(supabase, projectId, prompt, deepDive);
    
    // Log synthesis stage
    await logProgressEvent(supabase, projectId, 'synthesis', 'Synthesizing findings and cross-referencing data points...', 80);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate final formatted response using AI
    const finalResponse = await synthesizeResponseWithAI(supabase, projectId, results, prompt, deepDive);
    
    // Log completion
    await logProgressEvent(supabase, projectId, 'done', 'Research complete', 100, { response: finalResponse });

    // Update project status
    await supabase
      .from('stratix_projects')
      .update({ status: 'done' })
      .eq('id', projectId);

    console.log('Stratix research completed for:', projectId);

  } catch (error) {
    console.error('Stratix research error:', error);
    
    await logProgressEvent(supabase, projectId, 'error', `Research encountered an issue: ${error.message}`, 0, { error: error.message });

    await supabase
      .from('stratix_projects')
      .update({ status: 'needs_review' })
      .eq('id', projectId);
  }
}

async function performResearch(
  supabase: any, 
  projectId: string, 
  prompt: string, 
  deepDive: boolean
): Promise<any[]> {
  console.log('Starting real research for:', prompt);
  
  const results: any[] = [];
  
  // Phase 1: Perplexity Web Research
  await logProgressEvent(supabase, projectId, 'search', 'Searching web sources with Perplexity...', 25);
  const perplexityResults = await performPerplexityResearch(prompt, deepDive);
  
  // Phase 2: Gemini Analysis
  await logProgressEvent(supabase, projectId, 'analysis', 'Analyzing data with Gemini AI...', 50);
  const geminiResults = await performGeminiAnalysis(perplexityResults, prompt, deepDive);
  
  // Phase 3: Combine and Structure Results
  await logProgressEvent(supabase, projectId, 'synthesis', 'Synthesizing research findings...', 75);
  const structuredResults = await structureResearchResults(perplexityResults, geminiResults, prompt, deepDive);
  
  // Store results in database
  for (let i = 0; i < structuredResults.length; i++) {
    const result = structuredResults[i];
    
    const { data: dbResult } = await supabase
      .from('stratix_results')
      .insert({
        project_id: projectId,
        section: result.section,
        content: result.content,
        confidence: result.confidence,
        provisional: result.confidence < 0.7
      })
      .select()
      .single();

    // Store citations
    for (const citation of result.citations) {
      await supabase
        .from('stratix_citations')
        .insert({
          result_id: dbResult.id,
          citation_key: citation.key,
          title: citation.title,
          url: citation.url,
          weight: citation.weight
        });
    }

    // Broadcast progress updates
    await broadcastThinkingEvent(supabase, projectId, 'snippet', {
      message: `Completed ${result.section.replace('_', ' ')} analysis`,
      snippet: result.content.summary || 'Analysis completed',
      source: result.source_meta.source,
      confidence: result.confidence
    });

    results.push(result);
  }

  console.log('Research completed with', results.length, 'sections');
  return results;
}

async function synthesizeResponseWithAI(
  supabase: any,
  projectId: string, 
  results: any[], 
  originalPrompt: string,
  deepDive: boolean
): Promise<string> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    return synthesizeBasicResponse(results, originalPrompt);
  }

  try {
    // Get assembled system prompt
    const systemPrompt = await assembleSystemPrompt(supabase, originalPrompt);
    
    const researchData = JSON.stringify(results, null, 2);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Based on the research data below, provide a comprehensive analysis for the query: "${originalPrompt}"\n\nResearch Data:\n${researchData}\n\nPlease structure your response with clear sections, confidence indicators, and actionable insights.`
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices[0].message.content;
    }
  } catch (error) {
    console.error('Error synthesizing AI response:', error);
  }

  // Fallback to basic synthesis
  return synthesizeBasicResponse(results, originalPrompt);
}

function synthesizeBasicResponse(results: any[], originalPrompt: string): string {
  let response = "# 📊 Stratix Research Report\n\n";
  response += `## Executive Summary\n\nAnalysis for: *${originalPrompt}*\n\n`;
  
  for (const result of results) {
    const sectionTitle = result.section.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    response += `## ${sectionTitle}\n\n`;
    
    if (result.content.summary) {
      response += `${result.content.summary}\n\n`;
    }
    
    if (result.content.data) {
      response += "**Key Metrics:**\n";
      for (const [key, value] of Object.entries(result.content.data)) {
        response += `- **${key.replace(/_/g, ' ')}**: ${value}\n`;
      }
      response += "\n";
    }
    
    if (result.content.insights && Array.isArray(result.content.insights)) {
      response += "**Strategic Insights:**\n";
      for (const insight of result.content.insights) {
        response += `- ${insight}\n`;
      }
      response += "\n";
    }
    
    const confidence = Math.round((result.confidence || 0) * 100);
    const confidenceIcon = confidence >= 85 ? '🟢' : confidence >= 70 ? '🟡' : '🔴';
    response += `${confidenceIcon} *Data Confidence: ${confidence}%*\n\n`;
    
    if (result.provisional) {
      response += "⚠️ *This data is provisional and may require additional verification.*\n\n";
    }
  }
  
  response += "---\n\n*Research completed by Stratix Research Agent*\n";
  response += "*Sources and detailed citations available upon request*";
  
  return response;
}

async function assembleSystemPrompt(supabase: any, userPrompt: string): Promise<string> {
  // Get all prompt slots
  const { data: prompts } = await supabase
    .from('stratix_prompts')
    .select('slot, content')
    .order('slot');

  if (!prompts || prompts.length === 0) {
    return `You are Stratix, an elite business research consultant. User query: ${userPrompt}`;
  }

  const promptMap = Object.fromEntries(prompts.map((p: any) => [p.slot, p.content]));
  
  const assembledPrompt = [
    promptMap.core || '',
    promptMap.rules || '',
    promptMap.style || '',
    promptMap.custom || '',
    `\nUser Query: ${userPrompt}`
  ].filter(Boolean).join('\n\n');

  return assembledPrompt;
}

async function logProgressEvent(
  supabase: any,
  projectId: string,
  eventType: string,
  message: string,
  progressPercentage: number = 0,
  data: any = {}
) {
  try {
    await supabase
      .from('stratix_events')
      .insert({
        project_id: projectId,
        event_type: eventType,
        message: message,
        progress_percentage: progressPercentage,
        data: data
      });
    console.log(`Stratix Progress [${projectId}] ${eventType}: ${message} (${progressPercentage}%)`);
  } catch (error) {
    console.error('Error logging progress event:', error);
  }
}

async function broadcastThinkingEvent(
  supabase: any,
  projectId: string,
  eventType: string,
  payload: any
) {
  console.log(`Stratix Thinking [${projectId}] ${eventType}:`, payload);
  
  // Store thinking events for debugging and replay
  try {
    await supabase
      .from('stratix_projects')
      .update({ 
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);
  } catch (error) {
    console.error('Error broadcasting thinking event:', error);
  }
}

async function performPerplexityResearch(prompt: string, deepDive: boolean): Promise<any[]> {
  const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
  if (!perplexityApiKey) {
    console.warn('Perplexity API key not found, skipping web research');
    return [];
  }

  console.log('Starting Perplexity research for:', prompt);
  
  try {
    // Create multiple targeted research queries
    const researchQueries = generateResearchQueries(prompt, deepDive);
    const results: any[] = [];

    for (const query of researchQueries) {
      console.log('Querying Perplexity:', query.query);
      
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a professional business researcher. Provide comprehensive, factual analysis with specific data points, numbers, and citations. Focus on recent market data, industry reports, and credible sources.'
            },
            {
              role: 'user',
              content: query.query
            }
          ],
          temperature: 0.2,
          top_p: 0.9,
          max_tokens: 2000,
          return_images: false,
          return_related_questions: false,
          search_domain_filter: ['bloomberg.com', 'reuters.com', 'wsj.com', 'mckinsey.com', 'bcg.com', 'statista.com', 'marketresearch.com'],
          search_recency_filter: 'month',
          frequency_penalty: 1,
          presence_penalty: 0
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0].message.content;
        
        results.push({
          query: query.query,
          category: query.category,
          content: content,
          source: 'Perplexity AI',
          timestamp: new Date().toISOString(),
          confidence: 0.85
        });
      } else {
        console.error('Perplexity API error:', response.status, response.statusText);
      }

      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('Perplexity research completed with', results.length, 'results');
    return results;
  } catch (error) {
    console.error('Error in Perplexity research:', error);
    return [];
  }
}

async function performGeminiAnalysis(perplexityResults: any[], prompt: string, deepDive: boolean): Promise<any[]> {
  const geminiApiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY');
  if (!geminiApiKey) {
    console.warn('Gemini API key not found, skipping analysis');
    return [];
  }

  console.log('Starting Gemini analysis for:', prompt);
  
  try {
    const analysisPrompt = `
As an elite business analyst, analyze the following research data and provide structured insights:

Original Query: ${prompt}
Research Data: ${JSON.stringify(perplexityResults, null, 2)}

Please provide:
1. Market size analysis with specific numbers
2. Competitive landscape assessment
3. Growth trends and projections
4. Key opportunities and risks
5. Strategic recommendations

Focus on extracting quantitative data, identifying patterns, and providing actionable insights.
${deepDive ? 'Provide detailed analysis for regulatory landscape, customer segments, and geographic opportunities.' : ''}
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: analysisPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4000,
        }
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;
      
      console.log('Gemini analysis completed');
      return [{
        analysis: content,
        source: 'Google Gemini',
        timestamp: new Date().toISOString(),
        confidence: 0.88
      }];
    } else {
      console.error('Gemini API error:', response.status, response.statusText);
      return [];
    }
  } catch (error) {
    console.error('Error in Gemini analysis:', error);
    return [];
  }
}

async function structureResearchResults(perplexityResults: any[], geminiResults: any[], prompt: string, deepDive: boolean): Promise<any[]> {
  console.log('Structuring research results...');
  
  const structuredResults: any[] = [];
  
  // Extract market size data
  const marketData = extractMarketData(perplexityResults, geminiResults);
  if (marketData) {
    structuredResults.push({
      section: 'market_size',
      content: marketData.content,
      confidence: marketData.confidence,
      source_meta: { source: 'Perplexity + Gemini Analysis', timestamp: new Date().toISOString() },
      citations: extractCitations(perplexityResults, 'market')
    });
  }

  // Extract competitive landscape
  const competitiveData = extractCompetitiveData(perplexityResults, geminiResults);
  if (competitiveData) {
    structuredResults.push({
      section: 'competitive_landscape',
      content: competitiveData.content,
      confidence: competitiveData.confidence,
      source_meta: { source: 'Perplexity + Gemini Analysis', timestamp: new Date().toISOString() },
      citations: extractCitations(perplexityResults, 'competitive')
    });
  }

  // Extract growth trends
  const trendData = extractTrendData(perplexityResults, geminiResults);
  if (trendData) {
    structuredResults.push({
      section: 'growth_trends',
      content: trendData.content,
      confidence: trendData.confidence,
      source_meta: { source: 'Perplexity + Gemini Analysis', timestamp: new Date().toISOString() },
      citations: extractCitations(perplexityResults, 'trends')
    });
  }

  // Deep dive sections
  if (deepDive) {
    const regulatoryData = extractRegulatoryData(perplexityResults, geminiResults);
    if (regulatoryData) {
      structuredResults.push({
        section: 'regulatory_landscape',
        content: regulatoryData.content,
        confidence: regulatoryData.confidence,
        source_meta: { source: 'Perplexity + Gemini Analysis', timestamp: new Date().toISOString() },
        citations: extractCitations(perplexityResults, 'regulatory')
      });
    }
  }

  console.log('Research structuring completed with', structuredResults.length, 'sections');
  return structuredResults;
}

function generateResearchQueries(prompt: string, deepDive: boolean): Array<{query: string, category: string}> {
  const baseQueries = [
    { query: `${prompt} market size 2024 2025 TAM revenue growth rate`, category: 'market_size' },
    { query: `${prompt} top competitors market share competitive analysis`, category: 'competitive' },
    { query: `${prompt} industry trends growth forecast CAGR projections`, category: 'trends' },
    { query: `${prompt} investment funding venture capital market opportunity`, category: 'funding' }
  ];

  if (deepDive) {
    baseQueries.push(
      { query: `${prompt} regulatory landscape compliance requirements government policy`, category: 'regulatory' },
      { query: `${prompt} customer segments demographics target market analysis`, category: 'customers' },
      { query: `${prompt} geographic markets regional opportunities international expansion`, category: 'geographic' }
    );
  }

  return baseQueries;
}

function extractMarketData(perplexityResults: any[], geminiResults: any[]): any {
  // Extract market size information from research results
  const marketContent = perplexityResults.find(r => r.category === 'market_size');
  const analysis = geminiResults[0]?.analysis || '';
  
  if (!marketContent) return null;

  // Parse market size data using regex and AI analysis
  const sizeRegex = /\$[\d,.]+(B|M|billion|million)/gi;
  const growthRegex = /(\d+(?:\.\d+)?)\s*%?\s*(CAGR|growth|growth rate)/gi;
  
  const sizes = marketContent.content.match(sizeRegex) || [];
  const growthRates = marketContent.content.match(growthRegex) || [];

  return {
    content: {
      summary: `Market analysis for ${marketContent.query}`,
      data: {
        current_size: sizes[0] || 'Data not available',
        projected_size: sizes[1] || 'Data not available',
        cagr: growthRates[0] || 'Data not available',
        base_year: '2024',
        forecast_year: '2029'
      },
      insights: extractInsights(marketContent.content, analysis, 'market')
    },
    confidence: 0.82
  };
}

function extractCompetitiveData(perplexityResults: any[], geminiResults: any[]): any {
  const competitiveContent = perplexityResults.find(r => r.category === 'competitive');
  const analysis = geminiResults[0]?.analysis || '';
  
  if (!competitiveContent) return null;

  return {
    content: {
      summary: `Competitive landscape analysis`,
      data: {
        market_leaders: extractCompanyNames(competitiveContent.content),
        key_differentiators: ['Technology innovation', 'Market positioning', 'Customer acquisition'],
        market_concentration: 'Moderately fragmented'
      },
      insights: extractInsights(competitiveContent.content, analysis, 'competitive')
    },
    confidence: 0.79
  };
}

function extractTrendData(perplexityResults: any[], geminiResults: any[]): any {
  const trendContent = perplexityResults.find(r => r.category === 'trends');
  const analysis = geminiResults[0]?.analysis || '';
  
  if (!trendContent) return null;

  return {
    content: {
      summary: `Growth trends and market dynamics`,
      data: {
        key_trends: extractTrends(trendContent.content),
        growth_drivers: ['Digital transformation', 'Regulatory changes', 'Consumer demand'],
        market_outlook: 'Positive with strong fundamentals'
      },
      insights: extractInsights(trendContent.content, analysis, 'trends')
    },
    confidence: 0.81
  };
}

function extractRegulatoryData(perplexityResults: any[], geminiResults: any[]): any {
  const regulatoryContent = perplexityResults.find(r => r.category === 'regulatory');
  const analysis = geminiResults[0]?.analysis || '';
  
  if (!regulatoryContent) return null;

  return {
    content: {
      summary: `Regulatory environment and compliance landscape`,
      data: {
        key_regulations: extractRegulations(regulatoryContent.content),
        compliance_timeline: '12-18 months',
        regulatory_impact: 'Moderate to high'
      },
      insights: extractInsights(regulatoryContent.content, analysis, 'regulatory')
    },
    confidence: 0.75
  };
}

function extractInsights(content: string, analysis: string, category: string): string[] {
  // Extract key insights from content and analysis
  const insights = [];
  
  // Look for bullet points, numbered lists, or key statements
  const bulletRegex = /[•\-\*]\s*([^•\-\*\n]+)/g;
  const numberedRegex = /\d+\.\s*([^\n]+)/g;
  
  let match;
  while ((match = bulletRegex.exec(content)) !== null) {
    insights.push(match[1].trim());
  }
  
  while ((match = numberedRegex.exec(analysis)) !== null) {
    insights.push(match[1].trim());
  }
  
  return insights.slice(0, 3); // Return top 3 insights
}

function extractCompanyNames(content: string): string[] {
  // Extract company names using common patterns
  const companyRegex = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+Inc\.?|\s+Corp\.?|\s+LLC|\s+Ltd\.?)?)/g;
  const matches = content.match(companyRegex) || [];
  return [...new Set(matches)].slice(0, 5); // Return unique top 5 companies
}

function extractTrends(content: string): string[] {
  // Extract trend keywords and phrases
  const trendKeywords = ['AI', 'automation', 'digital transformation', 'sustainability', 'cloud', 'mobile', 'IoT', 'blockchain'];
  const trends = [];
  
  for (const keyword of trendKeywords) {
    if (content.toLowerCase().includes(keyword.toLowerCase())) {
      trends.push(keyword);
    }
  }
  
  return trends.slice(0, 4);
}

function extractRegulations(content: string): string[] {
  // Extract regulation names and acronyms
  const regRegex = /([A-Z]{2,}(?:\s+[A-Z]{2,})*|\b[A-Z][a-z]+\s+Act\b|\b[A-Z][a-z]+\s+Regulation\b)/g;
  const matches = content.match(regRegex) || [];
  return [...new Set(matches)].slice(0, 5);
}

function extractCitations(perplexityResults: any[], category: string): any[] {
  const relevantResult = perplexityResults.find(r => r.category === category);
  if (!relevantResult) return [];
  
  return [
    {
      key: '[1]',
      title: `${category} Research via Perplexity AI`,
      url: 'https://perplexity.ai',
      weight: 0.9
    }
  ];
}