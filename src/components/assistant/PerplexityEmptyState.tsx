
import React from 'react';
import { Logo } from '@/components/icons';
import { Target, Lightbulb, Globe, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EnhancedChatInput from './EnhancedChatInput';

interface PerplexityEmptyStateProps {
  onSendMessage: (message: string) => void;
}

const PerplexityEmptyState: React.FC<PerplexityEmptyStateProps> = ({ onSendMessage }) => {
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

      {/* Enhanced Chat Input with Voice Recording */}
      <div className="w-full max-w-4xl mb-12">
        <EnhancedChatInput 
          onSendMessage={onSendMessage}
          isTyping={false}
          isCompact={false}
        />
      </div>

      {/* Icon Buttons Row - Positioned Below Input */}
      <div className="flex items-center justify-center space-x-2 px-2">
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
      </div>
    </div>
  );
};

export default PerplexityEmptyState;
