import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Square, Mic, MicOff } from 'lucide-react';
import { useEnhancedDeerStreaming } from '@/hooks/useEnhancedDeerStreaming';
import { cn } from '@/lib/utils';

interface InputBoxProps {
  onSendMessage?: (message: string) => void;
}

export const InputBox = ({ onSendMessage }: InputBoxProps) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { startDeerFlowStreaming, stopStreaming, isStreaming } = useEnhancedDeerStreaming();

  const handleSendMessage = useCallback(async (message: string) => {
    if (onSendMessage) {
      onSendMessage(message);
    } else {
      // Use the enhanced DeerFlow streaming
      await startDeerFlowStreaming(message);
    }
  }, [onSendMessage, startDeerFlowStreaming]);

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || isStreaming) return;
    
    const message = input.trim();
    setInput('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    try {
      await handleSendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [input, isStreaming, handleSendMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }, []);

  const toggleRecording = useCallback(() => {
    setIsRecording(!isRecording);
    // Voice recording implementation would go here
  }, [isRecording]);

  return (
    <div className={cn(
      // Use platform's input container styling
      "relative w-full max-w-4xl mx-auto",
      "bg-background border border-border rounded-lg",
      "transition-shadow duration-200",
      "focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40"
    )}>
      <div className="flex items-end gap-2 p-3">
        {/* Voice recording button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleRecording}
          disabled={isStreaming}
          className={cn(
            "flex-shrink-0 w-9 h-9 p-0",
            isRecording && "text-red-500 bg-red-50 dark:bg-red-950/20"
          )}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </Button>

        {/* Input textarea */}
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything about your research..."
          disabled={isStreaming}
          className={cn(
            "flex-1 min-h-[40px] max-h-[120px] resize-none",
            "border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0",
            "placeholder:text-muted-foreground"
          )}
          rows={1}
        />

        {/* Send/Stop button */}
        <Button
          onClick={isStreaming ? stopStreaming : handleSubmit}
          disabled={!input.trim() && !isStreaming}
          size="sm"
          className={cn(
            "flex-shrink-0 w-9 h-9 p-0",
            isStreaming && "bg-red-500 hover:bg-red-600 text-white"
          )}
        >
          {isStreaming ? (
            <Square className="w-4 h-4" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Status indicator */}
      {isStreaming && (
        <div className="absolute -top-8 left-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            DeerFlow is thinking...
          </div>
        </div>
      )}
    </div>
  );
};