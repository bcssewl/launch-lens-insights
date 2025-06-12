
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardHeader from '@/components/DashboardHeader';
import MobileDashboardHeader from '@/components/mobile/MobileDashboardHeader';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from '@/components/assistant/ChatMessage';
import ChatSidebar from '@/components/assistant/ChatSidebar';
import ChatInput from '@/components/assistant/ChatInput';
import TypingIndicator from '@/components/assistant/TypingIndicator';
import { useChatSessions } from '@/hooks/useChatSessions';
import { useChatHistory } from '@/hooks/useChatHistory';
import { useMessages } from '@/hooks/useMessages';
import { useIsMobile } from '@/hooks/use-mobile';

const AIAssistantPage: React.FC = () => {
  const isMobile = useIsMobile();
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
      <div className="bg-gradient-to-br from-background via-background to-muted/10 min-h-screen">
        {/* Mobile Header */}
        {isMobile && <MobileDashboardHeader title="AI Assistant" />}
        
        {/* Desktop Header */}
        {!isMobile && <DashboardHeader>AI Assistant</DashboardHeader>}
        
        <div className="flex h-[calc(100vh-120px)] md:h-[calc(100vh-120px)]">
          <div className="flex-1 flex flex-col min-h-0">
            {/* Subheader */}
            <div className="p-6 border-b border-border/50 bg-background/50 backdrop-blur-xl flex-shrink-0 rounded-t-3xl mx-4 mt-4">
              <p className="text-sm text-muted-foreground">
                {isConfigured ? 'AI-powered startup advisor' : 'AI service not configured'}
                {currentSessionId && (
                  <span className="ml-2 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20">
                    Active Session
                  </span>
                )}
              </p>
            </div>

            {/* Chat Area - Takes remaining space */}
            <div className="flex-1 min-h-0 overflow-hidden mx-4 bg-background/30 backdrop-blur-xl border border-border/50 border-t-0 rounded-b-3xl">
              <ScrollArea className="h-full w-full" viewportRef={viewportRef}>
                <div className="p-6 space-y-6">
                  {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                  ))}
                  {isTyping && <TypingIndicator />}
                </div>
              </ScrollArea>
            </div>

            {/* Input Area - Sticky at bottom */}
            <div className="p-4">
              <ChatInput onSendMessage={handleSendMessageWithSession} isTyping={isTyping} />
            </div>
          </div>

          {/* Right Sidebar */}
          <ChatSidebar 
            onClearConversation={handleClearConversationWithHistory}
            onDownloadChat={handleDownloadChat}
            recentTopics={[]}
            currentSessionId={currentSessionId}
            onSessionSelect={handleSessionSelect}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIAssistantPage;
