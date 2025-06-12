
import React from 'react';
import { Loader2 } from 'lucide-react';
import AIAvatar from '@/components/assistant/AIAvatar';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start space-x-3">
      <AIAvatar />
      <div className="bg-muted text-muted-foreground p-3 rounded-2xl rounded-bl-sm max-w-xs md:max-w-md lg:max-w-lg animate-pulse">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Thinking...</span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
