
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isTyping: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isTyping, 
  placeholder = "Type your message..." 
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

  return (
    <div className="flex items-end space-x-2 p-4 border-t bg-background/80 backdrop-blur-sm">
      <div className="flex-1 relative">
        <Textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
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
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
