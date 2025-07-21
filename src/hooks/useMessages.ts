
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

// Helper function to parse messages that contain both user and AI content
const parseMessageContent = (content: string, originalId: string, timestamp: Date): Message[] => {
  const messages: Message[] = [];
  
  // Split by USER: and AI: prefixes
  const parts = content.split(/(USER:|AI:)/);
  let currentSender: 'user' | 'ai' | null = null;
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    
    if (part === 'USER:') {
      currentSender = 'user';
    } else if (part === 'AI:') {
      currentSender = 'ai';
    } else if (part && currentSender) {
      messages.push({
        id: `${originalId}-${messages.length}`,
        text: part.trim(),
        sender: currentSender,
        timestamp: timestamp,
      });
    }
  }
  
  // If no prefixes found, treat as AI message (backward compatibility)
  if (messages.length === 0 && content.trim()) {
    messages.push({
      id: originalId,
      text: content.trim(),
      sender: 'ai',
      timestamp: timestamp,
    });
  }
  
  return messages;
};

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
        // Parse all historical messages to extract user and AI parts
        const allMessages: Message[] = [];
        
        history.forEach(item => {
          const parsedMessages = parseMessageContent(
            item.message, 
            item.id, 
            new Date(item.created_at)
          );
          allMessages.push(...parsedMessages);
        });
        
        console.log('useMessages: Parsed messages:', allMessages.length);
        setMessages(allMessages);
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

    // Optimistically add user message to the state
    const newUserMessage: Message = {
      id: messageId,
      text: messageContent,
      sender: 'user',
      timestamp: timestamp,
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      // Send message to n8n webhook and save to history
      const response = await sendMessageToN8n(messageContent, targetSessionId, messageId);

      if (!response) {
        throw new Error('Failed to send message to n8n');
      }

      // Add AI response to messages
      const aiMessage: Message = {
        id: `${messageId}-ai`,
        text: response,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);

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
