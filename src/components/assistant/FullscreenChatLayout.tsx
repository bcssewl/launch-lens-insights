
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
    <div className="bg-gradient-to-br from-background via-background to-muted/10 min-h-screen">
      <div className="flex flex-col h-screen min-h-0 w-full relative bg-gradient-to-br from-background via-background to-muted/10 transition-all">
        <div className="p-6 border-b border-border/50 bg-background/50 backdrop-blur-xl flex-shrink-0 rounded-t-3xl mx-4 mt-4 flex items-center justify-between z-10">
          <div>
            <p className="text-sm text-muted-foreground">
              {isConfigured ? 'AI-powered startup advisor' : 'AI service not configured'}
              {currentSessionId && (
                <span className="ml-2 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20">
                  Active Session
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onDownloadChat}
              className="px-3 py-1 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors"
            >
              Download
            </button>
            <button
              onClick={onClearConversation}
              className="px-3 py-1 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors"
            >
              Clear
            </button>
            <button
              onClick={onToggleFullscreen}
              className="px-3 py-1 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors"
            >
              Exit Fullscreen
            </button>
          </div>
        </div>
        
        <div className="flex flex-col flex-1 min-h-0 w-full relative">
          <div className="flex-1 min-h-0 overflow-hidden mx-4 bg-background/30 backdrop-blur-xl border border-border/50 border-t-0 rounded-b-3xl relative">
            <div className="p-6 space-y-6 flex flex-col items-stretch min-h-full transition-all duration-150">
              {messages.length <= 1 && !isTyping ? (
                <div className="flex flex-col items-center justify-center h-72 text-center text-muted-foreground animate-fade-in">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/10 to-muted flex items-center justify-center mb-4">
                    <span className="text-3xl">💡</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Start chatting with your advisor</h3>
                  <p className="text-sm mb-2 max-w-xs">
                    Ask any question about your startup idea, get instant feedback, or try one of the suggested prompts below.
                  </p>
                  <div className="mt-1 text-xs opacity-80">Try: "What is a good market for an AI fitness app?"</div>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div key={msg.id}>Chat Message Component would go here</div>
                  ))}
                  {isTyping && <div>Typing indicator would go here</div>}
                </>
              )}
            </div>
          </div>

          <div className="p-4">
            <div>Chat Input Component would go here</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullscreenChatLayout;
