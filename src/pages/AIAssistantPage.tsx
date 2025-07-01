
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

  // Determine if we're in dark mode
  const isDark = theme === 'dark' || document.documentElement.classList.contains('dark');

  // Create theme-aware background styles
  const getBackgroundStyle = () => {
    if (isDark) {
      // Dark mode: More vibrant gradient with higher opacity
      return {
        background: `
          linear-gradient(135deg, 
            hsl(var(--primary) / 0.25) 0%, 
            hsl(var(--accent) / 0.2) 20%,
            hsl(0 0% 12%) 40%,
            hsl(var(--primary) / 0.15) 60%,
            hsl(var(--accent) / 0.25) 80%,
            hsl(0 0% 8%) 100%
          )
        `,
        minHeight: '100vh',
        position: 'relative' as const
      };
    } else {
      // Light mode: Subtle gradient
      return {
        background: `
          linear-gradient(135deg, 
            hsl(var(--primary) / 0.08) 0%, 
            hsl(var(--accent) / 0.06) 25%,
            hsl(var(--background)) 50%,
            hsl(var(--accent) / 0.04) 75%,
            hsl(var(--primary) / 0.06) 100%
          )
        `,
        minHeight: '100vh',
        position: 'relative' as const
      };
    }
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

  // Normal mode with enhanced theme-specific background
  return (
    <SidebarProvider>
      <div 
        className="min-h-screen flex w-full relative"
        style={getBackgroundStyle()}
      >
        {/* Enhanced floating elements with theme-aware visibility */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {isDark ? (
            // Dark mode: More visible floating elements with glow
            <>
              <div className="absolute top-20 left-10 w-10 h-10 bg-primary/30 rounded-full blur-sm animate-pulse shadow-lg shadow-primary/20" />
              <div className="absolute top-40 right-20 w-14 h-14 bg-accent/25 rounded-2xl rotate-12 animate-pulse shadow-lg shadow-accent/15" style={{ animationDelay: '1s' }} />
              <div className="absolute bottom-40 left-20 w-8 h-8 bg-primary/20 rounded-xl animate-pulse shadow-md shadow-primary/10" style={{ animationDelay: '2s' }} />
              <div className="absolute top-60 right-10 w-20 h-6 bg-gradient-to-r from-primary/25 to-accent/20 rounded-full animate-pulse shadow-md" style={{ animationDelay: '0.5s' }} />
              <div className="absolute bottom-60 right-1/4 w-12 h-12 bg-accent/20 rounded-full animate-pulse shadow-lg shadow-accent/10" style={{ animationDelay: '1.5s' }} />
              {/* Additional glowing orbs for dark mode */}
              <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-primary/40 rounded-full blur-[1px] animate-pulse" style={{ animationDelay: '0.8s' }} />
              <div className="absolute bottom-1/3 right-1/3 w-6 h-6 bg-accent/30 rounded-full blur-[1px] animate-pulse" style={{ animationDelay: '2.5s' }} />
            </>
          ) : (
            // Light mode: Subtle floating elements
            <>
              <div className="absolute top-20 left-10 w-8 h-8 bg-primary/15 rounded-full blur-sm animate-pulse" />
              <div className="absolute top-40 right-20 w-12 h-12 bg-accent/12 rounded-2xl rotate-12 animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute bottom-40 left-20 w-6 h-6 bg-primary/10 rounded-xl animate-pulse" style={{ animationDelay: '2s' }} />
              <div className="absolute top-60 right-10 w-16 h-4 bg-gradient-to-r from-primary/12 to-accent/10 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="absolute bottom-60 right-1/4 w-10 h-10 bg-accent/8 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
            </>
          )}
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
