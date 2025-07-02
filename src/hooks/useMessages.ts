
import { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, initialMessages, formatTimestamp } from '@/constants/aiAssistant';
import { useN8nWebhook, DualResponse } from '@/hooks/useN8nWebhook';
import { useChatHistory } from '@/hooks/useChatHistory';
import { useAdvancedCanvas } from '@/hooks/useAdvancedCanvas';

export const useMessages = (currentSessionId: string | null) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const { sendMessageToN8n, isConfigured } = useN8nWebhook();
  const { history, addMessage } = useChatHistory(currentSessionId);
  const { canvasState, handleAIResponse, toggleCanvasMode, closeCanvas, openCanvas } = useAdvancedCanvas(currentSessionId);

  const scrollToBottom = () => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load messages from history when session changes
  useEffect(() => {
    console.log('useMessages: Session changed to:', currentSessionId);
    console.log('useMessages: History length:', history.length);
    
    setIsLoadingHistory(true);
    
    if (currentSessionId && history.length > 0) {
      console.log('useMessages: Loading history for session:', currentSessionId);
      const historyMessages: Message[] = history.map((item) => {
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
          timestamp: new Date(item.created_at),
        };
      });
      
      console.log('useMessages: Setting messages with history:', historyMessages.length, 'messages');
      setMessages([...initialMessages, ...historyMessages]);
    } else {
      console.log('useMessages: No session or empty history, showing initial messages only');
      setMessages([...initialMessages]);
    }
    
    setIsLoadingHistory(false);
  }, [currentSessionId, history]);

  const handleSendMessage = async (text?: string, messageText?: string) => {
    const finalMessageText = text || messageText;
    if (!finalMessageText || finalMessageText.trim() === '') return;

    console.log('useMessages: Sending message in session:', currentSessionId);

    const newUserMessage: Message = {
      id: uuidv4(),
      text: finalMessageText,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newUserMessage]);

    // Save user message to history
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
      const dualResponse: DualResponse = await sendMessageToN8n(finalMessageText, currentSessionId);
      
      // Use advanced canvas system to handle the response
      const canvasResult = await handleAIResponse(finalMessageText, dualResponse.response);
      
      const displayText = canvasResult.chatMessage || dualResponse.response;
      
      const aiResponse: Message = {
        id: uuidv4(),
        text: displayText,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
      // Save AI response to history
      if (currentSessionId) {
        await addMessage(`AI: ${displayText}`);
      }

      // Handle legacy report opening if no canvas was created
      if (dualResponse.report && !canvasResult.chatMessage) {
        console.log('Legacy report detected, using old canvas system');
        // This maintains backward compatibility
      }
    } catch (error) {
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
  };

  const handleClearConversation = () => {
    console.log('useMessages: Clearing conversation');
    setMessages([initialMessages[0]]);
    closeCanvas();
  };

  const handleDownloadChat = () => {
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
  };

  // Legacy canvas handlers for backward compatibility
  const handleOpenCanvas = (messageId: string, content: string) => {
    console.log('Legacy canvas open called, consider upgrading to advanced canvas');
  };

  const handleExpandCanvas = () => {
    toggleCanvasMode();
  };

  const handleCloseCanvas = () => {
    closeCanvas();
  };

  const handleCanvasDownload = () => {
    // This will be handled by the AdvancedCanvasView component
  };

  const handleCanvasPrint = () => {
    window.print();
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
    // Advanced canvas state
    advancedCanvasState: canvasState,
    handleToggleCanvasMode: toggleCanvasMode,
    handleCloseAdvancedCanvas: closeCanvas,
    handleOpenAdvancedCanvas: openCanvas,
    // Legacy canvas handlers for backward compatibility
    canvasState: {
      mode: 'closed',
      messageId: null,
      content: '',
    },
    handleOpenCanvas,
    handleExpandCanvas,
    handleCloseCanvas,
    handleCanvasDownload,
    handleCanvasPrint
  };
};
