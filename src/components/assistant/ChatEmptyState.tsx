import React from 'react';

const ChatEmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-72 text-center text-muted-foreground animate-fade-in">
    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/10 to-muted flex items-center justify-center mb-4">
      <span className="text-3xl">💡</span>
    </div>
    <h3 className="text-lg font-semibold mb-2">Start chatting with your advisor</h3>
    <p className="text-sm mb-2 max-w-xs">
      Ask any question about your startup idea, get instant feedback, or try one of the suggested prompts below.
    </p>
    <div className="mt-1 text-xs opacity-80">Try: "What is a good market for an AI fitness app?"</div>
  </div>
);

export default ChatEmptyState;
