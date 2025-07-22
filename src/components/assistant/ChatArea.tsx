import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import { cn } from '@/lib/utils';
import { useChatHistory } from '@/hooks/useChatHistory';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import TypingIndicator from './TypingIndicator';
import StreamingOverlay from './StreamingOverlay';
import SourceCard from './SourceCard';
import DeerStreamingOverlay from './DeerStreamingOverlay';

interface ChatAreaProps {
  messages: any[];
  isTyping: boolean;
  viewportRef: React.RefObject<HTMLDivElement>;
  onSendMessage: (message: string, attachments?: any[], modelOverride?: string, researchType?: string) => Promise<void>;
  selectedModel: string;
  onOpenCanvas: () => void;
  onCloseCanvas: () => void;
  onCanvasDownload: () => void;
  onCanvasPrint: () => void;
  streamingState?: any;
  stratixStreamingState?: any;
  alegeonStreamingState?: any;
  onAlegeonFastForward?: () => void;
  deerStreamingState?: any;
  onDeerRetry?: () => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isTyping,
  viewportRef,
  onSendMessage,
  selectedModel,
  onOpenCanvas,
  onCloseCanvas,
  onCanvasDownload,
  onCanvasPrint,
  streamingState,
  stratixStreamingState,
  alegeonStreamingState,
  onAlegeonFastForward,
  deerStreamingState,
  onDeerRetry
}) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    // Scroll to the bottom when messages change
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-hidden bg-transparent">
      <div className="px-6 py-4 bg-transparent">
        <h1 className="font-semibold text-lg">Chat</h1>
        <p className="text-sm text-muted-foreground">
          This is a sample chat area.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => {
          return (
            <div key={index}>
              <ChatMessage
                message={message}
                isStreaming={streamingState?.isStreaming && streamingState?.currentMessageId === message.id}
                streamingUpdates={streamingState?.updates}
                onOpenCanvas={onOpenCanvas ? (messageId: string, content: string) => onOpenCanvas() : undefined}
                onCanvasDownload={onCanvasDownload}
                onCanvasPrint={onCanvasPrint}
                onAlegeonFastForward={onAlegeonFastForward}
                alegeonStreamingState={alegeonStreamingState}
              />
              {stratixStreamingState?.sources && stratixStreamingState?.sources[message.id] && (
                <div className="mt-2 space-y-2">
                  {Object.values(stratixStreamingState.sources[message.id]).map((source: any, index: number) => (
                    <SourceCard 
                      key={index} 
                      name={source.name}
                      url={source.url}
                      type={source.type || 'web'}
                      confidence={source.confidence || 80}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {isTyping && selectedModel !== 'deer' && (
          <TypingIndicator />
        )}
      </div>
      
      {/* Deer Streaming Overlay */}
      {deerStreamingState && (deerStreamingState.isStreaming || deerStreamingState.error || deerStreamingState.finalContent) && (
        <div className="max-w-4xl mx-auto px-6 mb-6">
          <DeerStreamingOverlay 
            streamingState={deerStreamingState}
            onRetry={onDeerRetry}
          />
        </div>
      )}
      
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatArea;
