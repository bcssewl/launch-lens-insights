
import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import DashboardHeader from '@/components/DashboardHeader';
import MobileDashboardHeader from '@/components/mobile/MobileDashboardHeader';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from '@/components/assistant/ChatMessage';
import ChatSidebar from '@/components/assistant/ChatSidebar';
import ChatInput from '@/components/assistant/ChatInput';
import TypingIndicator from '@/components/assistant/TypingIndicator';
import { useChatSessions } from '@/hooks/useChatSessions';
import { useChatHistory } from '@/hooks/useChatHistory';
import { useMessages } from '@/hooks/useMessages';
import { formatTimestamp } from '@/constants/aiAssistant';
import { useIsMobile } from '@/hooks/use-mobile';
import ChatEmptyState from '@/components/assistant/ChatEmptyState';

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

  // Fullscreen content - only chat interface
  if (isFullscreen) {
    return (
      <div className="bg-gradient-to-br from-background via-background to-muted/10 min-h-screen">
        <div className="flex flex-col md:flex-row h-screen min-h-0 w-full relative bg-gradient-to-br from-background via-background to-muted/10 transition-all">
          <div className="flex-1 flex flex-col min-h-0">
            {/* Subheader with fullscreen toggle */}
            <div className="p-6 border-b border-border/50 bg-background/50 backdrop-blur-xl flex-shrink-0 rounded-t-3xl mx-4 mt-4 flex items-center justify-between z-10">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isConfigured ? 'AI-powered startup advisor' : 'AI service not configured'}
                  {currentSessionId && (
                    <span className="ml-2 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20">
                      Active Session
                    </span>
                  )}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="h-8 w-8"
                aria-label="Exit fullscreen"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 min-h-0 overflow-hidden mx-4 bg-background/30 backdrop-blur-xl border border-border/50 border-t-0 rounded-b-3xl relative">
              <ScrollArea className="h-full w-full" viewportRef={viewportRef}>
                <div className="p-6 space-y-6 flex flex-col items-stretch min-h-full transition-all duration-150">
                  {messages.length <= 1 && !isTyping ? (
                    <ChatEmptyState />
                  ) : (
                    <>
                      {messages.map((msg, idx) => (
                        <ChatMessage key={msg.id} message={{ ...msg, timestamp: formatTimestamp(msg.timestamp) }} />
                      ))}
                      {isTyping && <TypingIndicator />}
                    </>
                  )}
                </div>
                <div className="absolute left-0 top-0 w-full h-6 pointer-events-none z-10 bg-gradient-to-b from-background/90 via-background/80 to-transparent" />
                <div className="absolute left-0 bottom-0 w-full h-10 pointer-events-none z-10 bg-gradient-to-t from-background/95 via-background/60 to-transparent" />
              </ScrollArea>
            </div>

            {/* Input Area */}
            <div className="p-4">
              <ChatInput onSendMessage={handleSendMessageWithSession} isTyping={isTyping} />
            </div>
          </div>

          {/* Chat Sidebar for fullscreen */}
          <div className="hidden md:block md:w-80 lg:w-96 xl:w-[410px] flex-shrink-0 duration-200 transition-all">
            <ChatSidebar 
              onClearConversation={handleClearConversationWithHistory}
              onDownloadChat={handleDownloadChat}
              recentTopics={[]}
              currentSessionId={currentSessionId}
              onSessionSelect={handleSessionSelect}
            />
          </div>
          {isMobile && (
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

  // Normal mode - with main navigation
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-muted/10">
        {/* Main Navigation Sidebar */}
        <AppSidebar />
        
        {/* Main Content Area */}
        <SidebarInset className="flex-1 flex flex-col">
          {/* Headers */}
          {isMobile ? (
            <MobileDashboardHeader title="AI Assistant" />
          ) : (
            <DashboardHeader>AI Assistant</DashboardHeader>
          )}
          
          {/* Chat Content */}
          <div className="flex flex-col md:flex-row flex-1 min-h-0 w-full relative">
            <div className="flex-1 flex flex-col min-h-0">
              {/* Subheader with fullscreen toggle */}
              <div className="p-6 border-b border-border/50 bg-background/50 backdrop-blur-xl flex-shrink-0 rounded-t-3xl mx-4 mt-4 flex items-center justify-between z-10">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isConfigured ? 'AI-powered startup advisor' : 'AI service not configured'}
                    {currentSessionId && (
                      <span className="ml-2 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20">
                        Active Session
                      </span>
                    )}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="h-8 w-8"
                  aria-label="Enter fullscreen"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 min-h-0 overflow-hidden mx-4 bg-background/30 backdrop-blur-xl border border-border/50 border-t-0 rounded-b-3xl relative">
                <ScrollArea className="h-full w-full" viewportRef={viewportRef}>
                  <div className="p-6 space-y-6 flex flex-col items-stretch min-h-full transition-all duration-150">
                    {messages.length <= 1 && !isTyping ? (
                      <ChatEmptyState />
                    ) : (
                      <>
                        {messages.map((msg, idx) => (
                          <ChatMessage key={msg.id} message={{ ...msg, timestamp: formatTimestamp(msg.timestamp) }} />
                        ))}
                        {isTyping && <TypingIndicator />}
                      </>
                    )}
                  </div>
                  <div className="absolute left-0 top-0 w-full h-6 pointer-events-none z-10 bg-gradient-to-b from-background/90 via-background/80 to-transparent" />
                  <div className="absolute left-0 bottom-0 w-full h-10 pointer-events-none z-10 bg-gradient-to-t from-background/95 via-background/60 to-transparent" />
                </ScrollArea>
              </div>

              {/* Input Area */}
              <div className="p-4">
                <ChatInput onSendMessage={handleSendMessageWithSession} isTyping={isTyping} />
              </div>
            </div>

            {/* Chat Sidebar - positioned properly */}
            <div className="hidden md:block md:w-80 lg:w-96 xl:w-[410px] flex-shrink-0">
              <ChatSidebar 
                onClearConversation={handleClearConversationWithHistory}
                onDownloadChat={handleDownloadChat}
                recentTopics={[]}
                currentSessionId={currentSessionId}
                onSessionSelect={handleSessionSelect}
              />
            </div>
            {isMobile && (
              <ChatSidebar 
                onClearConversation={handleClearConversationWithHistory}
                onDownloadChat={handleDownloadChat}
                recentTopics={[]}
                currentSessionId={currentSessionId}
                onSessionSelect={handleSessionSelect}
              />
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AIAssistantPage;
