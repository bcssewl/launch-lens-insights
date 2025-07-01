
import React from 'react';
import ChatSubheader from '@/components/assistant/ChatSubheader';
import ChatArea from '@/components/assistant/ChatArea';
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced glass background for fullscreen */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 30% 70%, hsla(260, 70%, 50%, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 70% 30%, hsla(280, 60%, 60%, 0.25) 0%, transparent 45%),
            radial-gradient(circle at 50% 50%, hsla(240, 80%, 40%, 0.2) 0%, transparent 60%),
            linear-gradient(135deg, 
              hsl(0 0% 4%) 0%, 
              hsl(240 20% 8%) 25%,
              hsl(0 0% 2%) 50%,
              hsl(260 25% 6%) 75%,
              hsl(0 0% 1%) 100%
            )
          `
        }}
      />
      
      {/* Glass floating elements for fullscreen */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/5 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-blue-400/15 rounded-full backdrop-blur-xl border border-white/10 shadow-2xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-gradient-to-br from-blue-400/15 to-purple-400/10 rounded-full backdrop-blur-2xl border border-white/5 shadow-xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/5 w-16 h-16 bg-gradient-to-br from-white/15 to-purple-300/20 rounded-full backdrop-blur-lg border border-white/15 shadow-lg animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="flex flex-col h-screen min-h-0 w-full relative z-10">
        {/* Enhanced glass header */}
        <div className="bg-background/60 backdrop-blur-xl border-b border-white/10 shadow-2xl">
          <ChatSubheader
            isConfigured={isConfigured}
            currentSessionId={currentSessionId}
            isFullscreen={true}
            onToggleFullscreen={onToggleFullscreen}
            onDownloadChat={onDownloadChat}
            onClearConversation={onClearConversation}
            onSessionSelect={onSessionSelect}
          />
        </div>
        
        {/* Main chat area with glass treatment */}
        <div className="flex-1 min-h-0 p-4">
          <div className="h-full bg-background/10 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            <ChatArea
              messages={messages}
              isTyping={isTyping}
              viewportRef={viewportRef}
              onSendMessage={onSendMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullscreenChatLayout;
