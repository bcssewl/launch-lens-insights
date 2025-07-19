
import React from 'react';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2 } from 'lucide-react';
import QuickActionsDropdown from '@/components/assistant/QuickActionsDropdown';
import ChatSessionsDropdown from '@/components/assistant/ChatSessionsDropdown';
import ModelSelectionDropdown, { AIModel } from '@/components/assistant/ModelSelectionDropdown';
import ResearchTypeSelector from '@/components/assistant/ResearchTypeSelector';

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
  selectedResearchType?: string;
  onResearchTypeChange?: (type: string) => void;
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
  onModelSelect,
  selectedResearchType,
  onResearchTypeChange
}) => {
  const handleModelSelect = (model: AIModel) => {
    onModelSelect(model.id);
  };

  return (
    <div className="flex items-center justify-between">
      {/* Model dropdown and research type selector on the left */}
      <div className="flex items-center space-x-3">
        <ModelSelectionDropdown 
          selectedModel={selectedModel}
          onModelSelect={handleModelSelect}
        />
        {selectedModel === 'algeon' && onResearchTypeChange && (
          <ResearchTypeSelector
            selectedType={selectedResearchType || 'business-research'}
            onTypeChange={onResearchTypeChange}
            isCompact={true}
          />
        )}
      </div>
      
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
