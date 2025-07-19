export interface ThinkingState {
  phase: 'idle' | 'thinking' | 'generating' | 'done';
  thoughts: string[];
  finalContent: string;
  progress: number;
  thinkingNestLevel: number;
}

export class ThinkingParser {
  private buffer: string = '';
  private state: ThinkingState = {
    phase: 'idle',
    thoughts: [],
    finalContent: '',
    progress: 0,
    thinkingNestLevel: 0
  };
  
  private onStateChange?: (state: ThinkingState) => void;

  constructor(onStateChange?: (state: ThinkingState) => void) {
    this.onStateChange = onStateChange;
  }

  // Hash session ID for privacy-safe telemetry
  private async hashSessionId(sessionId: string): Promise<string> {
    try {
      // Use crypto.subtle.digest for proper hashing instead of btoa
      const encoder = new TextEncoder();
      const data = encoder.encode(sessionId);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      // Truncate to 16 chars for telemetry
      return hashHex.slice(0, 16);
    } catch (error) {
      // Fallback for environments without crypto.subtle
      return sessionId.slice(0, 8) + '***';
    }
  }

  processChunk(chunk: string): void {
    this.buffer += chunk;
    
    // Process any complete <think>...</think> pairs
    while (this.buffer.includes('<think>') && this.buffer.includes('</think>')) {
      this.extractThoughts();
    }
    
    // Check for start of thinking
    if (this.buffer.includes('<think>') && this.state.phase === 'idle') {
      this.setState({ phase: 'thinking' });
    }
  }

  private extractThoughts(): void {
    const thinkStart = this.buffer.indexOf('<think>');
    const thinkEnd = this.buffer.indexOf('</think>');
    
    if (thinkStart !== -1 && thinkEnd !== -1 && thinkEnd > thinkStart) {
      this.state.thinkingNestLevel++;
      
      const thinkingContent = this.buffer.slice(thinkStart + 7, thinkEnd);
      const thoughts = thinkingContent.split('\n')
        .map(line => this.sanitizeThought(line.trim()))
        .filter(line => line.length > 0);
      
      this.setState({
        thoughts: [...this.state.thoughts, ...thoughts],
        progress: this.calculateProgress()
      });
      
      this.state.thinkingNestLevel--;
      
      // Clean up buffer when nest level returns to 0
      if (this.state.thinkingNestLevel === 0) {
        this.buffer = this.buffer.slice(thinkEnd + 8);
        this.setState({ phase: 'generating' });
      }
    }
  }

  private sanitizeThought(raw: string): string {
    // Remove HTML tags and limit length
    return raw.replace(/<\/?[^>]+>/g, '').slice(0, 180);
  }

  private calculateProgress(): number {
    const thoughtCount = this.state.thoughts.length;
    if (this.state.phase === 'thinking') {
      // Linear interpolation: start at 10%, grow to 40% over 30 thoughts
      return Math.min(10 + (thoughtCount * (30 / 30)), 40);
    }
    if (this.state.phase === 'generating') return 95;
    if (this.state.phase === 'done') return 100;
    return 0;
  }

  private setState(updates: Partial<ThinkingState>): void {
    this.state = { ...this.state, ...updates };
    this.onStateChange?.(this.state);
  }

  getState(): ThinkingState {
    return { ...this.state };
  }

  async getTelemetryData(sessionId: string): Promise<{
    sessionHash: string;
    totalThinkingSteps: number;
    finalTokens: number;
  }> {
    return {
      sessionHash: await this.hashSessionId(sessionId),
      totalThinkingSteps: this.state.thoughts.length,
      finalTokens: this.state.finalContent.length
    };
  }

  reset(): void {
    this.buffer = '';
    this.state = {
      phase: 'idle',
      thoughts: [],
      finalContent: '',
      progress: 0,
      thinkingNestLevel: 0
    };
  }
}