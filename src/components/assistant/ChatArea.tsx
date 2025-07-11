
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from '@/components/assistant/ChatMessage';
import TypingIndicator from '@/components/assistant/TypingIndicator';
import PerplexityEmptyState from '@/components/assistant/PerplexityEmptyState';
import EnhancedChatInput from '@/components/assistant/EnhancedChatInput';
import { Message } from '@/constants/aiAssistant';

interface StreamingUpdate {
  type: 'search' | 'source' | 'snippet' | 'thought' | 'complete';
  message: string;
  timestamp: number;
  data?: any;
}

interface ChatAreaProps {
  messages: Message[];
  isTyping: boolean;
  viewportRef: React.RefObject<HTMLDivElement>;
  onSendMessage: (message: string, attachments?: any[], selectedModel?: string) => void;
  selectedModel: string;
  canvasState?: {
    isOpen: boolean;
    messageId: string | null;
    content: string;
  };
  onOpenCanvas?: (messageId: string, content: string) => void;
  onCloseCanvas?: () => void;
  onCanvasDownload?: () => void;
  onCanvasPrint?: () => void;
  isStreamingForMessage?: (messageId: string) => boolean;
  getUpdatesForMessage?: (messageId: string) => StreamingUpdate[];
  getSourcesForMessage?: (messageId: string) => Array<{
    name: string;
    url: string;
    type?: string;
    confidence?: number;
  }>;
  getProgressForMessage?: (messageId: string) => {
    phase: string;
    progress: number;
  };
}

const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isTyping,
  viewportRef,
  onSendMessage,
  selectedModel,
  onOpenCanvas,
  onCanvasDownload,
  onCanvasPrint,
  isStreamingForMessage,
  getUpdatesForMessage,
  getSourcesForMessage,
  getProgressForMessage
}) => {
  const hasConversation = messages.length > 1 || isTyping;

  if (!hasConversation) {
    // Show Perplexity-inspired empty state with transparent background
    return (
      <div className="flex flex-col flex-1 min-h-0 w-full relative bg-transparent">
        <PerplexityEmptyState 
          onSendMessage={onSendMessage}
          selectedModel={selectedModel}
        />
      </div>
    );
  }

  // Show conversation with fixed input bar that blends seamlessly
  return (
    <div className="h-full flex flex-col relative bg-background/10 backdrop-blur-sm">
      {/* Chat Messages Area with proper scrolling */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full w-full" viewportRef={viewportRef}>
          <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
            {messages.map((msg) => {
              // Get streaming state for this message
              const isStreaming = isStreamingForMessage ? isStreamingForMessage(msg.id) : false;
              const rawUpdates = getUpdatesForMessage ? getUpdatesForMessage(msg.id) : [];
              
              // Debug: Log what we're receiving
              console.log('🔄 ChatArea: Processing message', {
                messageId: msg.id,
                sender: msg.sender,
                isStreaming,
                rawUpdatesCount: rawUpdates.length,
                sampleUpdates: rawUpdates.slice(0, 2) // Show first 2 updates
              });

              // Transform raw updates into structured format
              const streamingUpdates = rawUpdates.map((update, index) => ({
                type: update.type || 'thought',
                message: update.message || update.data?.status || update.data?.content || update.data?.text || '',
                timestamp: update.timestamp || Date.now() + index,
                data: update
              }));

              // Extract sources from updates
              const streamingSources = rawUpdates
                .filter(update => 
                  update.type === 'source' || 
                  update.data?.source_name || 
                  update.data?.name
                )
                .map(update => ({
                  name: update.data?.source_name || update.data?.name || 'Unknown Source',
                  url: update.data?.source_url || update.data?.url || '',
                  type: update.data?.source_type || 'Web Source',
                  confidence: update.data?.confidence || 85
                }));

              // Extract progress from updates
              const progressUpdates = rawUpdates.filter(update => 
                update.type === 'search' || 
                update.data?.progress !== undefined ||
                update.data?.status
              );

              const streamingProgress = progressUpdates.length > 0 
                ? progressUpdates.reduce((latest, current) => {
                    const currentProgress = current.data?.progress || 0;
                    const latestProgress = latest.progress || 0;
                    return currentProgress >= latestProgress ? {
                      phase: current.data?.status || current.message || 'Processing...',
                      progress: currentProgress
                    } : latest;
                  }, { phase: 'Initializing...', progress: 0 })
                : { phase: '', progress: 0 };

              // Log transformed data for debugging
              if (isStreaming || rawUpdates.length > 0) {
                console.log('🎯 ChatArea: Transformed data', {
                  messageId: msg.id,
                  isStreaming,
                  streamingUpdatesCount: streamingUpdates.length,
                  sourcesCount: streamingSources.length,
                  progress: streamingProgress
                });
              }

              return (
                <ChatMessage 
                  key={msg.id} 
                  message={{ ...msg, timestamp: formatTimestamp(msg.timestamp) }}
                  onOpenCanvas={onOpenCanvas}
                  onCanvasDownload={onCanvasDownload}
                  onCanvasPrint={onCanvasPrint}
                  isStreaming={isStreaming}
                  streamingUpdates={streamingUpdates}
                  streamingSources={streamingSources}
                  streamingProgress={streamingProgress}
                />
              );
            })}
            {isTyping && <TypingIndicator />}
          </div>
          {/* Spacer for input */}
          <div className="h-24" />
        </ScrollArea>
      </div>

      {/* Floating Input Area */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <EnhancedChatInput 
            onSendMessage={onSendMessage} 
            isTyping={isTyping}
            isCompact={true}
            selectedModel={selectedModel}
          />
        </div>
      </div>
    </div>
  );
};

// Helper function moved from constants
const formatTimestamp = (timestamp: Date): string => {
  return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default ChatArea;
