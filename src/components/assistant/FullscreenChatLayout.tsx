
import React from 'react';
import ChatSubheader from '@/components/assistant/ChatSubheader';
import ChatArea from '@/components/assistant/ChatArea';
import { FloatingElements } from '@/components/landing/FloatingElements';
import { Message, formatTimestamp } from '@/constants/aiAssistant';

interface FullscreenChatLayoutProps {
  messages: Message[];
  isTyping: boolean;
  viewportRef: React.RefObject<HTMLDivElement>;
  isConfigured: boolean;
  currentSessionId?: string | null;
  onSendMessage: (message: string) => void;
  onDownloadChat: () => void;
  onClearConversation: () => void;
  onSessionSelect: (sessionId: string) => void;
  onToggleFullscreen: () => void;
  selectedModel?: string;
  canvasState?: {
    isOpen: boolean;
    messageId: string | null;
    content: string;
  };
  onOpenCanvas?: (messageId: string, content: string) => void;
  onCloseCanvas?: () => void;
  onCanvasDownload?: () => void;
  onCanvasPrint?: () => void;
  streamingState?: {
    isStreaming: boolean;
    currentPhase: string;
    progress: number;
    searchQueries: string[];
    discoveredSources: Array<{
      name: string;
      url: string;
      type: string;
      confidence: number;
    }>;
  };
}

const FullscreenChatLayout: React.FC<FullscreenChatLayoutProps> = ({
  messages,
  isTyping,
  viewportRef,
  isConfigured,
  currentSessionId,
  onSendMessage,
  onDownloadChat,
  onClearConversation,
  onSessionSelect,
  onToggleFullscreen,
  selectedModel = 'best',
  canvasState,
  onOpenCanvas,
  onCloseCanvas,
  onCanvasDownload,
  onCanvasPrint,
  streamingState
}) => {
  // Convert streamingState to match ChatArea expectations
  const convertedStreamingState = streamingState ? {
    isStreaming: streamingState.isStreaming,
    updates: [], // Empty for now, can be populated if needed
    sources: streamingState.discoveredSources.map(source => ({
      name: source.name,
      url: source.url,
      type: source.type,
      confidence: source.confidence
    })),
    progress: {
      phase: streamingState.currentPhase,
      progress: streamingState.progress
    }
  } : undefined;

  return (
    <div className="min-h-screen flex w-full apple-hero relative">
      {/* Floating Elements at the root level */}
      <FloatingElements />
      
      <div className="flex flex-col h-screen min-h-0 w-full relative bg-transparent transition-all">
        <ChatSubheader
          isConfigured={isConfigured}
          currentSessionId={currentSessionId}
          isFullscreen={true}
          onToggleFullscreen={onToggleFullscreen}
          onDownloadChat={onDownloadChat}
          onClearConversation={onClearConversation}
          onSessionSelect={onSessionSelect}
          selectedModel={selectedModel}
          onModelSelect={() => {}} // No-op in fullscreen mode for now
        />
        
        <ChatArea
          messages={messages}
          isTyping={isTyping}
          viewportRef={viewportRef}
          onSendMessage={onSendMessage}
          selectedModel={selectedModel}
          canvasState={canvasState}
          onOpenCanvas={onOpenCanvas}
          onCloseCanvas={onCloseCanvas}
          onCanvasDownload={onCanvasDownload}
          onCanvasPrint={onCanvasPrint}
          streamingState={convertedStreamingState}
        />
      </div>
    </div>
  );
};

export default FullscreenChatLayout;
