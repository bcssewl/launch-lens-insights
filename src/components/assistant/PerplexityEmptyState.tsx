
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
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 py-12 text-center max-w-4xl mx-auto">
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
        <div className="relative flex items-center bg-background border border-border rounded-xl px-3 py-4 shadow-sm hover:shadow-md transition-all duration-200">
          {/* Left Side Button Group */}
          <div className="flex items-center space-x-2 pl-2">
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

          {/* Main Input Field */}
          <input
            type="text"
            placeholder="Ask anything or @ mention a Space"
            className="flex-1 h-14 px-6 text-base bg-transparent border-none outline-none focus:outline-none placeholder:text-muted-foreground"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                handlePromptClick(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />

          {/* Right Side Button Group */}
          <div className="flex items-center space-x-2 pr-2">
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

      {/* Features Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Search className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-medium text-foreground mb-2">Market Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Get comprehensive market insights and validation reports
          </p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Plus className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-medium text-foreground mb-2">Strategic Advice</h3>
          <p className="text-sm text-muted-foreground">
            AI-powered business strategies and growth recommendations
          </p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Mic className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-medium text-foreground mb-2">Voice Input</h3>
          <p className="text-sm text-muted-foreground">
            Speak your ideas and get instant feedback and analysis
          </p>
        </div>
      </div>
    </div>
  );
};

export default PerplexityEmptyState;
