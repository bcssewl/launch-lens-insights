
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Maximize2, Minimize2, Bot } from 'lucide-react';
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
  selectedModel?: string;
}

const ChatSubheader: React.FC<ChatSubheaderProps> = ({
  isConfigured,
  currentSessionId,
  isFullscreen,
  onToggleFullscreen,
  onDownloadChat,
  onClearConversation,
  onSessionSelect,
  selectedModel
}) => {
  const getModelDisplayName = (modelId?: string) => {
    switch (modelId) {
      case 'best': return 'Best';
      case 'nexus': return 'Nexus';
      case 'algeon': return 'Algeon';
      case 'stratix': return 'Stratix';
      case 'perplexity': return 'Perplexity';
      case 'gemini': return 'Gemini';
      default: return 'Best';
    }
  };

  const getModelColor = (modelId?: string) => {
    switch (modelId) {
      case 'stratix': return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'nexus': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'algeon': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'perplexity': return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      case 'gemini': return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {selectedModel && (
        <Badge 
          variant="secondary" 
          className={`flex items-center gap-1 px-2 py-1 text-xs font-medium ${getModelColor(selectedModel)}`}
        >
          <Bot className="h-3 w-3" />
          {getModelDisplayName(selectedModel)}
        </Badge>
      )}
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
