
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
  );
};

export default ChatSubheader;
