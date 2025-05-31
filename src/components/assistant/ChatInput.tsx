
import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowRight, Paperclip, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isTyping: boolean;
  isHeroMode?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isTyping, isHeroMode = false }) => {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = isHeroMode ? 80 : 120;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  if (isHeroMode) {
    return (
      <div className="w-full space-y-4">
        {/* Hero Input */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative flex items-center bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-2 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 px-4 py-2 flex-1">
              <Paperclip className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Sparkles className="w-5 h-5 text-primary" />
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="How can AI help you build your startup today?"
                className="flex-1 border-0 bg-transparent resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/70"
                disabled={isTyping}
                rows={1}
              />
              <Button 
                onClick={handleSendMessage}
                size="sm" 
                disabled={isTyping || inputValue.trim() === ''} 
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-10 w-10 p-0 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          {[
            "Launch a SaaS with AI integration",
            "Develop an e-commerce platform",
            "Build a marketplace with React",
            "Generate business model canvas",
            "Create competitive analysis"
          ].map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onSendMessage(suggestion)}
              className="rounded-xl bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 hover:border-primary/30 transition-all duration-200"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-border/20 bg-background/80 backdrop-blur-sm p-6 flex-shrink-0 mt-auto">
      <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-end space-x-4">
        <div className="flex-1 relative">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center bg-card/60 backdrop-blur-sm border border-border/30 rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-200">
              <Paperclip className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer transition-colors mr-3" />
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about your startup ideas... (Press Shift+Enter for new line)"
                className="flex-1 border-0 bg-transparent resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-muted-foreground/70 min-h-[40px] max-h-[120px]"
                disabled={isTyping}
                rows={1}
              />
            </div>
          </div>
        </div>
        <Button 
          type="submit" 
          size="icon" 
          disabled={isTyping || inputValue.trim() === ''} 
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-12 w-12 shadow-md hover:shadow-lg transition-all duration-200 flex-shrink-0"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};

export default ChatInput;
