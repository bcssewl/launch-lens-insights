
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

  // Enhanced debugging with CSS inspection
  useEffect(() => {
    console.log('=== AI Assistant Page Debug ===');
    console.log('Current route:', window.location.pathname);
    console.log('Theme mode:', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    
    // Check CSS variables
    const rootStyles = getComputedStyle(document.documentElement);
    console.log('CSS Variables:', {
      background: rootStyles.getPropertyValue('--background'),
      surface: rootStyles.getPropertyValue('--surface'),
      primary: rootStyles.getPropertyValue('--primary'),
      accent: rootStyles.getPropertyValue('--accent')
    });
    
    // Check if apple-hero class exists
    const appleHeroElements = document.querySelectorAll('.apple-hero');
    console.log('Apple-hero elements found:', appleHeroElements.length);
    
    console.log('=== End Debug ===');
  }, []);

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

  // Normal mode with enhanced background
  return (
    <SidebarProvider>
      <div 
        className="min-h-screen flex w-full relative"
        style={{ 
          background: `
            linear-gradient(135deg, 
              hsl(var(--primary) / 0.1) 0%, 
              hsl(var(--accent) / 0.1) 25%,
              hsl(var(--background)) 50%,
              hsl(var(--accent) / 0.05) 75%,
              hsl(var(--primary) / 0.05) 100%
            )
          `,
          minHeight: '100vh',
          position: 'relative'
        }}
      >
        {/* Enhanced floating elements for visual distinction */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-8 h-8 bg-primary/10 rounded-full blur-sm animate-pulse" />
          <div className="absolute top-40 right-20 w-12 h-12 bg-accent/15 rounded-2xl rotate-12 animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-40 left-20 w-6 h-6 bg-primary/8 rounded-xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-60 right-10 w-16 h-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-60 right-1/4 w-10 h-10 bg-accent/12 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>
        
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
          
          {/* Main chat area - explicitly transparent */}
          <div className="flex flex-col flex-1 min-h-0 w-full relative bg-transparent">
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
