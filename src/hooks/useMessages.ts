
import { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, initialMessages, formatTimestamp } from '@/constants/aiAssistant';
import { useN8nWebhook } from '@/hooks/useN8nWebhook';
import { useChatHistory } from '@/hooks/useChatHistory';
import { supabase } from '@/integrations/supabase/client';

export const useMessages = (currentSessionId: string | null) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [canvasState, setCanvasState] = useState<{
    isOpen: boolean;
    messageId: string | null;
    content: string;
  }>({
    isOpen: false,
    messageId: null,
    content: ''
  });
  const viewportRef = useRef<HTMLDivElement>(null);
  const { sendMessageToN8n, isConfigured } = useN8nWebhook();
  const { history, addMessage, isInitialLoad } = useChatHistory(currentSessionId);

  const scrollToBottom = useCallback(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Load messages from history when session changes - but wait for initial load to complete
  useEffect(() => {
    console.log('useMessages: Session/History changed - Session:', currentSessionId, 'History length:', history.length, 'Is initial load:', isInitialLoad);
    
    // Don't process until initial load is complete
    if (isInitialLoad) {
      console.log('useMessages: Still loading initial history, waiting...');
      return;
    }
    
    if (currentSessionId && history.length > 0) {
      console.log('useMessages: Loading history for session:', currentSessionId);
      // Convert history to messages format, parsing out USER: and AI: prefixes
      const historyMessages: Message[] = history.map((item) => {
        let text = item.message;
        let sender: 'user' | 'ai' = 'user';
        
        // Parse the message to determine sender and clean text
        if (text.startsWith('USER: ')) {
          sender = 'user';
          text = text.substring(6); // Remove "USER: " prefix
        } else if (text.startsWith('AI: ')) {
          sender = 'ai';
          text = text.substring(4); // Remove "AI: " prefix
        }
        
        return {
          id: item.id,
          text: text,
          sender: sender,
          timestamp: new Date(item.created_at),
        };
      });
      
      console.log('useMessages: Setting messages with history:', historyMessages.length, 'messages');
      setMessages([...initialMessages, ...historyMessages]);
    } else if (!currentSessionId || history.length === 0) {
      console.log('useMessages: No session or empty history, showing initial messages only');
      // Reset to initial messages for new sessions or when no session is selected
      setMessages([...initialMessages]);
    }
  }, [currentSessionId, history, isInitialLoad]);

  const handleSendMessage = useCallback(async (text?: string, messageText?: string, selectedModel?: string) => {
    const finalMessageText = text || messageText;
    if (!finalMessageText || finalMessageText.trim() === '') return;

    console.log('useMessages: Sending message in session:', currentSessionId, 'with model:', selectedModel);

    const newUserMessage: Message = {
      id: uuidv4(),
      text: finalMessageText,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newUserMessage]);

    // Save user message to history without prefix
    if (currentSessionId) {
      await addMessage(`USER: ${finalMessageText}`);
    }

    if (!isConfigured) {
      const fallbackResponse: Message = {
        id: uuidv4(),
        text: "The AI service is not configured properly. Please contact support for assistance.",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fallbackResponse]);
      return;
    }

    setIsTyping(true);
    
    try {
      let aiResponseText: string;

      // Route to Stratix if model is 'stratix'
      if (selectedModel === 'stratix') {
        aiResponseText = await handleStratixRequest(finalMessageText, currentSessionId);
      } else {
        // Use existing N8N webhook for all other models
        let contextMessage = finalMessageText;
        if (canvasState.isOpen && canvasState.content) {
          contextMessage = `Current document content:\n\n${canvasState.content}\n\n---\n\nUser message: ${finalMessageText}`;
        }
        
        aiResponseText = await sendMessageToN8n(contextMessage, currentSessionId);
      }
      
      const aiResponse: Message = {
        id: uuidv4(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
      // Save AI response to history without showing prefix to user
      if (currentSessionId) {
        await addMessage(`AI: ${aiResponseText}`);
      }
    } catch (error) {
      console.error('useMessages: Error sending message:', error);
      const errorResponse: Message = {
        id: uuidv4(),
        text: "I'm experiencing some technical difficulties right now. Please try sending your message again in a few moments.",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  }, [currentSessionId, addMessage, isConfigured, sendMessageToN8n, canvasState]);

  const handleStratixRequest = useCallback(async (prompt: string, sessionId: string | null): Promise<string> => {
    if (!sessionId) {
      throw new Error('Session ID required for Stratix research');
    }

    try {
      console.log('Initiating Stratix research request...');
      
      // Use supabase.functions.invoke to properly handle authentication
      const { data, error } = await supabase.functions.invoke('stratix-router', {
        body: {
          prompt,
          sessionId,
          deepDive: false // Could be made configurable
        }
      });

      if (error) {
        console.error('Stratix request error:', error);
        throw new Error(`Stratix request failed: ${error.message}`);
      }
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Handle different response types
      if (data.type === 'conversation') {
        // Simple conversational response - return directly
        return data.response;
      } else if (data.type === 'research') {
        // Research request - start streaming and return acknowledgment
        startStratixStream(data.projectId);
        return data.acknowledgment;
      }

      // Fallback
      return data.acknowledgment || "I'm processing your request...";

    } catch (error) {
      console.error('Stratix request error:', error);
      throw new Error(`Failed to process Stratix request: ${error.message}`);
    }
  }, []);

  const [stratixProgress, setStratixProgress] = useState<{
    projectId: string | null;
    status: string;
    events: Array<{ type: string; message: string; timestamp: Date; data?: any }>;
  }>({
    projectId: null,
    status: 'idle',
    events: []
  });

  const startStratixStream = useCallback((projectId: string) => {
    console.log('Starting Stratix stream for project:', projectId);
    
    // Initialize progress tracking
    setStratixProgress({
      projectId,
      status: 'connecting',
      events: [{ type: 'status', message: 'Connecting to research stream...', timestamp: new Date() }]
    });
    
    const eventSource = new EventSource(
      `${window.location.origin}/functions/v1/stratix-stream/${projectId}`
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Stratix stream event:', data);

        // Update progress with real-time events
        setStratixProgress(prev => ({
          ...prev,
          status: data.type,
          events: [...prev.events, {
            type: data.type,
            message: data.msg || data.message,
            timestamp: new Date(),
            data: data
          }]
        }));

        // Handle different event types
        if (data.type === 'thinking') {
          // Show thinking progress in UI
        } else if (data.type === 'search') {
          // Show search progress
        } else if (data.type === 'snippet') {
          // Show snippet as it arrives (Perplexity-style)
          const snippetMessage: Message = {
            id: uuidv4(),
            text: `📄 **Found:** ${data.snippet}\n\n*Source: ${data.source}* | *Confidence: ${Math.round((data.confidence || 0) * 100)}%*`,
            sender: 'ai',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, snippetMessage]);
        } else if (data.type === 'synthesis') {
          // Show synthesis progress
        } else if (data.type === 'done') {
          // Handle completion
          if (data.response) {
            const aiResponse: Message = {
              id: uuidv4(),
              text: data.response,
              sender: 'ai',
              timestamp: new Date(),
            };
            
            setMessages(prev => [...prev, aiResponse]);
            
            // Save final response to history
            if (currentSessionId) {
              addMessage(`AI: ${data.response}`);
            }
          } else if (data.results) {
            const synthesizedResponse = formatStratixResults(data.results);
            
            const aiResponse: Message = {
              id: uuidv4(),
              text: synthesizedResponse,
              sender: 'ai',
              timestamp: new Date(),
            };
            
            setMessages(prev => [...prev, aiResponse]);
            
            // Save final response to history
            if (currentSessionId) {
              addMessage(`AI: ${synthesizedResponse}`);
            }
          }
          
          setStratixProgress(prev => ({ ...prev, status: 'complete' }));
          eventSource.close();
        } else if (data.type === 'error') {
          console.error('Stratix stream error:', data.message);
          setStratixProgress(prev => ({ ...prev, status: 'error' }));
          
          const errorMessage: Message = {
            id: uuidv4(),
            text: `❌ Research encountered an issue: ${data.message}`,
            sender: 'ai',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, errorMessage]);
          
          eventSource.close();
        }
        
      } catch (error) {
        console.error('Error parsing Stratix stream data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Stratix stream connection error:', error);
      setStratixProgress(prev => ({ ...prev, status: 'error' }));
      eventSource.close();
    };

    // Clean up on component unmount
    return () => {
      eventSource.close();
    };
  }, [currentSessionId, addMessage]);

  const formatStratixResults = useCallback((results: any[]): string => {
    let formattedResponse = "# 📊 Stratix Research Report\n\n";
    
    for (const result of results) {
      const sectionTitle = result.section.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
      formattedResponse += `## ${sectionTitle}\n\n`;
      
      if (result.content.summary) {
        formattedResponse += `${result.content.summary}\n\n`;
      }
      
      if (result.content.data) {
        formattedResponse += "**Key Metrics:**\n";
        for (const [key, value] of Object.entries(result.content.data)) {
          formattedResponse += `- **${key}**: ${value}\n`;
        }
        formattedResponse += "\n";
      }
      
      if (result.content.insights && Array.isArray(result.content.insights)) {
        formattedResponse += "**Strategic Insights:**\n";
        for (const insight of result.content.insights) {
          formattedResponse += `- ${insight}\n`;
        }
        formattedResponse += "\n";
      }
      
      // Add confidence indicator
      const confidence = Math.round((result.confidence || 0) * 100);
      const confidenceIcon = confidence >= 85 ? '🟢' : confidence >= 70 ? '🟡' : '🔴';
      formattedResponse += `${confidenceIcon} *Data Confidence: ${confidence}%*\n\n`;
      
      if (result.provisional) {
        formattedResponse += "⚠️ *This data is provisional and may require additional verification.*\n\n";
      }
    }
    
    formattedResponse += "---\n\n*Research completed by Stratix Research Agent*\n";
    formattedResponse += "*Sources available upon request*";
    
    return formattedResponse;
  }, []);

  const handleClearConversation = useCallback(() => {
    console.log('useMessages: Clearing conversation');
    setMessages([initialMessages[0]]);
  }, []);

  const handleDownloadChat = useCallback(() => {
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
  }, [messages]);

  const handleOpenCanvas = useCallback((messageId: string, content: string) => {
    console.log('useMessages: Opening canvas for message:', messageId);
    setCanvasState({
      isOpen: true,
      messageId,
      content
    });
  }, []);

  const handleCloseCanvas = useCallback(() => {
    console.log('useMessages: Closing canvas');
    setCanvasState({
      isOpen: false,
      messageId: null,
      content: ''
    });
  }, []);

  const handleCanvasDownload = useCallback(() => {
    if (!canvasState.content) return;
    
    console.log('useMessages: Downloading canvas content');
    const blob = new Blob([canvasState.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [canvasState.content]);

  const handleCanvasPrint = useCallback(() => {
    console.log('useMessages: Printing canvas');
    window.print();
  }, []);

  const handleCanvasPdfDownload = useCallback(() => {
    console.log('useMessages: PDF download initiated');
    window.print();
  }, []);

  return {
    messages,
    isTyping,
    isLoadingHistory: isInitialLoad,
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
    stratixProgress
  };
};
