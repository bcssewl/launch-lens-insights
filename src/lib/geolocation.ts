
interface IPApiResponse {
  country_name: string;
  country: string;
  city: string;
  region: string;
  ip: string;
}

let cachedCountry: string | null = null;

export const getUserCountry = async (): Promise<string> => {
  // Return cached result if available
  if (cachedCountry) {
    return cachedCountry;
  }

  try {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const response = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: IPApiResponse = await response.json();
    
    // Validate the response has the expected field
    if (!data.country_name) {
      throw new Error('Invalid response format');
    }

    // Cache the result
    cachedCountry = data.country_name;
    
    console.log('User country detected:', cachedCountry);
    return cachedCountry;

  } catch (error) {
    console.warn('Failed to get user country:', error);
    
    // Cache the fallback to avoid repeated failed requests
    cachedCountry = 'your region';
    return cachedCountry;
  }
};

// Optional: Function to clear cache if needed
export const clearCountryCache = (): void => {
  cachedCountry = null;
};
