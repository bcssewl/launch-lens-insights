
import React from 'react';
import ChatSubheader from '@/components/assistant/ChatSubheader';
import ChatArea from '@/components/assistant/ChatArea';
import { FloatingElements } from '@/components/landing/FloatingElements';
import { Message } from '@/constants/aiAssistant';

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
  isStreamingForMessage?: (messageId: string) => boolean;
  getUpdatesForMessage?: (messageId: string) => any[];
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
  isStreamingForMessage,
  getUpdatesForMessage
}) => {
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
          isStreamingForMessage={isStreamingForMessage}
          getUpdatesForMessage={getUpdatesForMessage}
        />
      </div>
    </div>
  );
};

export default FullscreenChatLayout;
