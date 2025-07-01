
import React from 'react';
import { Logo } from '@/components/icons';
import { Search, Mic, Plus } from 'lucide-react';
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

      {/* Main Search Input Area */}
      <div className="w-full max-w-3xl mb-12">
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Ask me anything about your startup ideas..."
            className="w-full h-14 pl-12 pr-20 text-lg rounded-full border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                handlePromptClick(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
          <div className="absolute inset-y-0 right-2 flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-muted"
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-muted"
            >
              <Plus className="h-4 w-4" />
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
