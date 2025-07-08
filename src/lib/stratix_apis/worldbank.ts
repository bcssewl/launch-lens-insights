import { StratixApiResponse, createSuccessResponse, createErrorResponse } from './common';

interface WorldBankData {
  indicator: {
    id: string;
    value: string;
  };
  country: {
    id: string;
    value: string;
  };
  countryiso3code: string;
  date: string;
  value: number | null;
  unit: string;
  obs_status: string;
  decimal: number;
}

/**
 * World Bank API wrapper
 * Free API with no authentication required
 * @param indicator - World Bank indicator code (e.g., 'SP.POP.TOTL' for population)
 * @param country - Country code (e.g., 'USA', 'BR', 'CHN')
 * @param startYear - Optional start year (default: 2010)
 * @param endYear - Optional end year (default: current year)
 */
export async function worldbank(
  indicator: string,
  country: string,
  startYear?: number,
  endYear?: number
): Promise<StratixApiResponse<number[]>> {
  try {
    const currentYear = new Date().getFullYear();
    const start = startYear || 2010;
    const end = endYear || currentYear;
    
    const url = `https://api.worldbank.org/v2/country/${country}/indicator/${indicator}` +
      `?date=${start}:${end}&format=json&per_page=1000`;
    
    console.log('World Bank API: Fetching', { indicator, country, start, end });
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Stratix-Research-Agent/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`World Bank API error: ${response.status} ${response.statusText}`);
    }
    
    const jsonData = await response.json();
    
    // World Bank API returns [metadata, data] array
    if (!Array.isArray(jsonData) || jsonData.length < 2) {
      throw new Error('Invalid World Bank API response format');
    }
    
    const [metadata, data] = jsonData;
    
    if (!Array.isArray(data)) {
      throw new Error('No data returned from World Bank API');
    }
    
    // Extract numeric values, filter out nulls, sort by date
    const values = (data as WorldBankData[])
      .filter(item => item.value !== null)
      .sort((a, b) => parseInt(a.date) - parseInt(b.date))
      .map(item => item.value as number);
    
    return createSuccessResponse(values, 'World Bank', {
      rate_limit: {
        remaining: 999, // World Bank has generous limits
      }
    });
    
  } catch (error) {
    console.error('World Bank API error:', error);
    return createErrorResponse('World Bank', error instanceof Error ? error.message : 'Unknown error');
  }
}