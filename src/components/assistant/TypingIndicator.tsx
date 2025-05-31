
import React from 'react';
import { Loader2 } from 'lucide-react';
import AIAvatar from '@/components/assistant/AIAvatar';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start space-x-4">
      <AIAvatar className="w-10 h-10" />
      <div className="bg-card/80 backdrop-blur-sm border border-border/50 text-muted-foreground p-4 rounded-2xl rounded-tl-md max-w-xs md:max-w-md lg:max-w-lg animate-pulse shadow-sm">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="text-sm text-primary">AI is thinking...</span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
