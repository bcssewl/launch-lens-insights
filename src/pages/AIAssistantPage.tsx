
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardHeader from '@/components/DashboardHeader';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from '@/components/assistant/ChatMessage';
import ChatSidebar from '@/components/assistant/ChatSidebar';
import ChatInput from '@/components/assistant/ChatInput';
import TypingIndicator from '@/components/assistant/TypingIndicator';
import { useChatSessions } from '@/hooks/useChatSessions';
import { useChatHistory } from '@/hooks/useChatHistory';
import { useMessages } from '@/hooks/useMessages';
import { formatTimestamp } from '@/constants/aiAssistant';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles } from 'lucide-react';

const AIAssistantPage: React.FC = () => {
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

  const handleSendMessageWithSession = async (text: string) => {
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

  return (
    <DashboardLayout>
      <DashboardHeader>AI Assistant</DashboardHeader>
      <div className="flex h-[calc(100vh-120px)] page-background">
        {/* Enhanced Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-background">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full filter blur-2xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>
        
        <div className="flex-1 flex flex-col min-h-0 relative z-10">
          {/* Hero Section - Only show when no messages or just initial message */}
          {messages.length <= 1 && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
              <div className="relative z-10 mb-8">
                <Badge variant="secondary" className="mb-6 px-4 py-2 bg-primary/10 text-primary border-primary/20 backdrop-blur-sm glassmorphism-card">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Introducing AI-Powered Startup Advisor
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
                  Build Stunning startups{' '}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    effortlessly
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
                  {isConfigured 
                    ? 'AI-powered startup advisor can create amazing business insights with few lines of prompt.' 
                    : 'AI service not configured - please contact support for assistance.'}
                </p>
              </div>
              
              {/* Enhanced Chat Input for Hero */}
              <div className="relative z-10 w-full max-w-3xl">
                <ChatInput onSendMessage={handleSendMessageWithSession} isTyping={isTyping} isHeroMode={true} />
              </div>
            </div>
          )}

          {/* Chat Messages - Only show when there are messages beyond initial */}
          {messages.length > 1 && (
            <>
              {/* Status Bar */}
              <div className="p-4 border-b border-border/50 glassmorphism-card rounded-none border-l-0 border-r-0 border-t-0 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-foreground">AI Startup Advisor</span>
                    </div>
                    {currentSessionId && (
                      <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/10">
                        Active Session
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-muted-foreground">Online</span>
                  </div>
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 min-h-0 overflow-hidden bg-gradient-to-b from-background/20 to-transparent">
                <ScrollArea className="h-full w-full" viewportRef={viewportRef}>
                  <div className="p-6 space-y-6">
                    {messages.slice(1).map((msg) => (
                      <ChatMessage key={msg.id} message={{ ...msg, timestamp: formatTimestamp(msg.timestamp) }} />
                    ))}
                    {isTyping && <TypingIndicator />}
                  </div>
                </ScrollArea>
              </div>

              {/* Input Area */}
              <ChatInput onSendMessage={handleSendMessageWithSession} isTyping={isTyping} />
            </>
          )}
        </div>

        {/* Right Sidebar (Desktop Only) */}
        <ChatSidebar 
          onClearConversation={handleClearConversationWithHistory}
          onDownloadChat={handleDownloadChat}
          recentTopics={[]}
          currentSessionId={currentSessionId}
          onSessionSelect={handleSessionSelect}
        />
      </div>
    </DashboardLayout>
  );
};

export default AIAssistantPage;
