
import React from 'react';
import EnhancedChatInput from './EnhancedChatInput';

interface ChatEmptyStateProps {
  onSendMessage: (message: string) => void;
  isTyping: boolean;
}

const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({ onSendMessage, isTyping }) => {
  const suggestedPrompts = [
    "Help me validate my business idea",
    "What are the latest trends in my industry?",
    "How can I improve my product-market fit?",
    "What should I focus on for customer acquisition?"
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          AI Business Assistant
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Get expert insights and guidance for your startup journey
        </p>
      </div>

      <div className="w-full mb-8">
        <EnhancedChatInput 
          onSendMessage={onSendMessage} 
          isTyping={isTyping}
          isCompact={false}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        {suggestedPrompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onSendMessage(prompt)}
            disabled={isTyping}
            className="p-4 text-left rounded-lg border border-border bg-card hover:bg-accent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <p className="text-sm text-muted-foreground">{prompt}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatEmptyState;
