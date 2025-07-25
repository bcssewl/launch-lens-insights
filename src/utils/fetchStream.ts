/**
 * A utility function that handles Server-Sent Events (SSE) streams.
 * Yields parsed events from the stream as { event: string, data: string } objects.
 */
export async function* fetchStream(
  url: string, 
  init?: RequestInit
): AsyncGenerator<{ event: string; data: string }, void, unknown> {
  let response: Response;
  let reader: ReadableStreamDefaultReader<Uint8Array>;
  
  try {
    // Make the fetch request
    response = await fetch(url, {
      ...init,
      headers: {
        'Accept': 'text/event-stream',
        ...init?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response body available');
    }

    reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let currentEvent = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }

      // Decode the chunk and add to buffer
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      
      // Process complete lines
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip empty lines and comments
        if (trimmedLine === '' || trimmedLine.startsWith(':')) {
          continue;
        }
        
        // Parse SSE format
        if (trimmedLine.startsWith('event: ')) {
          currentEvent = trimmedLine.slice(7).trim();
        } else if (trimmedLine.startsWith('data: ')) {
          const data = trimmedLine.slice(6);
          
          // Yield the complete event
          yield {
            event: currentEvent || 'message',
            data: data
          };
          
          // Reset event type after yielding
          currentEvent = '';
        }
      }
    }
  } catch (error) {
    throw new Error(`Stream fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    // Cleanup resources
    try {
      if (reader!) {
        reader.releaseLock();
      }
    } catch {
      // Ignore cleanup errors
    }
  }
}