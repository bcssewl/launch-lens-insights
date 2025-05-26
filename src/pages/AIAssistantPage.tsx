import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardHeader from '@/components/DashboardHeader';
import ChatMessage, { ChatMessageData } from '@/components/assistant/ChatMessage';
import ChatInput from '@/components/assistant/ChatInput';
import SuggestedPrompts from '@/components/assistant/SuggestedPrompts';
import ChatSidebar from '@/components/assistant/ChatSidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowDown, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs for messages
import { format } from 'date-fns';

const samplePrompts = [
  "What's a good name for my startup?",
  "How do I validate B2B demand?",
  "What would investors ask about my idea?",
  "Help me design a landing page test",
  "What are similar successful startups?",
  "How can I reduce customer acquisition cost?",
];

const initialMessages: ChatMessageData[] = [
  {
    id: uuidv4(),
    text: "Hi! I'm your AI startup advisor. I can help you refine ideas, suggest validation methods, or answer questions about your analyses. What would you like to discuss?",
    sender: 'ai',
    timestamp: format(new Date(), "p"),
  },
  {
    id: uuidv4(),
    text: "How can I improve my SaaS idea's validation score?",
    sender: 'user',
    timestamp: format(new Date(Date.now() - 1000 * 60 * 2), "p"), // 2 mins ago
  },
  {
    id: uuidv4(),
    text: "Great question! Based on your recent analysis, here are 3 ways to improve your score:\n1) Narrow your target market to a specific niche.\n2) Research and differentiate from the 24 competitors identified.\n3) Test pricing with a landing page experiment.\n\nWould you like me to elaborate on any of these?",
    sender: 'ai',
    timestamp: format(new Date(Date.now() - 1000 * 60 * 1), "p"), // 1 min ago
  },
];

const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageData[]>(initialMessages);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null); // Ref for the viewport of ScrollArea

  // Mock recent topics for sidebar
  const [recentTopics, setRecentTopics] = useState<string[]>([
    "Improving SaaS validation",
    "B2B demand validation",
    "Naming a startup",
  ]);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior });
    }
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, [messages.length]);
  
  useEffect(() => {
    const viewport = viewportRef.current;
    const handleScroll = () => {
      if (viewport) {
        const isScrolledToBottom = viewport.scrollHeight - viewport.scrollTop <= viewport.clientHeight + 50; // Add some tolerance
        setShowScrollDown(!isScrolledToBottom);
      }
    };

    if (viewport) {
      viewport.addEventListener('scroll', handleScroll);
      return () => viewport.removeEventListener('scroll', handleScroll);
    }
  }, []);


  const handleSendMessage = (text: string) => {
    const newUserMessage: ChatMessageData = {
      id: uuidv4(),
      text,
      sender: 'user',
      timestamp: format(new Date(), "p"),
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsAiTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessageData = {
        id: uuidv4(),
        text: `I've received your message: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}". I'm processing your request... (This is a simulated response)`,
        sender: 'ai',
        timestamp: format(new Date(), "p"),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsAiTyping(false);
      // Add to recent topics (simple example)
      if (!recentTopics.includes(text.substring(0,30))) {
        setRecentTopics(prev => [text.substring(0,30) + "...", ...prev.slice(0,4)]);
      }

    }, 1500 + Math.random() * 1000);
  };

  const handlePromptClick = (prompt: string) => {
    handleSendMessage(prompt);
  };
  
  const handleClearConversation = () => {
    setMessages([]);
    // Optionally, clear recent topics or keep them
    // setRecentTopics([]); 
  };

  const handleDownloadChat = () => {
    // Placeholder for chat download logic
    alert("Download chat history - functionality coming soon!");
    console.log("Chat history:", messages);
  };

  return (
    <DashboardLayout>
      <DashboardHeader>AI Assistant</DashboardHeader>
      <div className="flex h-[calc(100vh-var(--header-height,89px))]"> {/* Adjust var if header height differs */}
        <div className="flex-grow flex flex-col overflow-hidden relative">
          <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef} viewportRef={viewportRef}>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isAiTyping && (
              <ChatMessage
                message={{
                  id: 'typing',
                  text: 'AI is typing...',
                  sender: 'ai',
                  timestamp: format(new Date(), "p"),
                }}
              />
            )}
          </ScrollArea>
          
          {showScrollDown && (
            <Button
              variant="outline"
              size="icon"
              className="absolute bottom-24 right-6 z-10 rounded-full bg-background/80 backdrop-blur-sm"
              onClick={() => scrollToBottom()}
              aria-label="Scroll to bottom"
            >
              <ArrowDown className="h-5 w-5" />
            </Button>
          )}

          <SuggestedPrompts prompts={samplePrompts} onPromptClick={handlePromptClick} />
          <ChatInput 
            onSendMessage={handleSendMessage} 
            isTyping={isAiTyping} 
            onClearConversation={handleClearConversation} 
          />
        </div>
        <ChatSidebar 
            recentTopics={recentTopics} 
            onDownloadChat={handleDownloadChat}
            onClearConversation={handleClearConversation}
        />
      </div>
    </DashboardLayout>
  );
};

export default AIAssistantPage;
