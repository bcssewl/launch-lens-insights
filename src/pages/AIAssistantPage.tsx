
import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardHeader from '@/components/DashboardHeader';
import MobileDashboardHeader from '@/components/mobile/MobileDashboardHeader';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import ChatMessage from '@/components/assistant/ChatMessage';
import ChatSidebar from '@/components/assistant/ChatSidebar';
import ChatInput from '@/components/assistant/ChatInput';
import TypingIndicator from '@/components/assistant/TypingIndicator';
import { useChatSessions } from '@/hooks/useChatSessions';
import { useChatHistory } from '@/hooks/useChatHistory';
import { useMessages } from '@/hooks/useMessages';
import { formatTimestamp } from '@/constants/aiAssistant';
import { useIsMobile } from '@/hooks/use-mobile';
import { Maximize2, Minimize2, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const AIAssistantPage: React.FC = () => {
  const isMobile = useIsMobile();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  
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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (isFullscreen) {
    return (
      <div className="h-screen bg-background flex flex-col">
        {/* Fullscreen Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h1 className="text-xl font-semibold">AI Assistant</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8"
            >
              {isSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="h-8 w-8"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
            <ScrollArea className="flex-1 px-4" viewportRef={viewportRef}>
              <div className="py-6 space-y-6">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={{ ...msg, timestamp: formatTimestamp(msg.timestamp) }} />
                ))}
                {isTyping && <TypingIndicator />}
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t border-border">
              <ChatInput onSendMessage={handleSendMessageWithSession} isTyping={isTyping} />
            </div>
          </div>

          {/* Sidebar */}
          {isSidebarOpen && (
            <ChatSidebar 
              onClearConversation={handleClearConversationWithHistory}
              onDownloadChat={handleDownloadChat}
              recentTopics={[]}
              currentSessionId={currentSessionId}
              onSessionSelect={handleSessionSelect}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="bg-background min-h-screen">
        {/* Mobile Header */}
        {isMobile && <MobileDashboardHeader title="AI Assistant" />}
        
        {/* Desktop Header */}
        {!isMobile && (
          <div className="flex items-center justify-between">
            <DashboardHeader>AI Assistant</DashboardHeader>
            <div className="flex items-center gap-2 mr-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-8 w-8"
              >
                {isSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="h-8 w-8"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex h-[calc(100vh-120px)] md:h-[calc(100vh-120px)]">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col">
              <ScrollArea className="flex-1 px-4" viewportRef={viewportRef}>
                <div className="py-6 space-y-6">
                  {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={{ ...msg, timestamp: formatTimestamp(msg.timestamp) }} />
                  ))}
                  {isTyping && <TypingIndicator />}
                </div>
              </ScrollArea>
              
              <div className="p-4 border-t border-border">
                <ChatInput onSendMessage={handleSendMessageWithSession} isTyping={isTyping} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          {isSidebarOpen && (
            <ChatSidebar 
              onClearConversation={handleClearConversationWithHistory}
              onDownloadChat={handleDownloadChat}
              recentTopics={[]}
              currentSessionId={currentSessionId}
              onSessionSelect={handleSessionSelect}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIAssistantPage;
