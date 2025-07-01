
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
      {/* Enhanced glass logo section */}
      <div className="mb-12">
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 bg-background/40 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
            <Logo className="w-12 h-12" />
          </div>
        </div>
        <h1 className="text-4xl font-semibold text-foreground mb-4 tracking-tight">
          AI Business Assistant
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Get instant insights, market analysis, and strategic advice for your startup ideas. 
          Ask anything about business validation, market research, or growth strategies.
        </p>
      </div>

      {/* Enhanced glass input area */}
      <div className="w-full max-w-4xl mb-12">
        {/* Glass input container */}
        <div className="relative bg-background/50 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4 shadow-2xl hover:shadow-3xl transition-all duration-300 mb-3">
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-2xl pointer-events-none" />
          <input
            type="text"
            placeholder="Ask anything or @ mention a Space"
            className="w-full h-12 text-base bg-transparent border-none outline-none focus:outline-none placeholder:text-muted-foreground relative z-10"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                handlePromptClick(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
        </div>

        {/* Enhanced glass icon buttons */}
        <div className="flex items-center justify-between px-2">
          {/* Left side glass button group */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-background/30 backdrop-blur-sm border border-white/10 hover:bg-background/50 hover:border-white/20 text-muted-foreground hover:text-foreground transition-all duration-200 shadow-lg"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-background/30 backdrop-blur-sm border border-white/10 hover:bg-background/50 hover:border-white/20 text-muted-foreground hover:text-foreground transition-all duration-200 shadow-lg"
            >
              <Target className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-background/30 backdrop-blur-sm border border-white/10 hover:bg-background/50 hover:border-white/20 text-muted-foreground hover:text-foreground transition-all duration-200 shadow-lg"
            >
              <Lightbulb className="h-5 w-5" />
            </Button>
          </div>

          {/* Right side glass button group */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-background/30 backdrop-blur-sm border border-white/10 hover:bg-background/50 hover:border-white/20 text-muted-foreground hover:text-foreground transition-all duration-200 shadow-lg"
            >
              <Globe className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-background/30 backdrop-blur-sm border border-white/10 hover:bg-background/50 hover:border-white/20 text-muted-foreground hover:text-foreground transition-all duration-200 shadow-lg"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-background/30 backdrop-blur-sm border border-white/10 hover:bg-background/50 hover:border-white/20 text-muted-foreground hover:text-foreground transition-all duration-200 shadow-lg"
            >
              <Mic className="h-5 w-5" />
            </Button>
            {/* Enhanced glass audio button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-primary/20 backdrop-blur-md hover:bg-primary/30 text-primary border border-primary/30 hover:border-primary/50 shadow-xl shadow-primary/20 transition-all duration-200"
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
