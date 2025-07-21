import React, { useState, useEffect } from 'react';
import { FloatingElements } from '@/components/landing/FloatingElements';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import ChatArea from '@/components/assistant/ChatArea';
import CanvasView from '@/components/assistant/CanvasView';
import FullscreenChatLayout from '@/components/assistant/FullscreenChatLayout';
import ChatSubheader from '@/components/assistant/ChatSubheader';
import { ReasoningProvider } from '@/contexts/ReasoningContext';
import { useChatSessions } from '@/hooks/useChatSessions';
import { useChatHistory } from '@/hooks/useChatHistory';
import { useMessages } from '@/hooks/useMessages';
import { useAlegeonStreamingV2 } from '@/hooks/useAlegeonStreamingV2';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from 'next-themes';
import { Loader2 } from 'lucide-react';

const AIAssistantPage: React.FC = () => {
  const isMobile = useIsMobile();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('best');
  const [selectedResearchType, setSelectedResearchType] = useState<string>('quick_facts');
  const [isProcessingMessage, setIsProcessingMessage] = useState(false);
  const { theme } = useTheme();

  const {
    currentSessionId,
    setCurrentSessionId,
    navigateToSession,
    createSession,
    sessions,
    updateSessionTitle
  } = useChatSessions();
  const {
    clearHistory
  } = useChatHistory(currentSessionId);
  
  const currentSession = sessions.find(s => s.id === currentSessionId);
  
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
  } = useMessages(currentSessionId, updateSessionTitle, currentSession?.title);
  
  const { streamingState: alegeonStreamingStateV2, startStreaming: startAlegeonV2, fastForward } = useAlegeonStreamingV2(null);
  const [editedCanvasContent, setEditedCanvasContent] = useState(canvasState.content);

  useEffect(() => {
    setEditedCanvasContent(canvasState.content);
  }, [canvasState.content]);

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
    // Prevent multiple simultaneous message processing
    if (isProcessingMessage) return;
    
    setIsProcessingMessage(true);
    
    try {
      const modelToUse = modelOverride || selectedModel;
      const researchTypeToUse = researchType || selectedResearchType;

      if (!currentSessionId) {
        const newSession = await createSession();
        if (!newSession) {
          console.error('AIAssistantPage: Failed to create new session');
          return;
        }
        
        // Wait for session to be fully created before proceeding
        await new Promise(resolve => setTimeout(resolve, 200));
        
        handleSendMessage(text, undefined, modelToUse, researchTypeToUse, newSession.id);
      } else {
        handleSendMessage(text, undefined, modelToUse, researchTypeToUse);
      }
    } finally {
      // Add a delay before allowing next message to prevent race conditions
      setTimeout(() => {
        setIsProcessingMessage(false);
      }, 500);
    }
  };

  const handleClearConversationWithHistory = async () => {
    if (isProcessingMessage) return;
    
    handleClearConversation();
    if (currentSessionId) {
      await clearHistory();
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    // Prevent session changes during message processing
    if (isProcessingMessage) return;
    
    if (sessionId === '') {
      navigateToSession(null);
    } else {
      navigateToSession(sessionId);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleCanvasContentUpdate = (newContent: string) => {
    setEditedCanvasContent(newContent);
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    if (modelId === 'algeon') {
      setSelectedResearchType('quick_facts');
    }
  };

  const handleResearchTypeChange = (type: string) => {
    setSelectedResearchType(type);
  };

  if (isLoadingHistory) {
    return (
      <div className="min-h-screen flex w-full apple-hero relative">
        <FloatingElements />
        <ReasoningProvider>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading chat session...</p>
            </div>
          </div>
        </ReasoningProvider>
      </div>
    );
  }

  if (isFullscreen) {
    return (
      <ReasoningProvider>
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
      </ReasoningProvider>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full apple-hero relative">
      <FloatingElements />
      
      <ReasoningProvider>
        <div className="flex-1 flex flex-col bg-transparent">
          {!isMobile && (
            <div className="flex-shrink-0 bg-transparent">
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
                selectedResearchType={selectedResearchType}
                onResearchTypeChange={handleResearchTypeChange}
              />
            </div>
          )}
          
          <div className="flex-1 min-h-0 bg-transparent pb-20">
            <ChatArea 
              messages={messages} 
              isTyping={isTyping} 
              viewportRef={viewportRef} 
              onSendMessage={handleSendMessageWithSession}
              selectedModel={selectedModel}
              onOpenCanvas={handleOpenCanvas} 
              onCloseCanvas={handleCloseCanvas} 
              onCanvasDownload={handleCanvasDownload} 
              onCanvasPrint={handleCanvasPrint}
              streamingState={streamingState}
              stratixStreamingState={stratixStreamingState}
              alegeonStreamingState={alegeonStreamingStateV2}
              onAlegeonFastForward={fastForward}
            />
          </div>
        </div>

        <BottomNavigation />

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
      </ReasoningProvider>
    </div>
  );
};

export default AIAssistantPage;
