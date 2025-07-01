
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
  onToggleFullscreen
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
        />
        
        <ChatArea
          messages={messages}
          isTyping={isTyping}
          viewportRef={viewportRef}
          onSendMessage={onSendMessage}
        />
      </div>
    </div>
  );
};

export default FullscreenChatLayout;
