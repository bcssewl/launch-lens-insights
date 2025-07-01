
import React, { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { FloatingElements } from '@/components/landing/FloatingElements';
import DashboardHeader from '@/components/DashboardHeader';
import MobileDashboardHeader from '@/components/mobile/MobileDashboardHeader';
import ChatArea from '@/components/assistant/ChatArea';
import FullscreenChatLayout from '@/components/assistant/FullscreenChatLayout';
import ChatSubheader from '@/components/assistant/ChatSubheader';
import { useChatSessions } from '@/hooks/useChatSessions';
import { useChatHistory } from '@/hooks/useChatHistory';
import { useMessages } from '@/hooks/useMessages';
import { useIsMobile } from '@/hooks/use-mobile';

const AIAssistantPage: React.FC = () => {
  const isMobile = useIsMobile();
  const [isFullscreen, setIsFullscreen] = useState(false);
  
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

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F11') {
        event.preventDefault();
        setIsFullscreen(!isFullscreen);
      } else if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Fullscreen mode
  if (isFullscreen) {
    return (
      <FullscreenChatLayout
        messages={messages}
        isTyping={isTyping}
        viewportRef={viewportRef}
        isConfigured={isConfigured}
        currentSessionId={currentSessionId}
        onSendMessage={handleSendMessageWithSession}
        onDownloadChat={handleDownloadChat}
        onClearConversation={handleClearConversationWithHistory}
        onSessionSelect={handleSessionSelect}
        onToggleFullscreen={toggleFullscreen}
      />
    );
  }

  // Normal mode with sidebar - matching other dashboard background styles
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full apple-hero relative">
        {/* Add FloatingElements to match other dashboards */}
        <FloatingElements />
        
        <AppSidebar />
        
        <SidebarInset className="flex-1 flex flex-col relative z-10">
          {/* Header with integrated ChatSubheader functionality */}
          {isMobile ? (
            <MobileDashboardHeader title="AI Assistant" />
          ) : (
            <div className="border-b bg-background/80 backdrop-blur-sm">
              <div className="px-6 py-4 flex items-center justify-between">
                <h1 className="text-lg font-semibold text-foreground">AI Assistant</h1>
                <div className="flex items-center">
                  <ChatSubheader
                    isConfigured={isConfigured}
                    currentSessionId={currentSessionId}
                    isFullscreen={isFullscreen}
                    onToggleFullscreen={toggleFullscreen}
                    onDownloadChat={handleDownloadChat}
                    onClearConversation={handleClearConversationWithHistory}
                    onSessionSelect={handleSessionSelect}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Main chat area */}
          <div className="flex flex-col flex-1 min-h-0 w-full relative">
            <ChatArea
              messages={messages}
              isTyping={isTyping}
              viewportRef={viewportRef}
              onSendMessage={handleSendMessageWithSession}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AIAssistantPage;
