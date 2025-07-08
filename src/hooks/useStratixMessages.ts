import { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { initialMessages, formatTimestamp } from '@/constants/aiAssistant';
import { useN8nWebhook } from '@/hooks/useN8nWebhook';
import { useChatHistory } from '@/hooks/useChatHistory';
import { useStratixEventStream, StratixEvent } from '@/hooks/useStratixEventStream';
import { supabase } from '@/integrations/supabase/client';
import { StratixChatMessageData } from '@/components/assistant/StratixChatMessage';

export const useStratixMessages = (currentSessionId: string | null) => {
  const [messages, setMessages] = useState<StratixChatMessageData[]>(
    initialMessages.map(msg => ({ ...msg, timestamp: formatTimestamp(msg.timestamp) }))
  );
  const [isTyping, setIsTyping] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
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
  const { streamState, resetStream } = useStratixEventStream(activeProjectId);

  const scrollToBottom = useCallback(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Load messages from history when session changes
  useEffect(() => {
    console.log('useStratixMessages: Session/History changed - Session:', currentSessionId, 'History length:', history.length, 'Is initial load:', isInitialLoad);
    
    if (isInitialLoad) {
      console.log('useStratixMessages: Still loading initial history, waiting...');
      return;
    }
    
    if (currentSessionId && history.length > 0) {
      console.log('useStratixMessages: Loading history for session:', currentSessionId);
      const historyMessages: StratixChatMessageData[] = history.map((item) => {
        let text = item.message;
        let sender: 'user' | 'ai' = 'user';
        
        if (text.startsWith('USER: ')) {
          sender = 'user';
          text = text.substring(6);
        } else if (text.startsWith('AI: ')) {
          sender = 'ai';
          text = text.substring(4);
        }
        
        return {
          id: item.id,
          text: text,
          sender: sender,
          timestamp: formatTimestamp(new Date(item.created_at)),
        };
      });
      
      console.log('useStratixMessages: Setting messages with history:', historyMessages.length, 'messages');
      setMessages([
        ...initialMessages.map(msg => ({ ...msg, timestamp: formatTimestamp(msg.timestamp) })),
        ...historyMessages
      ]);
    } else if (!currentSessionId || history.length === 0) {
      console.log('useStratixMessages: No session or empty history, showing initial messages only');
      setMessages(initialMessages.map(msg => ({ ...msg, timestamp: formatTimestamp(msg.timestamp) })));
    }
  }, [currentSessionId, history, isInitialLoad]);

  // Update messages with Stratix progress
  useEffect(() => {
    if (activeProjectId && streamState.events.length > 0) {
      setMessages(prev => {
        return prev.map(msg => {
          // Find the AI message that initiated Stratix research
          if (msg.sender === 'ai' && msg.text.includes('Starting research') && !msg.stratixProgress) {
            return {
              ...msg,
              stratixProgress: {
                status: streamState.status,
                events: streamState.events,
                isActive: !['done', 'error'].includes(streamState.status)
              }
            };
          }
          // Update existing progress
          if (msg.stratixProgress && msg.stratixProgress.isActive) {
            return {
              ...msg,
              stratixProgress: {
                status: streamState.status,
                events: streamState.events,
                isActive: !['done', 'error'].includes(streamState.status)
              }
            };
          }
          return msg;
        });
      });

      // If research is done, add the final result
      if (streamState.status === 'done') {
        const doneEvent = streamState.events.find(e => e.type === 'done');
        if (doneEvent && doneEvent.data?.response) {
          const finalResponse: StratixChatMessageData = {
            id: uuidv4(),
            text: doneEvent.data.response,
            sender: 'ai',
            timestamp: formatTimestamp(new Date()),
          };
          
          setMessages(prev => [...prev, finalResponse]);
          
          // Save final response to history
          if (currentSessionId) {
            addMessage(`AI: ${doneEvent.data.response}`);
          }
          
          // Clear active project
          setActiveProjectId(null);
        }
      }
    }
  }, [activeProjectId, streamState, currentSessionId, addMessage]);

  const handleSendMessage = useCallback(async (text?: string, messageText?: string, selectedModel?: string) => {
    const finalMessageText = text || messageText;
    if (!finalMessageText || finalMessageText.trim() === '') return;

    console.log('useStratixMessages: Sending message in session:', currentSessionId, 'with model:', selectedModel);

    const newUserMessage: StratixChatMessageData = {
      id: uuidv4(),
      text: finalMessageText,
      sender: 'user',
      timestamp: formatTimestamp(new Date()),
    };
    
    setMessages(prev => [...prev, newUserMessage]);

    // Save user message to history
    if (currentSessionId) {
      await addMessage(`USER: ${finalMessageText}`);
    }

    if (!isConfigured) {
      const fallbackResponse: StratixChatMessageData = {
        id: uuidv4(),
        text: "The AI service is not configured properly. Please contact support for assistance.",
        sender: 'ai',
        timestamp: formatTimestamp(new Date()),
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
      
      const aiResponse: StratixChatMessageData = {
        id: uuidv4(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: formatTimestamp(new Date()),
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
      // Save AI response to history
      if (currentSessionId) {
        await addMessage(`AI: ${aiResponseText}`);
      }
    } catch (error) {
      console.error('useStratixMessages: Error sending message:', error);
      const errorResponse: StratixChatMessageData = {
        id: uuidv4(),
        text: "I'm experiencing some technical difficulties right now. Please try sending your message again in a few moments.",
        sender: 'ai',
        timestamp: formatTimestamp(new Date()),
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
      
      const { data, error } = await supabase.functions.invoke('stratix-router', {
        body: {
          prompt,
          sessionId,
          deepDive: false
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
        // Research request - set up SSE streaming
        setActiveProjectId(data.projectId);
        resetStream(); // Reset any previous stream state
        return data.acknowledgment;
      }

      // Fallback
      return data.acknowledgment || "I'm processing your request...";

    } catch (error) {
      console.error('Stratix request error:', error);
      throw new Error(`Failed to process Stratix request: ${error.message}`);
    }
  }, [resetStream]);

  const handleClearConversation = useCallback(() => {
    console.log('useStratixMessages: Clearing conversation');
    setMessages(initialMessages.map(msg => ({ ...msg, timestamp: formatTimestamp(msg.timestamp) })));
    setActiveProjectId(null);
    resetStream();
  }, [resetStream]);

  const handleDownloadChat = useCallback(() => {
    const chatContent = messages.map(msg => 
      `[${msg.timestamp}] ${msg.sender.toUpperCase()}: ${msg.text}`
    ).join('\n\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stratix-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [messages]);

  const handleOpenCanvas = useCallback((messageId: string, content: string) => {
    console.log('useStratixMessages: Opening canvas for message:', messageId);
    setCanvasState({
      isOpen: true,
      messageId,
      content
    });
  }, []);

  const handleCloseCanvas = useCallback(() => {
    console.log('useStratixMessages: Closing canvas');
    setCanvasState({
      isOpen: false,
      messageId: null,
      content: ''
    });
  }, []);

  const handleCanvasDownload = useCallback(() => {
    if (!canvasState.content) return;
    
    console.log('useStratixMessages: Downloading canvas content');
    const blob = new Blob([canvasState.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stratix-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [canvasState.content]);

  const handleCanvasPrint = useCallback(() => {
    console.log('useStratixMessages: Printing canvas');
    window.print();
  }, []);

  const handleCanvasPdfDownload = useCallback(() => {
    console.log('useStratixMessages: PDF download initiated');
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
    stratixProgress: {
      projectId: activeProjectId,
      status: streamState.status,
      events: streamState.events,
      isConnected: streamState.isConnected,
      connectionError: streamState.connectionError
    }
  };
};