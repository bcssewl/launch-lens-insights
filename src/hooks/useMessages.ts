
import { useState, useEffect, useRef, useCallback } from 'react';
import { Message } from '@/constants/aiAssistant';
import { useChatHistory } from '@/hooks/useChatHistory';
import { useGreeting } from '@/hooks/useGreeting';
import { useAutoTitle } from '@/hooks/useAutoTitle';
import { useN8nWebhook } from '@/hooks/useN8nWebhook';
import { useCanvasDocument } from '@/hooks/useCanvasDocument';
import { v4 as uuidv4 } from 'uuid';
import type { StratixStreamingState } from '@/types/stratixStreaming';
import type { AlegeonStreamingStateV2 } from '@/hooks/useAlegeonStreamingV2';

export const useMessages = (sessionId: string | null, updateSessionTitle?: (sessionId: string, title: string) => void, currentTitle?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [canvasState, setCanvasState] = useState({
    isOpen: false,
    messageId: null as string | null,
    content: ''
  });
  
  const viewportRef = useRef<HTMLDivElement>(null);
  const { primaryGreeting, assistanceMessage } = useGreeting();
  const { history, loading: isLoadingHistory, addMessageToSession } = useChatHistory(sessionId);
  const { generateAndSetTitle } = useAutoTitle();
  const { sendMessageToN8n, isConfigured } = useN8nWebhook();
  const { createDocument, updateDocument } = useCanvasDocument();

  // Combine greeting parts into a single greeting message
  const greeting = `${primaryGreeting}. ${assistanceMessage}`;

  // Load messages from history when session changes
  useEffect(() => {
    console.log('useMessages: Session changed to:', sessionId);
    console.log('useMessages: History loading:', isLoadingHistory);
    console.log('useMessages: History length:', history.length);
    
    if (sessionId && !isLoadingHistory) {
      if (history.length > 0) {
        console.log('useMessages: Loading messages from history');
        // Convert history to messages format
        const historyMessages: Message[] = history.map(item => ({
          id: item.id,
          text: item.message,
          sender: 'ai', // Assuming history messages are from AI
          timestamp: new Date(item.created_at),
        }));
        setMessages(historyMessages);
      } else {
        console.log('useMessages: No history found, showing greeting');
        // Show greeting for empty sessions
        setMessages([{
          id: 'initial',
          text: greeting,
          sender: 'ai',
          timestamp: new Date(),
        }]);
      }
    } else if (!sessionId) {
      console.log('useMessages: No session, showing greeting');
      // No session - show greeting
      setMessages([{
        id: 'initial',
        text: greeting,
        sender: 'ai',
        timestamp: new Date(),
      }]);
    }
  }, [sessionId, history, isLoadingHistory, greeting]);

  const handleSendMessage = async (messageContent: string, attachments?: any[], selectedModel?: string, researchType?: string, sessionOverride?: string) => {
    setIsTyping(true);
    const messageId = uuidv4();
    const timestamp = new Date();
    const targetSessionId = sessionOverride || sessionId;

    // Optimistically add message to the state
    const newMessage: Message = {
      id: messageId,
      text: messageContent,
      sender: 'user',
      timestamp: timestamp,
    };
    setMessages(prev => [...prev, newMessage]);

    try {
      // Send message to n8n webhook and save to history
      const response = await sendMessageToN8n(messageContent, targetSessionId, messageId);

      if (!response) {
        throw new Error('Failed to send message to n8n');
      }

      // Generate title if this is the first real message in the session
      if (messages.length <= 1 && targetSessionId && updateSessionTitle) {
        // Use the new generateAndSetTitle function
        await generateAndSetTitle(
          targetSessionId, 
          messageContent, 
          response,
          async (sessionId: string, title: string) => {
            updateSessionTitle(sessionId, title);
          }
        );
      }
    } catch (error) {
      console.error('useMessages: Error sending message:', error);
      // Revert optimistic update on error
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearConversation = () => {
    setMessages([]);
  };

  const handleDownloadChat = () => {
    const chatContent = messages.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat_history.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenCanvas = (messageId: string, content: string) => {
    setCanvasState({
      isOpen: true,
      messageId: messageId,
      content: content,
    });
  };

  const handleCloseCanvas = () => {
    setCanvasState({
      isOpen: false,
      messageId: null,
      content: '',
    });
  };

  const handleCanvasDownload = async () => {
    if (!canvasState.messageId) return;

    try {
      await createDocument(canvasState.messageId, canvasState.content);
    } catch (error) {
      console.error("Error creating document:", error);
    }
  };

  const handleCanvasPrint = () => {
    window.print();
  };

  const handleCanvasPdfDownload = async () => {
    if (!canvasState.messageId) return;

    try {
      // Update document with proper parameters
      await updateDocument(canvasState.messageId, {
        content: canvasState.content,
        title: 'AI Report'
      });
    } catch (error) {
      console.error("Error updating document:", error);
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
    handleCanvasPdfDownload,
    streamingState: null, // Placeholder for streaming state
    stratixStreamingState: null, // Placeholder for stratix streaming
  };
};
