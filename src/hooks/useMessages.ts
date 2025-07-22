import { useState, useRef, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useCanvas } from '@/hooks/useCanvas';
import { useStratixStreaming } from '@/hooks/useStratixStreaming';
import { useAlegeonStreaming } from '@/hooks/useAlegeonStreaming';
import { useAlegeonStreamingV2 } from '@/hooks/useAlegeonStreamingV2';
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from '@/hooks/use-mobile';
import { Message } from '@/types/message';

export const useMessages = (sessionId: string | null, updateSessionTitle: (sessionId: string, newTitle: string) => Promise<void>, sessionTitle?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const {
    canvasState,
    handleOpenCanvas,
    handleCloseCanvas,
    handleCanvasDownload,
    handleCanvasPrint,
    handleCanvasPdfDownload,
    updateCanvasContent
  } = useCanvas();
  
  const { streamingState, startStreaming, stopStreaming } = useStratixStreaming();
  const { streamingState: alegeonStreamingState, startStreaming: startAlegeon, stopStreaming: stopAlegeon } = useAlegeonStreaming(null);
  const { streamingState: alegeonStreamingStateV2, startStreaming: startAlegeonV2, fastForward } = useAlegeonStreamingV2(sessionId);

  useEffect(() => {
    const loadChatHistory = async () => {
      if (!sessionId) {
        setIsLoadingHistory(false);
        return;
      }

      try {
        const response = await fetch(`/api/chat/history?sessionId=${sessionId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const history = await response.json();

        // Map history data to the Message interface
        const formattedMessages = history.map((msg: any) => ({
          id: msg.id,
          sender: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
          timestamp: msg.timestamp,
          sources: msg.sources || [],
        }));

        setMessages(formattedMessages);
      } catch (error) {
        console.error('Failed to load chat history:', error);
        toast({
          variant: "destructive",
          title: "Failed to load chat history.",
          description: "Please refresh the page or try again later.",
        })
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, [sessionId, toast]);

  useEffect(() => {
    const checkConfig = async () => {
      try {
        const response = await fetch('/api/config/check');
        const data = await response.json();
        setIsConfigured(data.isConfigured);
      } catch (error) {
        console.error("Error checking configuration:", error);
        setIsConfigured(false);
      }
    };

    checkConfig();
  }, []);

  const scrollToBottom = useCallback(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const handleSendMessage = async (
    text: string, 
    attachments?: any[], 
    modelOverride?: string, 
    researchTypeOverride?: string,
    sessionIdOverride?: string
  ) => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    const messageId = uuidv4();
    const currentTime = new Date().toISOString();
    const currentSessionId = sessionIdOverride || sessionId;
    const modelToUse = modelOverride || 'gpt-4o-mini';
    const researchTypeToUse = researchTypeOverride || 'quick_facts';

    // Optimistically update the UI with the user's message
    const userMessage: Message = {
      id: messageId,
      sender: 'user',
      content: trimmedText,
      timestamp: currentTime,
      sources: []
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    scrollToBottom();

    // Immediately add a loading message for the assistant
    const assistantLoadingMessage: Message = {
      id: uuidv4(),
      sender: 'assistant',
      content: 'Thinking...',
      timestamp: new Date().toISOString(),
      isLoading: true,
      sources: []
    };

    setMessages(prevMessages => [...prevMessages, assistantLoadingMessage]);
    setIsTyping(true);
    scrollToBottom();

    try {
      // For Algeon model requests
      if (modelToUse === 'algeon') {
        console.log('🎯 Algeon Request - Research Type:', researchTypeToUse);
        
        // Pass the research type directly to backend - including "best" for smart routing
        const alegeonResponse = await fetch('https://ai-agent-research-optivise-production.up.railway.app/research', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: trimmedText,
            research_type: researchTypeToUse, // Send exactly what user selected, including "best"
            context: {
              sessionId: currentSessionId,
              previousMessages: messages.slice(-5).map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.content
              }))
            }
          }),
        });

        if (!alegeonResponse.ok) {
          throw new Error(`Algeon API error: ${alegeonResponse.status}`);
        }

        const alegeonData = await alegeonResponse.json();
        
        // Update the assistant's loading message with the actual response
        setMessages(prevMessages => {
          const updatedMessages = prevMessages.map(msg => {
            if (msg.isLoading) {
              return {
                ...msg,
                content: alegeonData.response,
                isLoading: false,
                sources: alegeonData.sources || []
              };
            }
            return msg;
          });
          return updatedMessages;
        });

        setIsTyping(false);
        scrollToBottom();
        
        // Update session title if it's the first message
        if (messages.length === 1 && currentSessionId) {
          const newTitle = alegeonData.response.substring(0, 40);
          await updateSessionTitle(currentSessionId, newTitle);
        }
        
        return;
      }

      // For Stratix model requests - Perplexity-style streaming
      if (modelToUse === 'stratix') {
        console.log('🎯 Stratix Request - Smart routing');
        
        // Remove the loading message immediately
        setMessages(prevMessages => prevMessages.filter(msg => !msg.isLoading));
        setIsTyping(false);
        
        const result = await startStreaming(trimmedText, currentSessionId || '');
        
        // Add the streamed result as a message
        setMessages(prevMessages => [...prevMessages, {
          id: uuidv4(),
          sender: 'assistant',
          content: result,
          timestamp: new Date().toISOString(),
          sources: []
        }]);
        scrollToBottom();
        
        // Update session title if it's the first message
        if (messages.length === 1 && currentSessionId) {
          const newTitle = result.substring(0, 40);
          await updateSessionTitle(currentSessionId, newTitle);
        }
        
        return;
      }

      // For other models, use the existing N8N webhook
      console.log('⚡️ Using instant response');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmedText,
          model: modelToUse,
          sessionId: currentSessionId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Update the assistant's loading message with the actual response
      setMessages(prevMessages => {
        const updatedMessages = prevMessages.map(msg => {
          if (msg.isLoading) {
            return {
              ...msg,
              content: data.response,
              isLoading: false,
              sources: []
            };
          }
          return msg;
        });
        return updatedMessages;
      });

      setIsTyping(false);
      scrollToBottom();
      
      // Update session title if it's the first message
      if (messages.length === 1 && currentSessionId) {
        const newTitle = data.response.substring(0, 40);
        await updateSessionTitle(currentSessionId, newTitle);
      }
      
    } catch (error: any) {
      console.error("Failed to send message:", error);
      
      // Update the assistant's message to show the error
      setMessages(prevMessages => {
        const updatedMessages = prevMessages.map(msg => {
          if (msg.isLoading) {
            return {
              ...msg,
              content: `Error: ${error.message || 'Failed to get response'}`,
              isLoading: false,
              isError: true
            };
          }
          return msg;
        });
        return updatedMessages;
      });
      setIsTyping(false);
      
      toast({
        variant: "destructive",
        title: "Failed to send message.",
        description: "Please check your internet connection or try again later.",
      })
    }
  };

  const handleClearConversation = () => {
    setMessages([]);
  };

  const handleDownloadChat = () => {
    const chatContent = messages.map(msg => {
      const sender = msg.sender === 'user' ? 'You' : 'Assistant';
      return `${sender}: ${msg.content}\n`;
    }).join('');

    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat_history.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
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
    stratixStreamingState: streamingState,
    alegeonStreamingState: alegeonStreamingStateV2,
    fastForward
  };
};
