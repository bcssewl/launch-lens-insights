
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

  // Create enhanced glass morphism background
  const getGlassBackgroundStyle = () => {
    if (isDark) {
      // Dark mode: More vibrant glass effects with enhanced depth
      return {
        background: `
          radial-gradient(circle at 20% 80%, hsla(260, 80%, 40%, 0.4) 0%, transparent 40%),
          radial-gradient(circle at 80% 20%, hsla(280, 70%, 50%, 0.3) 0%, transparent 35%),
          radial-gradient(circle at 40% 40%, hsla(240, 90%, 60%, 0.25) 0%, transparent 45%),
          radial-gradient(circle at 60% 80%, hsla(320, 60%, 45%, 0.2) 0%, transparent 50%),
          linear-gradient(135deg, 
            hsl(0 0% 8%) 0%, 
            hsl(240 15% 12%) 25%,
            hsl(0 0% 6%) 50%,
            hsl(260 20% 10%) 75%,
            hsl(0 0% 4%) 100%
          )
        `,
        minHeight: '100vh',
        position: 'relative' as const,
        // Add glass texture overlay
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 2px,
              rgba(255,255,255,0.01) 2px,
              rgba(255,255,255,0.01) 4px
            )
          `,
          pointerEvents: 'none'
        }
      };
    } else {
      // Light mode: Subtle glass effects with soft transparency
      return {
        background: `
          radial-gradient(circle at 25% 75%, hsla(240, 60%, 80%, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 75% 25%, hsla(260, 50%, 85%, 0.12) 0%, transparent 45%),
          radial-gradient(circle at 50% 50%, hsla(280, 40%, 90%, 0.1) 0%, transparent 40%),
          linear-gradient(135deg, 
            hsl(var(--background)) 0%, 
            hsl(240 20% 98%) 25%,
            hsl(var(--background)) 50%,
            hsl(260 15% 96%) 75%,
            hsl(var(--background)) 100%
          )
        `,
        minHeight: '100vh',
        position: 'relative' as const
      };
    }
  };

  // Fullscreen mode with glass effects
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

  // Normal mode with enhanced glass morphism
  return (
    <SidebarProvider>
      <div 
        className="min-h-screen flex w-full relative overflow-hidden"
        style={getGlassBackgroundStyle()}
      >
        {/* Enhanced glass morphism floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {isDark ? (
            // Dark mode: Glass orbs with enhanced blur and glow
            <>
              <div className="absolute top-20 left-10 w-16 h-16 bg-gradient-to-br from-purple-400/30 to-blue-400/20 rounded-full backdrop-blur-md border border-white/10 shadow-2xl shadow-purple-500/20 animate-pulse" />
              <div className="absolute top-40 right-20 w-20 h-20 bg-gradient-to-br from-blue-400/25 to-purple-400/15 rounded-2xl rotate-12 backdrop-blur-lg border border-white/5 shadow-xl shadow-blue-500/15 animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute bottom-40 left-20 w-12 h-12 bg-gradient-to-br from-white/20 to-purple-300/25 rounded-xl backdrop-blur-sm border border-white/15 shadow-lg shadow-white/10 animate-pulse" style={{ animationDelay: '2s' }} />
              <div className="absolute top-60 right-10 w-24 h-8 bg-gradient-to-r from-purple-400/30 to-blue-400/20 rounded-full backdrop-blur-md border border-white/8 shadow-md animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="absolute bottom-60 right-1/4 w-18 h-18 bg-gradient-to-br from-blue-300/25 to-purple-300/20 rounded-full backdrop-blur-lg border border-white/12 shadow-xl shadow-blue-400/15 animate-pulse" style={{ animationDelay: '1.5s' }} />
              
              {/* Additional glass particles */}
              <div className="absolute top-1/3 left-1/4 w-6 h-6 bg-gradient-to-br from-white/25 to-purple-200/30 rounded-full backdrop-blur-sm border border-white/20 shadow-lg animate-pulse" style={{ animationDelay: '0.8s' }} />
              <div className="absolute bottom-1/3 right-1/3 w-8 h-8 bg-gradient-to-br from-blue-300/30 to-white/20 rounded-full backdrop-blur-md border border-white/15 shadow-md animate-pulse" style={{ animationDelay: '2.5s' }} />
              
              {/* Large glass background orbs */}
              <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full backdrop-blur-3xl border border-white/5 shadow-2xl" />
              <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-to-br from-blue-500/8 to-transparent rounded-full backdrop-blur-2xl border border-white/3 shadow-xl" />
            </>
          ) : (
            // Light mode: Subtle glass elements
            <>
              <div className="absolute top-20 left-10 w-12 h-12 bg-gradient-to-br from-white/40 to-purple-100/30 rounded-full backdrop-blur-sm border border-white/30 shadow-lg animate-pulse" />
              <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-blue-50/50 to-white/40 rounded-2xl rotate-12 backdrop-blur-md border border-white/25 shadow-md animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute bottom-40 left-20 w-10 h-10 bg-gradient-to-br from-purple-50/60 to-white/50 rounded-xl backdrop-blur-sm border border-white/35 shadow-sm animate-pulse" style={{ animationDelay: '2s' }} />
              <div className="absolute top-60 right-10 w-20 h-6 bg-gradient-to-r from-white/30 to-blue-50/40 rounded-full backdrop-blur-sm border border-white/20 shadow-sm animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="absolute bottom-60 right-1/4 w-14 h-14 bg-gradient-to-br from-white/35 to-purple-50/45 rounded-full backdrop-blur-md border border-white/25 shadow-md animate-pulse" style={{ animationDelay: '1.5s' }} />
            </>
          )}
        </div>
        
        {/* Glass morphism sidebar */}
        <div className="relative z-20">
          <AppSidebar />
        </div>
        
        <SidebarInset className="flex-1 flex flex-col relative z-10">
          {/* Enhanced glass header */}
          {isMobile ? (
            <MobileDashboardHeader title="AI Assistant" />
          ) : (
            <div className="border-b border-white/10 bg-background/70 backdrop-blur-xl shadow-lg">
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
          
          {/* Main chat area with glass container */}
          <div className="flex flex-col flex-1 min-h-0 w-full relative">
            {/* Glass container wrapper */}
            <div className="absolute inset-4 bg-background/20 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            </div>
            
            {/* Chat content */}
            <div className="relative z-10 flex flex-col flex-1 min-h-0 p-4">
              <ChatArea
                messages={messages}
                isTyping={isTyping}
                viewportRef={viewportRef}
                onSendMessage={handleSendMessageWithSession}
              />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AIAssistantPage;
