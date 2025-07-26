import React, { useState, useRef } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import FullscreenChatLayout from '@/components/assistant/FullscreenChatLayout';
import { useChatSessions } from '@/hooks/useChatSessions';
import { useChatHistory } from '@/hooks/useChatHistory';
import { useMessages } from '@/hooks/useMessages';
import { useDeerStreaming } from '@/hooks/useDeerStreaming';
import { useIsMobile } from '@/hooks/use-mobile';

const DeerAgentPage: React.FC = () => {
  const isMobile = useIsMobile();
  const viewportRef = useRef<HTMLDivElement>(null);
  
  const {
    sessions,
    currentSessionId,
    navigateToSession
  } = useChatSessions();

  const chatHistory = useChatHistory(currentSessionId);

  const {
    messages,
    isTyping,
    handleSendMessage,
    handleClearConversation
  } = useMessages(currentSessionId || '');

  const deerStreaming = useDeerStreaming();

  const [selectedModel] = useState<string>('deer');

  const handleDeerMessage = async (message: string) => {
    if (!message.trim()) return;

    try {
      // Use the existing message handling but force Deer model
      await handleSendMessage(message, message, 'deer');
    } catch (error) {
      console.error('Error sending message to Deer:', error);
    }
  };

  const handleDownloadChat = () => {
    console.log('Download functionality not implemented yet');
  };

  const handleSessionSelect = (sessionId: string) => {
    navigateToSession(sessionId);
  };

  const toggleFullscreen = () => {
    // Fullscreen functionality can be added later
  };

  const chatProps = {
    messages,
    isTyping: isTyping || deerStreaming.streamingState.isStreaming,
    viewportRef,
    isConfigured: true,
    currentSessionId,
    onSendMessage: handleDeerMessage,
    onDownloadChat: handleDownloadChat,
    onClearConversation: handleClearConversation,
    onSessionSelect: handleSessionSelect,
    onToggleFullscreen: toggleFullscreen,
    selectedModel,
    streamingState: {
      isStreaming: deerStreaming.streamingState.isStreaming,
      currentPhase: deerStreaming.streamingState.currentPhase || 'ready',
      progress: 0,
      searchQueries: [],
      discoveredSources: []
    }
  };

  if (isMobile) {
    return <FullscreenChatLayout {...chatProps} />;
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        <FullscreenChatLayout {...chatProps} />
      </div>
    </DashboardLayout>
  );
};

export default DeerAgentPage;