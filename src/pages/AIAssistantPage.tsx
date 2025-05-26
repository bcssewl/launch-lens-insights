
import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Send, MessageSquare, Settings2, Download, Search, CornerDownLeft, Trash2, Copy, ArrowDownCircle } from 'lucide-react';
import * as uuid from 'uuid'; // Changed import
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import AIAvatar from '@/components/assistant/AIAvatar';
import UserAvatar from '@/components/assistant/UserAvatar'; // Assuming you have or will create this
import DashboardLayout from '@/layouts/DashboardLayout';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Message {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: Date;
}

// Sample messages with unique IDs
const initialMessages: Message[] = [
  { id: uuid.v4(), text: "Hi! I'm your AI startup advisor. I can help you refine ideas, suggest validation methods, or answer questions about your analyses. What would you like to discuss?", sender: 'ai', timestamp: new Date(Date.now() - 120000) },
  { id: uuid.v4(), text: "How can I improve my SaaS idea's validation score?", sender: 'user', timestamp: new Date(Date.now() - 60000) },
  { id: uuid.v4(), text: "Great question! Based on your recent analysis, here are 3 ways to improve your score: 1) Narrow your target market to a specific niche, 2) Research and differentiate from the 24 competitors identified, 3) Test pricing with a landing page experiment. Would you like me to elaborate on any of these?", sender: 'ai', timestamp: new Date() },
];

const suggestedPrompts = [
  "What's a good name for my startup?",
  "How do I validate B2B demand?",
  "What would investors ask about my idea?",
  "Help me design a landing page test",
  "What are similar successful startups?",
  "How can I reduce customer acquisition cost?"
];

const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null); // Added this ref for the viewport

  const scrollToBottom = () => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (text: string) => {
    if (text.trim() === '') return;

    const newUserMessage: Message = {
      id: uuid.v4(), // Changed to uuid.v4()
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    
    setIsAiTyping(true);
    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: uuid.v4(), // Changed to uuid.v4()
        text: `I've received your message: "${text.trim()}". I'm processing it. (Simulated response)`,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, aiResponse]);
      setIsAiTyping(false);
    }, 1500);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
    setInputValue('');
  };

  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt);
    // Optionally send message directly, or let user press send
    // handleSendMessage(prompt); 
  };

  const handleClearConversation = () => {
    setMessages([
       { id: uuid.v4(), text: "Hi! I'm your AI startup advisor. How can I help you today?", sender: 'ai', timestamp: new Date() }
    ]);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full p-4 md:p-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">AI Assistant</h1>
          <p className="text-muted-foreground">Get personalized advice for your startup ideas</p>
        </header>

        <div className="flex flex-1 gap-6 overflow-hidden">
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col bg-card border rounded-lg shadow-sm overflow-hidden">
            <ScrollArea 
              className="flex-1 p-4 md:p-6 space-y-4" 
              ref={scrollAreaRef} // Keep this if used by ScrollArea itself
              viewportRef={viewportRef} // Pass the viewportRef here
            >
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex items-end space-x-2", msg.sender === 'user' ? 'justify-end' : '')}>
                  {msg.sender === 'ai' && <AIAvatar className="mb-3" />}
                  <div
                    className={cn(
                      "max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg shadow",
                      msg.sender === 'ai' ? 'bg-primary text-primary-foreground rounded-bl-none' : 'bg-muted text-foreground rounded-br-none'
                    )}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs opacity-70 mt-1 text-right">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {msg.sender === 'user' && <UserAvatar className="mb-3" />}
                </div>
              ))}
              {isAiTyping && (
                <div className="flex items-end space-x-2">
                  <AIAvatar className="mb-3" />
                  <div className="p-3 rounded-lg bg-primary text-primary-foreground shadow rounded-bl-none">
                    <p className="text-sm italic">AI is typing...</p>
                  </div>
                </div>
              )}
            </ScrollArea>

            {/* Suggested Prompts */}
            <div className="p-2 md:p-4 border-t">
              <ScrollArea className="whitespace-nowrap">
                 <div className="flex gap-2 pb-2">
                    {suggestedPrompts.map((prompt, index) => (
                    <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs h-auto py-1 px-2"
                        onClick={() => handlePromptClick(prompt)}
                    >
                        {prompt}
                    </Button>
                    ))}
                 </div>
              </ScrollArea>
            </div>

            {/* Message Input Area */}
            <form onSubmit={handleSubmit} className="p-4 border-t bg-background">
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything about your startup ideas..."
                  className="flex-1"
                  aria-label="Chat message input"
                />
                <Button type="submit" size="icon" aria-label="Send message">
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </div>

          {/* Right Sidebar (Desktop Only) */}
          <aside className="hidden md:block w-72 lg:w-80 flex-shrink-0">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Chat Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <section>
                  <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <MessageSquare className="h-4 w-4" /> Analyze New Idea
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Search className="h-4 w-4" /> View My Reports
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={() => console.log("Download chat history")}>
                      <Download className="h-4 w-4" /> Download Chat History
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={handleClearConversation}>
                      <Trash2 className="h-4 w-4" /> Clear Conversation
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={scrollToBottom}>
                      <ArrowDownCircle className="h-4 w-4" /> Scroll to Bottom
                    </Button>
                  </div>
                </section>
                <section>
                  <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Recent Topics</h3>
                  <div className="space-y-1 text-sm">
                    {/* Placeholder for recent topics */}
                    <p className="p-2 hover:bg-muted rounded-md cursor-pointer text-muted-foreground">Improving SaaS validation</p>
                    <p className="p-2 hover:bg-muted rounded-md cursor-pointer text-muted-foreground">B2B demand validation</p>
                    <p className="p-2 hover:bg-muted rounded-md cursor-pointer text-muted-foreground">Naming a startup</p>
                  </div>
                </section>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                       <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground">
                        <Settings2 className="h-4 w-4" /> Chat Settings
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Chat settings coming soon!</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIAssistantPage;
