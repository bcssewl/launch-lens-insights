import { StratixApiResponse, createSuccessResponse, createErrorResponse, rateLimiters } from './common';

interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

/**
 * News API wrapper
 * Requires API key, free tier: 1000 requests per day
 * @param query - Search query
 * @param category - News category ('business', 'technology', 'science', etc.)
 * @param country - Country code (e.g., 'us', 'gb', 'de')
 * @param pageSize - Number of articles (max 100)
 * @param apiKey - News API key
 */
export async function newsapi(
  query?: string,
  category?: 'business' | 'entertainment' | 'general' | 'health' | 'science' | 'sports' | 'technology',
  country?: string,
  pageSize: number = 20,
  apiKey?: string
): Promise<StratixApiResponse<NewsArticle[]>> {
  try {
    // Use provided key or environment variable
    const key = apiKey || process.env.NEWSAPI_KEY;
    
    if (!key) {
      throw new Error('News API key is required');
    }
    
    // Respect rate limits
    await rateLimiters.newsApi.waitIfNeeded();
    
    let url: string;
    const baseUrl = 'https://newsapi.org/v2';
    
    if (query) {
      // Search everything endpoint
      url = `${baseUrl}/everything?q=${encodeURIComponent(query)}&pageSize=${pageSize}&sortBy=relevancy&apiKey=${key}`;
    } else {
      // Top headlines endpoint
      url = `${baseUrl}/top-headlines?pageSize=${pageSize}&apiKey=${key}`;
      
      if (category) {
        url += `&category=${category}`;
      }
      
      if (country) {
        url += `&country=${country}`;
      }
    }
    
    console.log('News API: Fetching', { query, category, country, pageSize });
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Stratix-Research-Agent/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`News API error: ${response.status} ${response.statusText}`);
    }
    
    const data: NewsApiResponse = await response.json();
    
    // Check for API error responses
    if (data.status !== 'ok') {
      throw new Error(`News API error: ${data.status}`);
    }
    
    // Filter out articles with null titles or descriptions
    const validArticles = data.articles.filter(article => 
      article.title && 
      article.title !== '[Removed]' && 
      article.description
    );
    
    return createSuccessResponse(validArticles, 'News API', {
      rate_limit: {
        remaining: 999, // Estimate remaining daily quota
      }
    });
    
  } catch (error) {
    console.error('News API error:', error);
    return createErrorResponse('News API', error instanceof Error ? error.message : 'Unknown error');
  }
}