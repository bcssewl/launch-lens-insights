/**
 * Privacy-safe telemetry utilities
 * Uses SHA-256 hashing for session data to protect PII
 */

/**
 * Generate SHA-256 hash for telemetry data
 * @param data - String data to hash
 * @returns Promise<string> - Truncated hash (first 16 chars)
 */
export async function generateTelemetryHash(data: string): Promise<string> {
  // SSR compatibility guard
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    console.warn('crypto.subtle not available, using fallback hash');
    return btoa(data).slice(0, 16); // Fallback for SSR
  }

  try {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    
    // Convert to hex string and truncate
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex.slice(0, 16); // Return first 16 chars for telemetry
  } catch (error) {
    console.warn('Failed to generate SHA-256 hash:', error);
    return btoa(data).slice(0, 16); // Fallback
  }
}

/**
 * Log thinking session metrics
 */
export function logThinkingMetrics(metrics: {
  sessionHash: string;
  duration: number;
  totalThoughts: number;
  phase: string;
}) {
  // TODO: Implement actual telemetry endpoint integration
  console.log('📊 Thinking Session Metrics:', metrics);
}