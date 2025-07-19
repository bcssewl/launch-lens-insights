/**
 * @file thinkingParser.ts
 * @description Incremental parser for extracting <think>...</think> blocks from a stream.
 *
 * Handles split tags, nested tags, and sanitizes thought lines.
 */

export type ThinkingPhase = 'idle' | 'thinking' | 'generating' | 'done' | 'error';

export interface ThinkingState {
  phase: ThinkingPhase;
  thoughts: string[];
  isThinking: boolean;
  finalContent: string;
}

const MAX_THOUGHT_LINES = 100;
const MAX_THOUGHT_LENGTH = 180;

export class ThinkingParser {
  private buffer = '';
  private thinkLevel = 0;
  private thoughts: string[] = [];
  private finalContent = '';
  private phase: ThinkingPhase = 'idle';

  public parse(chunk: string): void {
    this.buffer += chunk;

    if (this.phase === 'idle' && this.buffer.includes('<think>')) {
      this.phase = 'thinking';
    }

    let thinkStart = this.buffer.indexOf('<think>');
    while (thinkStart !== -1) {
      this.thinkLevel++;
      this.buffer = this.buffer.substring(thinkStart + 7);
      thinkStart = this.buffer.indexOf('<think>');
    }

    let thinkEnd = this.buffer.indexOf('</think>');
    while (thinkEnd !== -1) {
      this.thinkLevel--;
      const thoughtContent = this.buffer.substring(0, thinkEnd);
      this.processThought(thoughtContent);
      this.buffer = this.buffer.substring(thinkEnd + 8);

      if (this.thinkLevel === 0) {
        this.phase = 'generating';
      }
      thinkEnd = this.buffer.indexOf('</think>');
    }

    if (this.phase === 'thinking' && this.thinkLevel > 0) {
      // We are inside a think block, process content up to the next potential tag
      const nextTag = this.buffer.indexOf('<');
      const contentToProcess = nextTag === -1 ? this.buffer : this.buffer.substring(0, nextTag);
      if (contentToProcess) {
        this.processThought(contentToProcess);
        this.buffer = this.buffer.substring(contentToProcess.length);
      }
    } else if (this.phase === 'generating') {
      this.finalContent += this.buffer;
      this.buffer = '';
    }
  }

  private processThought(content: string): void {
    if (!content.trim()) return;

    const sanitized = content
      .replace(/<[^>]*>?/gm, '') // Strip any remaining HTML tags
      .trim();

    if (sanitized) {
      const lines = sanitized.split('\n').map(line => line.trim());
      for (const line of lines) {
        if (line) {
          this.thoughts.push(line.substring(0, MAX_THOUGHT_LENGTH));
          if (this.thoughts.length > MAX_THOUGHT_LINES) {
            this.thoughts.shift(); // Keep the list trimmed
          }
        }
      }
    }
  }

  public getState(): ThinkingState {
    return {
      phase: this.phase,
      thoughts: [...this.thoughts],
      isThinking: this.phase === 'thinking',
      finalContent: this.finalContent,
    };
  }

  public complete(): void {
    if (this.buffer) {
      if (this.phase === 'thinking') {
        this.processThought(this.buffer);
      } else {
        this.finalContent += this.buffer;
      }
      this.buffer = '';
    }
    this.phase = 'done';
  }

  public reset(): void {
    this.buffer = '';
    this.thinkLevel = 0;
    this.thoughts = [];
    this.finalContent = '';
    this.phase = 'idle';
  }
}
