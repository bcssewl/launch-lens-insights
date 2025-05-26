
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, CornerDownLeft } from 'lucide-react'; // Using CornerDownLeft for potentially clearing conversation

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isTyping?: boolean;
  onClearConversation?: () => void; // Optional clear function
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isTyping, onClearConversation }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputValue.trim() && !isTyping) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t bg-background sticky bottom-0">
      <div className="flex items-center space-x-2">
        {onClearConversation && (
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              onClick={onClearConversation}
              aria-label="Clear conversation"
              className="hidden sm:inline-flex"
            >
              <CornerDownLeft className="h-5 w-5 text-muted-foreground" />
            </Button>
        )}
        <Input
          type="text"
          placeholder="Ask me anything about your startup ideas..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isTyping}
          className="flex-grow"
        />
        <Button type="submit" size="icon" disabled={isTyping || !inputValue.trim()} aria-label="Send message">
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;
