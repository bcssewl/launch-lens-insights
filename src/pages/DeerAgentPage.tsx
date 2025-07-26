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
      console.log('🦌 Starting DeerFlow research for:', message);
      
      // Use DeerFlow streaming instead of regular messages
      await deerStreaming.startStreaming(message, {
        max_plan_iterations: 1,
        max_step_num: 3,
        auto_accepted_plan: false,
        enable_deep_thinking: true,
        report_style: 'academic'
      });
      
    } catch (error) {
      console.error('❌ DeerFlow error:', error);
    }
  };

  if (isMobile) {
    return (
      <DeerFlowChatLayout
        messages={messages}
        isTyping={isTyping || deerStreaming.streamingState.isStreaming}
        onSendMessage={handleDeerMessage}
        streamingState={deerStreaming.streamingState}
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
          streamingState={deerStreaming.streamingState}
        />
      </div>
    </DashboardLayout>
  );
};

export default DeerAgentPage;