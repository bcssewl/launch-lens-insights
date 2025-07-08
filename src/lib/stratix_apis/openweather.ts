import { StratixApiResponse, createSuccessResponse, createErrorResponse, rateLimiters } from './common';

interface WeatherMain {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
  sea_level?: number;
  grnd_level?: number;
}

interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

interface WeatherWind {
  speed: number;
  deg: number;
  gust?: number;
}

interface WeatherClouds {
  all: number;
}

interface WeatherResponse {
  coord: {
    lon: number;
    lat: number;
  };
  weather: WeatherCondition[];
  base: string;
  main: WeatherMain;
  visibility: number;
  wind: WeatherWind;
  clouds: WeatherClouds;
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

/**
 * OpenWeatherMap API wrapper
 * Requires API key, free tier: 60 calls per minute, 1000 per day
 * @param location - City name, state code, country code (e.g., 'London,GB' or 'New York,NY,US')
 * @param units - Temperature units ('metric', 'imperial', 'kelvin')
 * @param apiKey - OpenWeatherMap API key
 */
export async function openweather(
  location: string,
  units: 'metric' | 'imperial' | 'kelvin' = 'metric',
  apiKey?: string
): Promise<StratixApiResponse<WeatherResponse>> {
  try {
    // Use provided key or environment variable
    const key = apiKey || process.env.OPENWEATHER_API_KEY;
    
    if (!key) {
      throw new Error('OpenWeatherMap API key is required');
    }
    
    // Respect rate limits
    await rateLimiters.openWeather.waitIfNeeded();
    
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${key}&units=${units}`;
    
    console.log('OpenWeatherMap API: Fetching weather for', { location, units });
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Stratix-Research-Agent/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`OpenWeatherMap API error: ${response.status} ${response.statusText}`);
    }
    
    const data: WeatherResponse = await response.json();
    
    // Check for API error responses
    if (data.cod && data.cod !== 200) {
      throw new Error(`OpenWeatherMap API error: ${data.cod} - ${(data as any).message || 'Unknown error'}`);
    }
    
    // Validate required fields
    if (!data.main || !data.weather || !Array.isArray(data.weather)) {
      throw new Error('Invalid OpenWeatherMap API response format');
    }
    
    return createSuccessResponse(data, 'OpenWeatherMap', {
      rate_limit: {
        remaining: 59, // Assume we have 59 remaining after this call
      }
    });
    
  } catch (error) {
    console.error('OpenWeatherMap API error:', error);
    return createErrorResponse('OpenWeatherMap', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Get weather forecast (5 days / 3 hours)
 * @param location - City name, state code, country code
 * @param units - Temperature units
 * @param apiKey - OpenWeatherMap API key
 */
export async function openweatherForecast(
  location: string,
  units: 'metric' | 'imperial' | 'kelvin' = 'metric',
  apiKey?: string
): Promise<StratixApiResponse<any>> {
  try {
    const key = apiKey || process.env.OPENWEATHER_API_KEY;
    
    if (!key) {
      throw new Error('OpenWeatherMap API key is required');
    }
    
    await rateLimiters.openWeather.waitIfNeeded();
    
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&appid=${key}&units=${units}`;
    
    console.log('OpenWeatherMap Forecast API: Fetching forecast for', { location, units });
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`OpenWeatherMap Forecast API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.cod && data.cod !== '200') {
      throw new Error(`OpenWeatherMap Forecast API error: ${data.cod} - ${data.message || 'Unknown error'}`);
    }
    
    return createSuccessResponse(data, 'OpenWeatherMap Forecast', {
      rate_limit: {
        remaining: 59,
      }
    });
    
  } catch (error) {
    console.error('OpenWeatherMap Forecast API error:', error);
    return createErrorResponse('OpenWeatherMap Forecast', error instanceof Error ? error.message : 'Unknown error');
  }
}