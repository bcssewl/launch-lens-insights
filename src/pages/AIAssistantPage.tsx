
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { FloatingElements } from '@/components/landing/FloatingElements';
import DashboardHeader from '@/components/DashboardHeader';
import MobileDashboardHeader from '@/components/mobile/MobileDashboardHeader';
import ChatArea from '@/components/assistant/ChatArea';
import CanvasView from '@/components/assistant/CanvasView';
import FullscreenChatLayout from '@/components/assistant/FullscreenChatLayout';
import ChatSubheader from '@/components/assistant/ChatSubheader';
import { useChatSessions } from '@/hooks/useChatSessions';
import { useChatHistory } from '@/hooks/useChatHistory';
import { useMessages } from '@/hooks/useMessages';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from 'next-themes';
import { Loader2 } from 'lucide-react';

const AIAssistantPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { theme } = useTheme();

  const {
    currentSessionId,
    setCurrentSessionId,
    createSession
  } = useChatSessions();
  const {
    clearHistory
  } = useChatHistory(currentSessionId);
  const {
    messages,
    isTyping,
    isLoadingHistory,
    viewportRef,
    handleSendMessage,
    handleClearConversation,
    handleDownloadChat,
    isConfigured,
    canvasState,
    handleOpenCanvas,
    handleCloseCanvas,
    handleCanvasDownload,
    handleCanvasPrint,
    handleCanvasPdfDownload
  } = useMessages(currentSessionId);
  const [editedCanvasContent, setEditedCanvasContent] = useState(canvasState.content);

  // Update edited content when canvas state changes
  useEffect(() => {
    setEditedCanvasContent(canvasState.content);
  }, [canvasState.content]);

  // Initialize session from URL or create new one if none exists
  useEffect(() => {
    const sessionParam = searchParams.get('session');
    console.log('URL session parameter:', sessionParam);
    
    if (sessionParam && sessionParam !== currentSessionId) {
      console.log('Setting session from URL:', sessionParam);
      setCurrentSessionId(sessionParam);
    } else if (!sessionParam && !currentSessionId) {
      console.log('No session in URL and no current session, creating new one...');
      handleCreateNewSession();
    }
  }, [searchParams, currentSessionId, setCurrentSessionId]);

  // Enhanced debugging with CSS inspection
  useEffect(() => {
    console.log('=== AI Assistant Page Debug ===');
    console.log('Current route:', window.location.pathname);
    console.log('Current session ID:', currentSessionId);
    console.log('URL session param:', searchParams.get('session'));
    console.log('Messages count:', messages.length);
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
  }, [theme, currentSessionId, messages, searchParams]);

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

  const handleCreateNewSession = async () => {
    console.log('Creating new session...');
    try {
      const newSession = await createSession('New Chat');
      if (newSession) {
        console.log('New session created:', newSession.id);
        setCurrentSessionId(newSession.id);
        navigate(`/dashboard/assistant?session=${newSession.id}`, { replace: true });
      }
    } catch (error) {
      console.error('Failed to create new session:', error);
    }
  };

  const handleSendMessageWithSession = async (text: string) => {
    console.log('AIAssistantPage: Sending message with session:', currentSessionId);

    // Create session if none exists
    if (!currentSessionId) {
      console.log('AIAssistantPage: No current session, creating new one...');
      await handleCreateNewSession();
      // Wait a bit for the session to be set before sending the message
      setTimeout(() => {
        if (currentSessionId) {
          handleSendMessage(text);
        }
      }, 100);
    } else {
      handleSendMessage(text);
    }
  };

  const handleClearConversationWithHistory = async () => {
    console.log('AIAssistantPage: Clearing conversation and history for session:', currentSessionId);
    handleClearConversation();
    if (currentSessionId) {
      await clearHistory();
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    console.log('AIAssistantPage: Session selected:', sessionId);
    if (sessionId === '') {
      // Empty string means create new session
      handleCreateNewSession();
    } else {
      // Navigate to the assistant page with the selected session ID
      setCurrentSessionId(sessionId);
      navigate(`/dashboard/assistant?session=${sessionId}`);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleCanvasContentUpdate = (newContent: string) => {
    console.log('AIAssistantPage: Canvas content updated');
    setEditedCanvasContent(newContent);
    // TODO: You might want to save this to the backend or update the original message
  };

  // Show loading state while history is being loaded
  if (isLoadingHistory) {
    return (
      <div className="min-h-screen flex w-full apple-hero relative">
        <FloatingElements />
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="flex-1 flex flex-col bg-transparent">
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading chat session...</p>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    );
  }

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
        canvasState={canvasState} 
        onOpenCanvas={handleOpenCanvas} 
        onCloseCanvas={handleCloseCanvas} 
        onCanvasDownload={handleCanvasDownload} 
        onCanvasPrint={handleCanvasPrint} 
      />
    );
  }

  // Normal mode with proper height constraints for sticky header and input
  return (
    <div className="min-h-screen flex w-full apple-hero relative">
      {/* Floating Elements at the root level */}
      <FloatingElements />
      
      <SidebarProvider>
        <AppSidebar />
        
        <SidebarInset className="flex-1 flex flex-col bg-transparent h-screen">
          {/* Fixed Header */}
          {isMobile ? (
            <MobileDashboardHeader title="AI Assistant" />
          ) : (
            <div className="flex-shrink-0 bg-transparent">
              <div className="px-6 flex items-center justify-between py-[10px]">
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
          
          {/* Main chat area - takes remaining height */}
          <div className="flex-1 min-h-0 bg-transparent">
            <ChatArea 
              messages={messages} 
              isTyping={isTyping} 
              viewportRef={viewportRef} 
              onSendMessage={handleSendMessageWithSession} 
              onOpenCanvas={handleOpenCanvas} 
              onCloseCanvas={handleCloseCanvas} 
              onCanvasDownload={handleCanvasDownload} 
              onCanvasPrint={handleCanvasPrint} 
            />
          </div>
        </SidebarInset>
      </SidebarProvider>

      {/* SINGLE Canvas View - Only rendered here */}
      <CanvasView 
        isOpen={canvasState.isOpen} 
        onClose={handleCloseCanvas} 
        content={editedCanvasContent} 
        title="AI Report" 
        onDownload={handleCanvasDownload} 
        onPrint={handleCanvasPdfDownload} 
        messages={messages} 
        isTyping={isTyping} 
        viewportRef={viewportRef} 
        onSendMessage={handleSendMessageWithSession} 
        canvasState={canvasState} 
        onOpenCanvas={handleOpenCanvas} 
        onCloseCanvas={handleCloseCanvas} 
        onCanvasDownload={handleCanvasDownload} 
        onCanvasPrint={handleCanvasPdfDownload} 
        onContentUpdate={handleCanvasContentUpdate} 
      />
    </div>
  );
};

export default AIAssistantPage;
