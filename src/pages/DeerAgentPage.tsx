import React, { useState, useRef } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { DeerFlowChatLayout } from '@/components/deerflow/DeerFlowChatLayout';
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
      // Add the message to the conversation immediately for UI feedback
      await handleSendMessage(message, message, 'deer');
    } catch (error) {
      console.error('Error sending message to Deer:', error);
    }
  };

  if (isMobile) {
    return (
      <DeerFlowChatLayout
        messages={messages}
        isTyping={isTyping || deerStreaming.streamingState.isStreaming}
        onSendMessage={handleDeerMessage}
      />
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        <DeerFlowChatLayout
          messages={messages}
          isTyping={isTyping || deerStreaming.streamingState.isStreaming}
          onSendMessage={handleDeerMessage}
        />
      </div>
    </DashboardLayout>
  );
};

export default DeerAgentPage;