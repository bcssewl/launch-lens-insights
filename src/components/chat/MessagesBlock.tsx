import { useState } from 'react';
import { cn } from '@/lib/utils';
import { AlegeonStreamingStateV2 } from '@/hooks/useAlegeonStreamingV2';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MessagesBlockProps {
  className?: string;
  setOpenResearchId: (id: string | null) => void;
  streamingState: AlegeonStreamingStateV2;
  startStreaming: (query: string) => Promise<string>;
}

const MessagesBlock = ({
  className,
  setOpenResearchId,
  streamingState,
  startStreaming,
}: MessagesBlockProps) => {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<Array<{ type: 'user' | 'ai'; text: string }>>([]);

  const {
    isStreaming,
    displayedText,
    citations,
    error,
    isComplete,
    progress,
    progressDetail,
  } = streamingState;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isStreaming) return;

    // Simple heuristic to detect a research query
    if (message.toLowerCase().includes('analyze')) {
      setOpenResearchId(`research-${Date.now()}`);
    }

    const userMessage = { type: 'user' as const, text: message };
    setConversation(prev => [...prev, userMessage]);
    
    try {
      const response = await startStreaming(message);
      const aiMessage = { type: 'ai' as const, text: response };
      setConversation(prev => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage = { type: 'ai' as const, text: 'Sorry, something went wrong.' };
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setMessage('');
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <ScrollArea className="flex-grow p-4">
        <div className="space-y-4">
          {conversation.map((entry, index) => (
            <div
              key={index}
              className={cn(
                "p-4 rounded-lg shadow",
                entry.type === 'user'
                  ? "bg-blue-100 dark:bg-blue-900 text-right"
                  : "bg-white dark:bg-gray-700"
              )}
            >
              <p>{entry.text}</p>
            </div>
          ))}
          {isStreaming && (
            <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
              <p>{displayedText}</p>
              {progress < 100 && <p>Progress: {progress}% - {progressDetail}</p>}
            </div>
          )}
          {error && <p className="text-red-500">{error}</p>}
        </div>
      </ScrollArea>
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow"
          />
          <Button type="submit" disabled={isStreaming}>
            {isStreaming ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MessagesBlock;
