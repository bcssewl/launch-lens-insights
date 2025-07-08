import { StratixApiResponse, createSuccessResponse, createErrorResponse, rateLimiters } from './common';

interface AlphaVantageOverview {
  Symbol: string;
  AssetType: string;
  Name: string;
  Description: string;
  CIK: string;
  Exchange: string;
  Currency: string;
  Country: string;
  Sector: string;
  Industry: string;
  Address: string;
  FiscalYearEnd: string;
  LatestQuarter: string;
  MarketCapitalization: string;
  EBITDA: string;
  PERatio: string;
  PEGRatio: string;
  BookValue: string;
  DividendPerShare: string;
  DividendYield: string;
  EPS: string;
  RevenuePerShareTTM: string;
  ProfitMargin: string;
  OperatingMarginTTM: string;
  ReturnOnAssetsTTM: string;
  ReturnOnEquityTTM: string;
  RevenueTTM: string;
  GrossProfitTTM: string;
  DilutedEPSTTM: string;
  QuarterlyEarningsGrowthYOY: string;
  QuarterlyRevenueGrowthYOY: string;
  AnalystTargetPrice: string;
  TrailingPE: string;
  ForwardPE: string;
  PriceToSalesRatioTTM: string;
  PriceToBookRatio: string;
  EVToRevenue: string;
  EVToEBITDA: string;
  Beta: string;
  '52WeekHigh': string;
  '52WeekLow': string;
  '50DayMovingAverage': string;
  '200DayMovingAverage': string;
  SharesOutstanding: string;
  DividendDate: string;
  ExDividendDate: string;
}

/**
 * Alpha Vantage API wrapper
 * Requires API key, free tier: 5 requests per minute, 500 per day
 * @param symbol - Stock symbol (e.g., 'IBM', 'AAPL')
 * @param dataType - Type of data ('overview', 'daily', 'intraday')
 * @param apiKey - Alpha Vantage API key
 */
export async function alpha_vantage(
  symbol: string,
  dataType: 'overview' | 'daily' | 'intraday' = 'overview',
  apiKey?: string
): Promise<StratixApiResponse<AlphaVantageOverview | any>> {
  try {
    // Use provided key or environment variable
    const key = apiKey || process.env.ALPHA_VANTAGE_KEY;
    
    if (!key) {
      throw new Error('Alpha Vantage API key is required');
    }
    
    // Respect rate limits
    await rateLimiters.alphaVantage.waitIfNeeded();
    
    let url: string;
    let function_name: string;
    
    switch (dataType) {
      case 'overview':
        function_name = 'OVERVIEW';
        url = `https://www.alphavantage.co/query?function=${function_name}&symbol=${symbol}&apikey=${key}`;
        break;
      case 'daily':
        function_name = 'TIME_SERIES_DAILY';
        url = `https://www.alphavantage.co/query?function=${function_name}&symbol=${symbol}&apikey=${key}`;
        break;
      case 'intraday':
        function_name = 'TIME_SERIES_INTRADAY';
        url = `https://www.alphavantage.co/query?function=${function_name}&symbol=${symbol}&interval=5min&apikey=${key}`;
        break;
      default:
        throw new Error(`Unsupported data type: ${dataType}`);
    }
    
    console.log('Alpha Vantage API: Fetching', { symbol, dataType, function_name });
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Stratix-Research-Agent/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Check for API error responses
    if (data['Error Message']) {
      throw new Error(`Alpha Vantage API: ${data['Error Message']}`);
    }
    
    if (data['Note']) {
      throw new Error(`Alpha Vantage API rate limit: ${data['Note']}`);
    }
    
    // Validate overview response has Symbol field
    if (dataType === 'overview' && !data.Symbol) {
      throw new Error('Invalid Alpha Vantage overview response - missing Symbol field');
    }
    
    return createSuccessResponse(data, 'Alpha Vantage', {
      rate_limit: {
        remaining: 4, // Assume we have 4 remaining after this call
      }
    });
    
  } catch (error) {
    console.error('Alpha Vantage API error:', error);
    return createErrorResponse('Alpha Vantage', error instanceof Error ? error.message : 'Unknown error');
  }
}