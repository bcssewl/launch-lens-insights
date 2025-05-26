import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowRight, Brain, Download, FileText, MessageSquare, Loader2 } from 'lucide-react';
import AIAvatar from '@/components/assistant/AIAvatar';
import UserAvatar from '@/components/assistant/UserAvatar'; // Corrected path
import ChatMessage from '@/components/assistant/ChatMessage';
import SuggestedPrompts from '@/components/assistant/SuggestedPrompts';
import ChatSidebar from '@/components/assistant/ChatSidebar';

interface Message {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: Date;
  avatar?: React.ReactNode;
}

const initialMessages: Message[] = [
  {
    id: uuidv4(),
    text: "Hi! I'm your AI startup advisor. I can help you refine ideas, suggest validation methods, or answer questions about your analyses. What would you like to discuss?",
    sender: 'ai',
    timestamp: new Date(Date.now() - 120000), // 2 minutes ago
    avatar: <AIAvatar className="w-8 h-8" />
  },
  {
    id: uuidv4(),
    text: "How can I improve my SaaS idea's validation score?",
    sender: 'user',
    timestamp: new Date(Date.now() - 60000), // 1 minute ago
    avatar: <UserAvatar className="w-8 h-8" />
  },
  {
    id: uuidv4(),
    text: "Great question! Based on your recent analysis, here are 3 ways to improve your score: 1) Narrow your target market to a specific niche, 2) Research and differentiate from the 24 competitors identified, 3) Test pricing with a landing page experiment. Would you like me to elaborate on any of these?",
    sender: 'ai',
    timestamp: new Date(),
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

  const scrollToBottom = () => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (text?: string) => {
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
    if (!text) setInputValue(''); // Clear input only if not from suggested prompt

    setIsTyping(true);
    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: uuidv4(),
        text: `I'm processing your query about: "${messageText.substring(0, 30)}...". Let me think... Ah, yes! Here's a generic insightful response about that. For more specific help, I might need more context or for my human overlords to actually implement real AI logic.`,
        sender: 'ai',
        timestamp: new Date(),
        avatar: <AIAvatar className="w-8 h-8" />
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const handleClearConversation = () => {
    setMessages([initialMessages[0]]); // Keep only the initial AI greeting
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-var(--header-height))]"> {/* Adjust height if you have a fixed header in DashboardLayout */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="p-4 border-b bg-background">
            <h1 className="text-xl font-semibold font-heading">AI Assistant</h1>
            <p className="text-sm text-muted-foreground">Get personalized advice for your startup ideas</p>
          </header>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
             <ScrollArea className="h-full w-full" ref={scrollAreaRef} viewportRef={viewportRef}>
              <div className="pr-4 space-y-6"> {/* Added pr-4 to prevent scrollbar overlap */}
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
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
            <SuggestedPrompts prompts={suggestedPromptsData} onPromptClick={handleSendMessage} />
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
        <ChatSidebar onClearConversation={handleClearConversation} />
      </div>
    </DashboardLayout>
  );
};

export default AIAssistantPage;
