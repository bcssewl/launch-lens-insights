
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Search, Mic, Plus, Send } from 'lucide-react';

interface EnhancedChatInputProps {
  onSendMessage: (message: string) => void;
  isTyping: boolean;
  isCompact?: boolean;
}

const EnhancedChatInput: React.FC<EnhancedChatInputProps> = ({ 
  onSendMessage, 
  isTyping, 
  isCompact = false 
}) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    onSendMessage(inputValue);
    setInputValue('');
    // Reset textarea height after sending
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  const adjustInputFocus = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    if (!isCompact) {
      adjustInputFocus();
    }
  }, [isCompact]);

  if (!isCompact) {
    // Prominent state - used in empty state
    return (
      <div className="w-full max-w-3xl">
        <div className="relative">
          <div className="absolute top-4 left-4 flex items-start pointer-events-none z-10">
            <Search className="h-5 w-5 text-muted-foreground mt-0.5" />
          </div>
          <Textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about your startup ideas..."
            autoExpand={true}
            className="w-full min-h-[56px] max-h-[216px] pl-12 pr-20 text-lg rounded-2xl border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground resize-none overflow-y-auto py-4"
            style={{ lineHeight: '1.5rem' }}
            disabled={isTyping}
          />
          <div className="absolute top-2 right-2 flex items-start space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-muted"
              disabled={isTyping}
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-muted"
              disabled={isTyping}
            >
              <Plus className="h-4 w-4" />
            </Button>
            {inputValue.trim() && (
              <Button
                onClick={handleSendMessage}
                size="icon"
                className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90"
                disabled={isTyping}
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Compact state - ChatGPT-style centered input without full-width footer
  return (
    <div className="py-4 px-6">
      <div className="flex items-end justify-center">
        <div className="w-full max-w-3xl relative">
          <Textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a follow-up question..."
            autoExpand={true}
            className="w-full min-h-[48px] max-h-[216px] px-4 pr-12 rounded-2xl border border-border bg-background/80 backdrop-blur-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground resize-none overflow-y-auto py-3"
            style={{ lineHeight: '1.5rem' }}
            disabled={isTyping}
          />
          <div className="absolute bottom-2 right-2 flex items-end">
            <Button
              onClick={handleSendMessage}
              size="icon"
              disabled={isTyping || inputValue.trim() === ''}
              className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
              {isTyping ? (
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-white rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedChatInput;
