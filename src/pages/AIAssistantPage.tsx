
import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowRight, Loader2 } from 'lucide-react';
import AIAvatar from '@/components/assistant/AIAvatar';
import UserAvatar from '@/components/assistant/UserAvatar';
import ChatMessage from '@/components/assistant/ChatMessage';
import SuggestedPrompts from '@/components/assistant/SuggestedPrompts';
import ChatSidebar from '@/components/assistant/ChatSidebar';
import { useN8nWebhook } from '@/hooks/useN8nWebhook';

interface Message {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: Date;
  avatar?: React.ReactNode;
}

const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const initialMessages: Message[] = [
  {
    id: uuidv4(),
    text: "Hi! I'm your AI startup advisor. I can help you refine ideas, suggest validation methods, or answer questions about your analyses. What would you like to discuss?",
    sender: 'ai',
    timestamp: new Date(Date.now() - 120000),
    avatar: <AIAvatar className="w-8 h-8" />
  },
];

const suggestedPromptsData = [
  { id: "sp1", text: "What's a good name for my startup?" },
  { id: "sp2", text: "How do I validate B2B demand?" },
  { id: "sp3", text: "What would investors ask about my idea?" },
  { id: "sp4", text: "Help me design a landing page test" },
  { id: "sp5", text: "What are similar successful startups?" },
  { id: "sp6", text: "How can I reduce customer acquisition cost?" },
];

const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const { sendMessageToN8n, isConfigured } = useN8nWebhook();

  const scrollToBottom = () => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputValue;
    if (messageText.trim() === '') return;

    const newUserMessage: Message = {
      id: uuidv4(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
      avatar: <UserAvatar className="w-8 h-8" />
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    if (!text) setInputValue('');

    if (!isConfigured) {
      const fallbackResponse: Message = {
        id: uuidv4(),
        text: "N8N webhook URL is not configured. Please set the VITE_N8N_WEBHOOK_URL environment variable.",
        sender: 'ai',
        timestamp: new Date(),
        avatar: <AIAvatar className="w-8 h-8" />
      };
      setMessages(prev => [...prev, fallbackResponse]);
      return;
    }

    setIsTyping(true);
    
    try {
      const aiResponseText = await sendMessageToN8n(messageText);
      
      const aiResponse: Message = {
        id: uuidv4(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date(),
        avatar: <AIAvatar className="w-8 h-8" />
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      const errorResponse: Message = {
        id: uuidv4(),
        text: "Sorry, I'm having trouble connecting to the AI service. Please check your n8n webhook configuration and try again.",
        sender: 'ai',
        timestamp: new Date(),
        avatar: <AIAvatar className="w-8 h-8" />
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearConversation = () => {
    setMessages([initialMessages[0]]);
  };

  const handleDownloadChat = () => {
    const chatContent = messages.map(msg => 
      `[${formatTimestamp(msg.timestamp)}] ${msg.sender.toUpperCase()}: ${msg.text}`
    ).join('\n\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const suggestedPromptsStrings = suggestedPromptsData.map(p => p.text);

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-var(--header-height))]">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="p-4 border-b bg-background">
            <h1 className="text-xl font-semibold font-heading">AI Assistant</h1>
            <p className="text-sm text-muted-foreground">
              {isConfigured ? 'Powered by your n8n workflow' : 'N8N webhook not configured'}
            </p>
          </header>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
             <ScrollArea className="h-full w-full" ref={scrollAreaRef} viewportRef={viewportRef}>
              <div className="pr-4 space-y-6">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={{ ...msg, timestamp: formatTimestamp(msg.timestamp) }} />
                ))}
                {isTyping && (
                  <div className="flex items-start space-x-3">
                    <AIAvatar className="w-8 h-8" />
                    <div className="bg-primary/10 text-primary-foreground p-3 rounded-lg max-w-xl animate-pulse">
                      <Loader2 className="w-5 h-5 animate-spin mr-2 inline-block" /> Thinking...
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t bg-background">
            <SuggestedPrompts prompts={suggestedPromptsStrings} onPromptClick={handleSendMessage} />
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center space-x-2 mt-2">
              <Input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything about your startup ideas..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button type="submit" size="icon" disabled={isTyping || inputValue.trim() === ''} className="gradient-button">
                <ArrowRight className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>

        {/* Right Sidebar (Desktop Only) */}
        <ChatSidebar 
          onClearConversation={handleClearConversation}
          onDownloadChat={handleDownloadChat}
          recentTopics={[]}
        />
      </div>
    </DashboardLayout>
  );
};

export default AIAssistantPage;
