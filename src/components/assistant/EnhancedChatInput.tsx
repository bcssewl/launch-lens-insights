
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    onSendMessage(inputValue);
    setInputValue('');
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
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about your startup ideas..."
            className="w-full h-14 pl-12 pr-20 text-lg rounded-full border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground"
            disabled={isTyping}
          />
          <div className="absolute inset-y-0 right-2 flex items-center space-x-1">
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

  // Compact state - used in conversation
  return (
    <div className="border-t bg-background/80 backdrop-blur-sm p-4">
      <div className="flex items-end space-x-3 max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a follow-up question..."
            className="w-full h-12 px-4 pr-12 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground"
            disabled={isTyping}
          />
          <div className="absolute inset-y-0 right-1 flex items-center">
            <Button
              onClick={handleSendMessage}
              size="icon"
              disabled={isTyping || inputValue.trim() === ''}
              className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50"
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
