
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
import { useTheme } from 'next-themes';

const AIAssistantPage: React.FC = () => {
  const isMobile = useIsMobile();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { theme } = useTheme();
  
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

  // Enhanced debugging with CSS inspection
  useEffect(() => {
    console.log('=== AI Assistant Page Debug ===');
    console.log('Current route:', window.location.pathname);
    console.log('Theme mode:', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    console.log('Theme from hook:', theme);
    
    // Check CSS variables
    const rootStyles = getComputedStyle(document.documentElement);
    console.log('CSS Variables:', {
      background: rootStyles.getPropertyValue('--background'),
      surface: rootStyles.getPropertyValue('--surface'),
      primary: rootStyles.getPropertyValue('--primary'),
      accent: rootStyles.getPropertyValue('--accent')
    });
    
    console.log('=== End Debug ===');
  }, [theme]);

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

  // Normal mode with dashboard-style background - ensuring proper structure
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full apple-hero overflow-hidden">
        {/* Floating Elements - Make sure they're visible */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <FloatingElements />
        </div>
        
        <AppSidebar />
        
        <SidebarInset className="flex-1 flex flex-col relative z-10">
          {/* Header with integrated ChatSubheader functionality */}
          {isMobile ? (
            <MobileDashboardHeader title="AI Assistant" />
          ) : (
            <div className="border-b bg-background/80 backdrop-blur-sm relative z-20">
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
          
          {/* Main chat area with proper background inheritance */}
          <div className="flex flex-col flex-1 min-h-0 w-full relative z-10">
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
