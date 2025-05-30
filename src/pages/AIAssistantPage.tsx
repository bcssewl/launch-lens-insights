
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardHeader from '@/components/DashboardHeader';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from '@/components/assistant/ChatMessage';
import ChatSidebar from '@/components/assistant/ChatSidebar';
import ChatInput from '@/components/assistant/ChatInput';
import TypingIndicator from '@/components/assistant/TypingIndicator';
import { useChatSessions } from '@/hooks/useChatSessions';
import { useChatHistory } from '@/hooks/useChatHistory';
import { useMessages } from '@/hooks/useMessages';
import { formatTimestamp } from '@/constants/aiAssistant';

const AIAssistantPage: React.FC = () => {
  const { 
    currentSessionId, 
    setCurrentSessionId, 
    createSession 
  } = useChatSessions();
  
  const { clearHistory } = useChatHistory(currentSessionId);
  
  const {
    messages,
    isTyping,
    viewportRef,
    handleSendMessage,
    handleClearConversation,
    handleDownloadChat,
    isConfigured
  } = useMessages(currentSessionId);

  const handleSendMessageWithSession = async (text: string) => {
    // Create session if none exists
    if (!currentSessionId) {
      const newSession = await createSession();
      if (!newSession) return;
      setCurrentSessionId(newSession.id);
    }
    
    handleSendMessage(text);
  };

  const handleClearConversationWithHistory = async () => {
    handleClearConversation();
    if (currentSessionId) {
      await clearHistory();
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  return (
    <DashboardLayout>
      <DashboardHeader>AI Assistant</DashboardHeader>
      <div className="flex h-[calc(100vh-120px)]">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Subheader */}
          <div className="p-4 border-b bg-background flex-shrink-0">
            <p className="text-sm text-muted-foreground">
              {isConfigured ? 'AI-powered startup advisor' : 'AI service not configured'}
              {currentSessionId && (
                <span className="ml-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                  Active Session
                </span>
              )}
            </p>
          </div>

          {/* Chat Area - Takes remaining space */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full w-full" viewportRef={viewportRef}>
              <div className="p-6 space-y-4">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={{ ...msg, timestamp: formatTimestamp(msg.timestamp) }} />
                ))}
                {isTyping && <TypingIndicator />}
              </div>
            </ScrollArea>
          </div>

          {/* Input Area - Sticky at bottom */}
          <ChatInput onSendMessage={handleSendMessageWithSession} isTyping={isTyping} />
        </div>

        {/* Right Sidebar (Desktop Only) */}
        <ChatSidebar 
          onClearConversation={handleClearConversationWithHistory}
          onDownloadChat={handleDownloadChat}
          recentTopics={[]}
          currentSessionId={currentSessionId}
          onSessionSelect={handleSessionSelect}
        />
      </div>
    </DashboardLayout>
  );
};

export default AIAssistantPage;
