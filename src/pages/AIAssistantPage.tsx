
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { FloatingElements } from '@/components/landing/FloatingElements';
import ChatArea from '@/components/assistant/ChatArea';
import CanvasView from '@/components/assistant/CanvasView';
import ChatSubheader from '@/components/assistant/ChatSubheader';
import EnhancedChatInput from '@/components/assistant/EnhancedChatInput';
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
  const [selectedModel, setSelectedModel] = useState<string>('best');
  const [selectedResearchType, setSelectedResearchType] = useState<string>('quick_facts');
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

  const handleSendMessageWithSession = async (text: string, attachments?: any[], modelOverride?: string, researchType?: string) => {
    const modelToUse = modelOverride || selectedModel;
    const researchTypeToUse = researchType || selectedResearchType;

    if (!currentSessionId) {
      const newSession = await createSession();
      if (!newSession) {
        console.error('AIAssistantPage: Failed to create new session');
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      handleSendMessage(text, undefined, modelToUse, researchTypeToUse, newSession.id);
    } else {
      handleSendMessage(text, undefined, modelToUse, researchTypeToUse);
    }
  };

  const handleClearConversationWithHistory = async () => {
    handleClearConversation();
    if (currentSessionId) {
      await clearHistory();
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    if (sessionId === '') {
      navigateToSession(null);
    } else {
      navigateToSession(sessionId);
    }
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
      <DashboardLayout>
        <div className="h-full flex items-center justify-center relative">
          <FloatingElements />
          <ReasoningProvider>
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading chat session...</p>
            </div>
          </ReasoningProvider>
        </div>
      </DashboardLayout>
    );
  }

  const hasConversation = messages.length > 1 || isTyping;

  return (
    <DashboardLayout>
      <div className="h-screen flex flex-col relative">
        <FloatingElements />
        
        <ReasoningProvider>
          <div className="h-full flex flex-col bg-transparent">
            {!isMobile && (
              <div className="flex-shrink-0 bg-transparent">
                <ChatSubheader 
                  isConfigured={isConfigured} 
                  currentSessionId={currentSessionId} 
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
            
            <div className="flex-1 min-h-0 bg-transparent relative">
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

            {/* Sticky input bar with ChatGPT-style spacing - no border for seamless integration */}
            <div className="sticky bottom-0 left-0 right-0 bg-background/50 backdrop-blur-sm z-50 pb-2 md:pb-4">
              <div className="max-w-4xl mx-auto px-6 py-3 md:py-4">
                <EnhancedChatInput 
                  onSendMessage={handleSendMessageWithSession} 
                  isTyping={isTyping}
                  isCompact={hasConversation}
                  selectedModel={selectedModel}
                  selectedResearchType={selectedResearchType}
                  onResearchTypeChange={handleResearchTypeChange}
                  onModelSelect={handleModelSelect}
                />
              </div>
            </div>
          </div>

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
    </DashboardLayout>
  );
};

export default AIAssistantPage;
