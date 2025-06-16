
import React from 'react';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2 } from 'lucide-react';
import QuickActionsDropdown from '@/components/assistant/QuickActionsDropdown';
import ChatSessionsDropdown from '@/components/assistant/ChatSessionsDropdown';

interface ChatSubheaderProps {
  isConfigured: boolean;
  currentSessionId?: string | null;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onDownloadChat: () => void;
  onClearConversation: () => void;
  onSessionSelect: (sessionId: string) => void;
}

const ChatSubheader: React.FC<ChatSubheaderProps> = ({
  isConfigured,
  currentSessionId,
  isFullscreen,
  onToggleFullscreen,
  onDownloadChat,
  onClearConversation,
  onSessionSelect
}) => {
  return (
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
        <QuickActionsDropdown 
          onDownloadChat={onDownloadChat}
          onClearConversation={onClearConversation}
        />
        <ChatSessionsDropdown 
          currentSessionId={currentSessionId}
          onSessionSelect={onSessionSelect}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleFullscreen}
          className="h-8 w-8"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default ChatSubheader;
