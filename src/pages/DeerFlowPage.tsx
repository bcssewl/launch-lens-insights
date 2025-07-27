import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Search, Clock, ExternalLink, Bookmark, Download } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ResearchItem {
  id: string;
  title: string;
  url: string;
  snippet: string;
  type: 'article' | 'study' | 'website';
  timestamp: Date;
}

const DeerFlowPage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m DeerFlow, your research assistant. I can help you gather comprehensive information on any topic. What would you like to research today?',
      timestamp: new Date()
    }
  ]);
  
  const [researchItems, setResearchItems] = useState<ResearchItem[]>([
    {
      id: '1',
      title: 'Will Ultra-Processed Foods Kill You? 5 Findings From a New Study',
      url: 'https://webmd.com/example',
      snippet: 'Recent studies on ultra-processed foods and health impacts...',
      type: 'study',
      timestamp: new Date()
    },
    {
      id: '2',
      title: 'Ultraprocessed foods: How scientists are studying their health impacts',
      url: 'https://example.com',
      snippet: 'Scientists are investigating the relationship between ultra-processed foods and various health conditions...',
      type: 'article',
      timestamp: new Date()
    },
    {
      id: '3',
      title: 'Inside the government study trying to understand the health effects',
      url: 'https://example.com',
      snippet: 'Government research initiatives exploring ultra-processed food consumption patterns...',
      type: 'study',
      timestamp: new Date()
    }
  ]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('Recent studies on ultra-processed foods and health 2024 2025');

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsProcessing(true);

    // Simulate research processing
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I\'m researching your query and gathering relevant information. Please check the research panel for real-time updates as I find sources.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
    }, 1500);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <DashboardLayout>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-surface p-4">
          <h1 className="text-2xl font-bold text-text-primary">DeerFlow Research</h1>
          <p className="text-text-secondary text-sm">AI-powered research assistant</p>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            
            {/* Chat Panel */}
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="h-full flex flex-col bg-surface">
                {/* Chat Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-start space-x-3 max-w-[80%] ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback className={msg.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'}>
                              {msg.type === 'user' ? 'U' : 'D'}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`rounded-lg p-3 ${msg.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-surface-elevated text-text-primary'}`}>
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-xs mt-1 ${msg.type === 'user' ? 'text-primary-foreground/70' : 'text-text-secondary'}`}>
                              {formatTime(msg.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isProcessing && (
                      <div className="flex justify-start">
                        <div className="flex items-start space-x-3 max-w-[80%]">
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback className="bg-accent text-accent-foreground">D</AvatarFallback>
                          </Avatar>
                          <div className="rounded-lg p-3 bg-surface-elevated">
                            <div className="flex items-center space-x-2">
                              <div className="animate-pulse flex space-x-1">
                                <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
                                <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                              <span className="text-sm text-text-secondary">Researching...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Chat Input */}
                <div className="border-t border-border p-4">
                  <div className="flex space-x-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ask a research question..."
                      className="flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      disabled={isProcessing}
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={!message.trim() || isProcessing}
                      size="icon"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Research Panel */}
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="h-full flex flex-col bg-surface-elevated">
                {/* Research Header */}
                <div className="border-b border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Search className="h-5 w-5 text-primary" />
                      <h2 className="text-lg font-semibold text-text-primary">Research Results</h2>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                  
                  {/* Current Query */}
                  <div className="bg-surface rounded-lg p-3 border border-border">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        <Search className="h-3 w-3 mr-1" />
                        Searching for
                      </Badge>
                    </div>
                    <p className="text-sm text-text-primary font-medium">{currentQuery}</p>
                  </div>
                </div>

                {/* Research Items */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {researchItems.map((item) => (
                      <Card key={item.id} className="border border-border hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge variant={item.type === 'study' ? 'default' : 'secondary'} className="text-xs">
                                {item.type}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatTime(item.timestamp)}
                              </Badge>
                            </div>
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Bookmark className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <CardTitle className="text-sm font-medium text-text-primary leading-5">
                            {item.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-text-secondary mb-3">{item.snippet}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-text-secondary truncate">{item.url}</p>
                            <Button variant="outline" size="sm" className="ml-2">
                              View Source
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Research Status */}
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <div className="animate-pulse flex space-x-1">
                          <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
                          <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                      <p className="text-sm text-text-secondary">Researching...</p>
                      <p className="text-xs text-text-secondary mt-1">DeerFlow is analyzing the web for relevant sources</p>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DeerFlowPage;