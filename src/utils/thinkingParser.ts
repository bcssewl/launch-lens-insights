/**
 * ThinkingParser - Robust parser for <think> tags in streaming content
 * Handles edge cases like split tags, nested thinking, and buffer cleanup
 */

export interface ThinkingPhase {
  phase: 'idle' | 'thinking' | 'generating' | 'done';
  progress: number;
  thoughts: string[];
  totalThoughts: number;
}

export class ThinkingParser {
  private buffer = '';
  private thoughts: string[] = [];
  private thinkingNestLevel = 0;
  private phase: ThinkingPhase['phase'] = 'idle';
  private isThinkingActive = false;

  /**
   * Process incoming chunk and extract thinking content
   */
  processChunk(chunk: string): ThinkingPhase {
    // Append chunk to buffer for complete tag detection
    this.buffer += chunk;

    // Process all complete <think>...</think> pairs
    while (this.buffer.includes('<think>') && this.buffer.includes('</think>')) {
      this.extractThinkingBlock();
    }

    // Update phase based on current state
    this.updatePhase();

    return this.getCurrentPhase();
  }

  /**
   * Extract one complete thinking block from buffer
   */
  private extractThinkingBlock(): void {
    const startTag = '<think>';
    const endTag = '</think>';
    
    const startIndex = this.buffer.indexOf(startTag);
    const endIndex = this.buffer.indexOf(endTag);

    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
      return;
    }

    // Handle nested <think> tags by counting levels
    let currentPos = startIndex + startTag.length;
    let nestLevel = 1;
    
    while (currentPos < endIndex && nestLevel > 0) {
      const nextStart = this.buffer.indexOf(startTag, currentPos);
      const nextEnd = this.buffer.indexOf(endTag, currentPos);
      
      if (nextStart !== -1 && nextStart < nextEnd) {
        nestLevel++;
        currentPos = nextStart + startTag.length;
      } else if (nextEnd !== -1) {
        nestLevel--;
        currentPos = nextEnd + endTag.length;
      } else {
        break;
      }
    }

    // Extract thinking content (sanitized and limited)
    const thinkingContent = this.buffer
      .slice(startIndex + startTag.length, endIndex)
      .replace(/<\/?[^>]+>/g, '') // Remove any HTML tags
      .trim()
      .slice(0, 180); // Limit to 180 chars per thought

    if (thinkingContent && thinkingContent.length > 10) {
      this.thoughts.push(thinkingContent);
      this.isThinkingActive = true;
    }

    // Clean up buffer - remove processed content including stale tail
    this.buffer = this.buffer.slice(endIndex + endTag.length);
  }

  /**
   * Update current phase based on thinking state
   */
  private updatePhase(): void {
    if (this.isThinkingActive && this.thoughts.length > 0) {
      if (this.buffer.includes('<think>') || this.thoughts.length < 3) {
        this.phase = 'thinking';
      } else {
        this.phase = 'generating';
      }
    } else if (this.thoughts.length === 0) {
      this.phase = 'idle';
    }
  }

  /**
   * Force completion of thinking phase
   */
  forceComplete(): ThinkingPhase {
    this.phase = 'done';
    this.isThinkingActive = false;
    return this.getCurrentPhase();
  }

  /**
   * Get current thinking phase with progress calculation
   */
  getCurrentPhase(): ThinkingPhase {
    const progress = this.calculateProgress();
    
    return {
      phase: this.phase,
      progress,
      thoughts: [...this.thoughts], // Return copy to prevent mutations
      totalThoughts: this.thoughts.length
    };
  }

  /**
   * Calculate smooth progress with linear interpolation
   */
  private calculateProgress(): number {
    const thoughtCount = this.thoughts.length;
    const expectedThoughts = 8; // Reasonable estimate for typical reasoning

    switch (this.phase) {
      case 'idle':
        return 0;
      case 'thinking':
        // Linear interpolation: 10% + (thoughtCount * (30% / expectedThoughts))
        return Math.min(40, 10 + (thoughtCount * (30 / expectedThoughts)));
      case 'generating':
        return Math.min(95, 40 + (thoughtCount * (55 / expectedThoughts)));
      case 'done':
        return 100;
      default:
        return 0;
    }
  }

  /**
   * Reset parser state
   */
  reset(): void {
    this.buffer = '';
    this.thoughts = [];
    this.thinkingNestLevel = 0;
    this.phase = 'idle';
    this.isThinkingActive = false;
  }

  /**
   * Get sanitized thoughts for display
   */
  getThoughts(): string[] {
    return this.thoughts.map(thought => 
      thought.replace(/<\/?[^>]+>/g, '').slice(0, 180)
    );
  }
}