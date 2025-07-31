import React, { useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useDeerFlowMessageStore } from '@/stores/deerFlowMessageStore';
import NovelMessageInput, { type NovelMessageInputRef, type Resource } from './NovelMessageInput';

interface EnhancedMessageInputProps {
  onSendMessage: (message: string) => void;
}

export const EnhancedMessageInput: React.FC<EnhancedMessageInputProps> = ({ onSendMessage }) => {
  const { isResponding } = useDeerFlowMessageStore();
  const editorRef = useRef<NovelMessageInputRef>(null);

  const handleSendMessage = useCallback((message: string, resources: Resource[]) => {
    console.log('Sending message:', message);
    if (resources.length > 0) {
      console.log('With resources:', resources);
    }
    onSendMessage(message);
  }, [onSendMessage]);

  const handleSubmit = useCallback(() => {
    editorRef.current?.submit();
  }, []);

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isResponding}
          className="h-8 px-3"
        >
          Investigation
        </Button>
      </div>
      
      <NovelMessageInput
        ref={editorRef}
        placeholder="What can I do for you?"
        loading={isResponding}
        onEnter={handleSendMessage}
        className="w-full"
      />
    </div>
  );
};