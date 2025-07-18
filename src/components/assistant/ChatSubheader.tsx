
import React from 'react';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2 } from 'lucide-react';
import QuickActionsDropdown from '@/components/assistant/QuickActionsDropdown';
import ChatSessionsDropdown from '@/components/assistant/ChatSessionsDropdown';
import ModelSelectionDropdown, { AIModel } from '@/components/assistant/ModelSelectionDropdown';

interface ChatSubheaderProps {
  isConfigured: boolean;
  currentSessionId?: string | null;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onDownloadChat: () => void;
  onClearConversation: () => void;
  onSessionSelect: (sessionId: string) => void;
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
}

const ChatSubheader: React.FC<ChatSubheaderProps> = ({
  isConfigured,
  currentSessionId,
  isFullscreen,
  onToggleFullscreen,
  onDownloadChat,
  onClearConversation,
  onSessionSelect,
  selectedModel,
  onModelSelect
}) => {
  const handleModelSelect = (model: AIModel) => {
    onModelSelect(model.id);
  };

  return (
    <div className="flex items-center justify-between">
      {/* Model dropdown on the left */}
      <ModelSelectionDropdown 
        selectedModel={selectedModel}
        onModelSelect={handleModelSelect}
      />
      
      {/* Control buttons on the right */}
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
