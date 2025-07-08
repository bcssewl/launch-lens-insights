// Common types and utilities for Stratix API wrappers
export interface StratixApiResponse<T = any> {
  ok: boolean;
  data: T;
  source_meta: {
    source: string;
    timestamp: string;
    rate_limit?: {
      remaining?: number;
      reset?: number;
    };
    cached?: boolean;
  };
}

export interface StratixApiError {
  ok: false;
  data: null;
  source_meta: {
    source: string;
    timestamp: string;
    error: string;
  };
}

// Rate limiting utility
class RateLimiter {
  private calls: number[] = [];
  
  constructor(
    private maxCalls: number,
    private windowMs: number
  ) {}
  
  async canMakeRequest(): Promise<boolean> {
    const now = Date.now();
    this.calls = this.calls.filter(time => now - time < this.windowMs);
    return this.calls.length < this.maxCalls;
  }
  
  async waitIfNeeded(): Promise<void> {
    if (!await this.canMakeRequest()) {
      const oldestCall = Math.min(...this.calls);
      const waitTime = this.windowMs - (Date.now() - oldestCall) + 100; // 100ms buffer
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    this.calls.push(Date.now());
  }
}

export const rateLimiters = {
  alphaVantage: new RateLimiter(5, 60 * 1000), // 5 calls per minute
  newsApi: new RateLimiter(1000, 24 * 60 * 60 * 1000), // 1000 calls per day
  openWeather: new RateLimiter(60, 60 * 1000), // 60 calls per minute
};

export function createSuccessResponse<T>(
  data: T,
  source: string,
  meta: Partial<StratixApiResponse['source_meta']> = {}
): StratixApiResponse<T> {
  return {
    ok: true,
    data,
    source_meta: {
      source,
      timestamp: new Date().toISOString(),
      ...meta
    }
  };
}

export function createErrorResponse(
  source: string,
  error: string
): StratixApiError {
  return {
    ok: false,
    data: null,
    source_meta: {
      source,
      timestamp: new Date().toISOString(),
      error
    }
  };
}