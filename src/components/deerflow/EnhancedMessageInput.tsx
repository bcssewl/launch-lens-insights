import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Send, Sparkles, ChevronDown } from 'lucide-react';
import { useDeerFlowStore } from '@/stores/deerFlowStore';
import { useStreamingChat } from '@/hooks/useStreamingChat';

interface EnhancedMessageInputProps {
  onSendMessage: (message: string) => void;
}

export const EnhancedMessageInput: React.FC<EnhancedMessageInputProps> = ({ onSendMessage }) => {
  const { isResponding, settings } = useDeerFlowStore();
  const [inputValue, setInputValue] = React.useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isResponding) return;
    
    onSendMessage(inputValue.trim());
    setInputValue('');
  }, [inputValue, isResponding, onSendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What can I do for you?"
            disabled={isResponding}
            className="w-full h-12 px-4 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
          />
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isResponding}
          className="h-12 px-4"
        >
          Investigation
        </Button>
        
        <Button
          type="submit"
          disabled={isResponding || !inputValue.trim()}
          size="sm"
          className="h-12 px-4"
        >
          {isResponding ? (
            <span className="text-sm">Thinking...</span>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </>
          )}
        </Button>
      </form>
    </div>
  );
};