
import React from 'react';
import { Logo } from '@/components/icons';
import { Search, Mic, Plus, Target, Lightbulb, Globe, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PerplexityEmptyStateProps {
  onSendMessage: (message: string) => void;
}

const PerplexityEmptyState: React.FC<PerplexityEmptyStateProps> = ({ onSendMessage }) => {
  const handlePromptClick = (prompt: string) => {
    onSendMessage(prompt);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 py-12 text-center max-w-4xl mx-auto bg-transparent">
      {/* Logo/Branding Section */}
      <div className="mb-12">
        <div className="flex items-center justify-center mb-6">
          <Logo className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-semibold text-foreground mb-4 tracking-tight">
          AI Business Assistant
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Get instant insights, market analysis, and strategic advice for your startup ideas. 
          Ask anything about business validation, market research, or growth strategies.
        </p>
      </div>

      {/* Perplexity Pro-Style Input Area */}
      <div className="w-full max-w-4xl mb-12">
        {/* Input Field Container */}
        <div className="relative bg-background border border-border rounded-xl px-6 py-4 shadow-sm hover:shadow-md transition-all duration-200 mb-3">
          <input
            type="text"
            placeholder="Ask anything or @ mention a Space"
            className="w-full h-12 text-base bg-transparent border-none outline-none focus:outline-none placeholder:text-muted-foreground"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                handlePromptClick(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
        </div>

        {/* Icon Buttons Row - Positioned Below Input */}
        <div className="flex items-center justify-between px-2">
          {/* Left Side Button Group */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground"
            >
              <Target className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground"
            >
              <Lightbulb className="h-5 w-5" />
            </Button>
          </div>

          {/* Right Side Button Group */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground"
            >
              <Globe className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground"
            >
              <Mic className="h-5 w-5" />
            </Button>
            {/* Pro-style Audio Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
            >
              <div className="flex items-center space-x-0.5">
                <div className="w-0.5 h-2 bg-current rounded-full animate-pulse" />
                <div className="w-0.5 h-3 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                <div className="w-0.5 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerplexityEmptyState;
