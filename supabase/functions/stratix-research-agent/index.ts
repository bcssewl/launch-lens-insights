
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ResearchRequest {
  query: string
  sessionId: string
  userId: string
}

interface DataSource {
  name: string
  endpoint: string
  apiKey?: string
  rateLimit: number
  cacheTTL: number
}

const DATA_SOURCES: { [key: string]: DataSource } = {
  worldBank: {
    name: 'World Bank',
    endpoint: 'https://api.worldbank.org/v2',
    rateLimit: 100,
    cacheTTL: 86400 // 24 hours
  },
  newsApi: {
    name: 'NewsAPI',
    endpoint: 'https://newsapi.org/v2',
    rateLimit: 100,
    cacheTTL: 3600 // 1 hour
  },
  wikipedia: {
    name: 'Wikipedia',
    endpoint: 'https://en.wikipedia.org/api/rest_v1',
    rateLimit: 200,
    cacheTTL: 3600 // 1 hour
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { query, sessionId, userId }: ResearchRequest = await req.json()

    console.log('Stratix Research Agent - Processing query:', query)

    // Step 1: Classify the research domain
    const researchDomain = await classifyQuery(query)
    console.log('Classified as domain:', researchDomain)

    // Step 2: Create research project record
    const { data: project, error: projectError } = await supabase
      .from('research_projects')
      .insert({
        user_id: userId,
        title: query.substring(0, 100),
        research_domain: researchDomain,
        query: query,
        status: 'processing'
      })
      .select()
      .single()

    if (projectError) {
      throw new Error(`Failed to create research project: ${projectError.message}`)
    }

    // Step 3: Execute research based on domain
    const researchResults = await executeResearch(query, researchDomain, project.id, supabase)

    // Step 4: Synthesize results using LLM
    const synthesizedReport = await synthesizeResults(researchResults, query, researchDomain)

    // Step 5: Store results
    await Promise.all([
      supabase.from('research_results').insert({
        project_id: project.id,
        result_type: 'markdown',
        content: { report: synthesizedReport.markdown }
      }),
      supabase.from('research_results').insert({
        project_id: project.id,
        result_type: 'json',
        content: synthesizedReport.structured
      }),
      supabase.from('research_projects').update({
        status: 'completed',
        confidence_score: synthesizedReport.confidence,
        completed_at: new Date().toISOString()
      }).eq('id', project.id)
    ])

    // Step 6: Store citations
    if (synthesizedReport.citations) {
      await supabase.from('research_citations').insert(
        synthesizedReport.citations.map(citation => ({
          project_id: project.id,
          source_name: citation.source,
          source_url: citation.url,
          citation_text: citation.text,
          confidence_score: citation.confidence
        }))
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        projectId: project.id,
        report: synthesizedReport.markdown,
        confidence: synthesizedReport.confidence,
        domain: researchDomain
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Stratix Research Agent error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function classifyQuery(query: string): Promise<string> {
  const queryLower = query.toLowerCase()
  
  // Domain classification keywords
  const domainKeywords = {
    market_research: ['market size', 'tam', 'sam', 'som', 'market growth', 'demand', 'revenue projections'],
    competitive_analysis: ['competitors', 'competition', 'swot', 'five forces', 'benchmark', 'market share'],
    cost_benchmarking: ['cost', 'pricing', 'spend', 'budget', 'expense', 'benchmark cost'],
    regulatory_scan: ['regulation', 'compliance', 'law', 'policy', 'legal', 'regulatory'],
    trend_analysis: ['trend', 'forecast', 'prediction', 'emerging', 'future', 'scenario'],
    lead_generation: ['leads', 'prospects', 'companies', 'contacts', 'customers', 'clients']
  }

  for (const [domain, keywords] of Object.entries(domainKeywords)) {
    if (keywords.some(keyword => queryLower.includes(keyword))) {
      return domain
    }
  }

  // Default to market research if no specific domain detected
  return 'market_research'
}

async function executeResearch(query: string, domain: string, projectId: string, supabase: any) {
  console.log(`Executing ${domain} research for query: ${query}`)
  
  const results = []

  try {
    // World Bank data for macro indicators
    const worldBankData = await fetchWorldBankData(query)
    if (worldBankData) {
      results.push({
        source: 'World Bank',
        data: worldBankData,
        type: 'economic_indicators'
      })
    }

    // Wikipedia for general context and definitions
    const wikipediaData = await fetchWikipediaData(query)
    if (wikipediaData) {
      results.push({
        source: 'Wikipedia',
        data: wikipediaData,
        type: 'context'
      })
    }

    // NewsAPI for recent developments (if available)
    const newsData = await fetchNewsData(query)
    if (newsData) {
      results.push({
        source: 'NewsAPI',
        data: newsData,
        type: 'news'
      })
    }

  } catch (error) {
    console.error('Error in research execution:', error)
  }

  return results
}

async function fetchWorldBankData(query: string) {
  try {
    // Example: Fetch GDP data for countries
    const response = await fetch(
      'https://api.worldbank.org/v2/country/all/indicator/NY.GDP.MKTP.CD?format=json&date=2020:2023&per_page=50'
    )
    
    if (!response.ok) return null
    
    const data = await response.json()
    return {
      indicators: data[1]?.slice(0, 10) || [],
      source_info: 'World Bank Development Indicators'
    }
  } catch (error) {
    console.error('World Bank API error:', error)
    return null
  }
}

async function fetchWikipediaData(query: string) {
  try {
    // Search for relevant Wikipedia articles
    const searchResponse = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query.split(' ')[0])}`
    )
    
    if (!searchResponse.ok) return null
    
    const data = await searchResponse.json()
    return {
      title: data.title,
      extract: data.extract,
      url: data.content_urls?.desktop?.page
    }
  } catch (error) {
    console.error('Wikipedia API error:', error)
    return null
  }
}

async function fetchNewsData(query: string) {
  try {
    // Note: NewsAPI requires API key, implement when available
    return {
      articles: [],
      note: 'NewsAPI integration pending API key configuration'
    }
  } catch (error) {
    console.error('NewsAPI error:', error)
    return null
  }
}

async function synthesizeResults(results: any[], query: string, domain: string) {
  console.log('Synthesizing results for domain:', domain)
  
  // Use OpenAI to synthesize the research results
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
  
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const systemPrompt = `You are Stratix, a specialized business research AI agent. Your role is to synthesize research data into comprehensive business reports.

Research Domain: ${domain}
Query: ${query}

Create a professional research report with:
1. Executive Summary
2. Key Findings (with specific data points)
3. Market Analysis (if applicable)
4. Recommendations
5. Data Sources & Citations

Format the response as structured markdown with clear sections and bullet points.`

  const userPrompt = `Research Data:
${JSON.stringify(results, null, 2)}

Please synthesize this data into a comprehensive business research report for the query: "${query}"

Focus on the ${domain.replace('_', ' ')} domain and provide actionable insights.`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const report = data.choices[0]?.message?.content || 'Unable to generate report'

    return {
      markdown: report,
      structured: {
        domain: domain,
        query: query,
        findings: results,
        generated_at: new Date().toISOString()
      },
      confidence: 0.85,
      citations: results.map(result => ({
        source: result.source,
        text: `Data from ${result.source}`,
        url: result.data?.url || null,
        confidence: 0.9
      }))
    }

  } catch (error) {
    console.error('OpenAI synthesis error:', error)
    
    // Fallback to basic synthesis
    return {
      markdown: generateFallbackReport(results, query, domain),
      structured: {
        domain: domain,
        query: query,
        findings: results,
        generated_at: new Date().toISOString()
      },
      confidence: 0.6,
      citations: results.map(result => ({
        source: result.source,
        text: `Data from ${result.source}`,
        url: result.data?.url || null,
        confidence: 0.7
      }))
    }
  }
}

function generateFallbackReport(results: any[], query: string, domain: string): string {
  const domainTitle = domain.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  
  return `# ${domainTitle} Report: ${query}

## Executive Summary
Research conducted on "${query}" within the ${domainTitle.toLowerCase()} domain.

## Key Findings
${results.map(result => `
### ${result.source}
- Data Type: ${result.type}
- Status: Data collected and analyzed
`).join('')}

## Data Sources
${results.map(result => `- **${result.source}**: ${result.type} data`).join('\n')}

## Recommendations
- Further analysis recommended with additional data sources
- Consider expanding research scope for comprehensive insights
- Monitor trends and updates in this domain

---
*Generated by Stratix Research Agent*`
}
