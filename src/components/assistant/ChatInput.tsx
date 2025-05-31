
import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import SuggestedPrompts from '@/components/assistant/SuggestedPrompts';
import { suggestedPromptsData } from '@/constants/aiAssistant';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isTyping: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isTyping }) => {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    onSendMessage(inputValue);
    setInputValue('');
  };

  const handlePromptClick = (prompt: string) => {
    onSendMessage(prompt);
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 120; // Maximum height before scrolling
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  const suggestedPromptsStrings = suggestedPromptsData.map(p => p.text);

  return (
    <div className="border-t bg-background p-4 flex-shrink-0 mt-auto">
      <SuggestedPrompts prompts={suggestedPromptsStrings} onPromptClick={handlePromptClick} />
      <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-end space-x-2 mt-2">
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything about your startup ideas... (Press Shift+Enter for new line)"
          className="flex-1 min-h-[40px] max-h-[120px] resize-none"
          disabled={isTyping}
          rows={1}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={isTyping || inputValue.trim() === ''} 
          className="gradient-button flex-shrink-0"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};

export default ChatInput;
