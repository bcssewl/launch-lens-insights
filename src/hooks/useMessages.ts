
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/constants/aiAssistant';
import { v4 as uuidv4 } from 'uuid';

interface CanvasState {
  isOpen: boolean;
  messageId: string | null;
  content: string;
}

export const useMessages = (sessionId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isConfigured, setIsConfigured] = useState(true);
  const [canvasState, setCanvasState] = useState<CanvasState>({
    isOpen: false,
    messageId: null,
    content: ''
  });
  const viewportRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Load message history when session changes
  useEffect(() => {
    if (sessionId) {
      loadMessageHistory();
    } else {
      // Clear messages when no session
      setMessages([]);
    }
  }, [sessionId]);

  const loadMessageHistory = async () => {
    if (!sessionId) return;

    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('n8n_chat_history')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading message history:', error);
        return;
      }

      if (data && data.length > 0) {
        const formattedMessages: Message[] = [];
        
        for (let i = 0; i < data.length; i += 2) {
          const userMsg = data[i];
          const aiMsg = data[i + 1];

          // Add user message
          if (userMsg) {
            formattedMessages.push({
              id: userMsg.id,
              text: userMsg.message,
              sender: 'user' as const,
              timestamp: new Date(userMsg.created_at)
            });
          }

          // Add AI message if it exists
          if (aiMsg) {
            formattedMessages.push({
              id: aiMsg.id,
              text: aiMsg.message,
              sender: 'ai' as const,
              timestamp: new Date(aiMsg.created_at)
            });
          }
        }

        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error in loadMessageHistory:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const scrollToBottom = useCallback(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const handleSendMessage = async (text: string, attachments?: any[], selectedModel?: string) => {
    if (!sessionId || !user) {
      console.error('No session ID or user available');
      return;
    }

    try {
      const userMessageId = uuidv4();
      const userMessage: Message = {
        id: userMessageId,
        text,
        sender: 'user' as const,
        timestamp: new Date(),
        attachments
      };

      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);

      // Check if Stratix model is selected
      if (selectedModel === 'stratix') {
        console.log('Routing to Stratix Research Agent');
        await handleStratixResearch(text, userMessageId);
      } else {
        // Regular N8N webhook for other models
        await handleRegularChat(text, userMessageId, attachments);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
    }
  };

  const handleStratixResearch = async (query: string, userMessageId: string) => {
    try {
      console.log('Calling Stratix Research Agent with query:', query);

      const { data, error } = await supabase.functions.invoke('stratix-research-agent', {
        body: {
          query: query,
          sessionId: sessionId,
          userId: user?.id
        }
      });

      if (error) {
        throw error;
      }

      console.log('Stratix Research Agent response:', data);

      const aiMessage: Message = {
        id: uuidv4(),
        text: data.report || 'Research completed successfully.',
        sender: 'ai' as const,
        timestamp: new Date(),
        metadata: {
          type: 'research_report',
          domain: data.domain,
          confidence: data.confidence,
          projectId: data.projectId
        }
      };

      setMessages(prev => [...prev, aiMessage]);

      // Store messages in chat history
      await Promise.all([
        supabase.from('n8n_chat_history').insert({
          session_id: sessionId,
          message: query,
          search_body: query
        }),
        supabase.from('n8n_chat_history').insert({
          session_id: sessionId,
          message: aiMessage.text,
          search_body: aiMessage.text
        })
      ]);

    } catch (error) {
      console.error('Stratix Research Agent error:', error);
      
      const errorMessage: Message = {
        id: uuidv4(),
        text: 'Sorry, I encountered an error while conducting the research. Please try again.',
        sender: 'ai' as const,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRegularChat = async (text: string, userMessageId: string, attachments?: any[]) => {
    try {
      const webhookUrl = 'https://n8n-webhook-url.com/webhook';
      
      const payload = {
        message: text,
        sessionId: sessionId,
        userId: user?.id,
        attachments: attachments || []
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: uuidv4(),
        text: data.response || 'I received your message.',
        sender: 'ai' as const,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Store messages in chat history
      await Promise.all([
        supabase.from('n8n_chat_history').insert({
          session_id: sessionId,
          message: text,
          search_body: text
        }),
        supabase.from('n8n_chat_history').insert({
          session_id: sessionId,
          message: aiMessage.text,
          search_body: aiMessage.text
        })
      ]);

    } catch (error) {
      console.error('Regular chat error:', error);
      
      const errorMessage: Message = {
        id: uuidv4(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai' as const,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearConversation = () => {
    setMessages([]);
  };

  const handleDownloadChat = () => {
    const chatContent = messages.map(msg => 
      `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.text}`
    ).join('\n\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${sessionId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenCanvas = (messageId: string, content: string) => {
    setCanvasState({
      isOpen: true,
      messageId,
      content
    });
  };

  const handleCloseCanvas = () => {
    setCanvasState({
      isOpen: false,
      messageId: null,
      content: ''
    });
  };

  const handleCanvasDownload = () => {
    if (!canvasState.content) return;
    
    const blob = new Blob([canvasState.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'canvas-content.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCanvasPrint = () => {
    window.print();
  };

  const handleCanvasPdfDownload = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-canvas-pdf', {
        body: { content: canvasState.content }
      });

      if (error) throw error;

      // Handle PDF download
      console.log('PDF generated:', data);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
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
    handleCanvasPdfDownload
  };
};
