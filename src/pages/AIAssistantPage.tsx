import React, { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { FloatingElements } from '@/components/landing/FloatingElements';
import DashboardHeader from '@/components/DashboardHeader';
import MobileDashboardHeader from '@/components/mobile/MobileDashboardHeader';
import ChatArea from '@/components/assistant/ChatArea';
import EnhancedChatInput from '@/components/assistant/EnhancedChatInput';
import CanvasView from '@/components/assistant/CanvasView';
import FullscreenChatLayout from '@/components/assistant/FullscreenChatLayout';
import ChatSubheader from '@/components/assistant/ChatSubheader';
import { useChatSessions } from '@/hooks/useChatSessions';
import { useChatHistory } from '@/hooks/useChatHistory';
import { useMessages } from '@/hooks/useMessages';
import { useAlegeonStreaming } from '@/hooks/useAlegeonStreaming';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from 'next-themes';
import { Loader2 } from 'lucide-react';
import type { AIModel } from '@/components/assistant/ModelSelectionDropdown';

const AIAssistantPage: React.FC = () => {
  const isMobile = useIsMobile();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('best');
  const { theme } = useTheme();

  const {
    currentSessionId,
    setCurrentSessionId,
    navigateToSession,
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
    handleCanvasPdfDownload,
    streamingState,
    stratixStreamingState
  } = useMessages(currentSessionId);
  const { streamingState: alegeonStreamingState } = useAlegeonStreaming();
  const [editedCanvasContent, setEditedCanvasContent] = useState(canvasState.content);

  // Update edited content when canvas state changes
  useEffect(() => {
    setEditedCanvasContent(canvasState.content);
  }, [canvasState.content]);

  // Enhanced debugging with CSS inspection
  useEffect(() => {
    console.log('=== AI Assistant Page Debug ===');
    console.log('Current route:', window.location.pathname);
    console.log('Current session ID:', currentSessionId);
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
  }, [theme, currentSessionId]);

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

  const handleSendMessageWithSession = async (text: string, attachments?: any[], modelOverride?: string, researchType?: string) => {
    // Use the modelOverride if provided, otherwise use the current selectedModel
    const modelToUse = modelOverride || selectedModel;
    console.log('AIAssistantPage: Sending message with session:', currentSessionId, 'model:', modelToUse, 'research type:', researchType);

    // Create session if none exists
    if (!currentSessionId) {
      console.log('AIAssistantPage: No current session, creating new one...');
      const newSession = await createSession();
      if (!newSession) {
        console.error('AIAssistantPage: Failed to create new session');
        return;
      }
      console.log('AIAssistantPage: Created new session:', newSession.id);
      
      // Wait for session to be fully set and URL to update
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Now send the message with the new session
      handleSendMessage(text, undefined, modelToUse, researchType);
    } else {
      handleSendMessage(text, undefined, modelToUse, researchType);
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
      // Empty string means clear current session
      navigateToSession(null);
    } else {
      navigateToSession(sessionId);
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

  // Fixed model selection handler
  const handleModelSelect = (modelId: string) => {
    console.log('AIAssistantPage: Model selected:', modelId);
    setSelectedModel(modelId);
  };

  // Convert streamingState to match ChatArea expectations
  const convertedStreamingState = streamingState ? {
    isStreaming: streamingState.isStreaming,
    updates: [], // Can be populated if needed
    sources: streamingState.discoveredSources?.map(source => ({
      name: source.name,
      url: source.url,
      type: source.type,
      confidence: source.confidence
    })) || [],
    progress: {
      phase: streamingState.currentPhase,
      progress: streamingState.progress
    }
  } : undefined;

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
        selectedModel={selectedModel}
        canvasState={canvasState} 
        onOpenCanvas={handleOpenCanvas} 
        onCloseCanvas={handleCloseCanvas} 
        onCanvasDownload={handleCanvasDownload} 
        onCanvasPrint={handleCanvasPrint}
        streamingState={streamingState}
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
                <ChatSubheader 
                  isConfigured={isConfigured} 
                  currentSessionId={currentSessionId} 
                  isFullscreen={isFullscreen} 
                  onToggleFullscreen={toggleFullscreen} 
                  onDownloadChat={handleDownloadChat} 
                  onClearConversation={handleClearConversationWithHistory} 
                  onSessionSelect={handleSessionSelect}
                  selectedModel={selectedModel}
                  onModelSelect={handleModelSelect}
                />
              </div>
            </div>
          )}
          
          {/* Main chat area - takes remaining height */}
          <div className="flex-1 min-h-0 bg-transparent flex flex-col">
            <div className="flex-1 min-h-0">
              <ChatArea 
                messages={messages} 
                isTyping={isTyping} 
                viewportRef={viewportRef} 
                onSendMessage={handleSendMessageWithSession}
                selectedModel={selectedModel}
                canvasState={canvasState}
                onOpenCanvas={handleOpenCanvas} 
                onCloseCanvas={handleCloseCanvas} 
                onCanvasDownload={handleCanvasDownload} 
                onCanvasPrint={handleCanvasPrint}
                streamingState={convertedStreamingState}
                stratixStreamingState={stratixStreamingState}
                alegeonStreamingState={alegeonStreamingState}
              />
            </div>
            
            {/* Fixed Chat Input at bottom */}
            <div className="flex-shrink-0 px-6 py-4 border-t border-border/50 bg-background/80 backdrop-blur-sm">
              <EnhancedChatInput
                onSendMessage={handleSendMessageWithSession}
                isTyping={isTyping}
                isCompact={false}
                selectedModel={selectedModel}
              />
            </div>
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
        selectedModel={selectedModel}
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
