
import { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, initialMessages, formatTimestamp } from '@/constants/aiAssistant';
import { useN8nWebhook } from '@/hooks/useN8nWebhook';
import { useChatHistory } from '@/hooks/useChatHistory';

export const useMessages = (currentSessionId: string | null) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const { sendMessageToN8n, isConfigured } = useN8nWebhook();
  const { history, addMessage } = useChatHistory(currentSessionId);

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
    if (currentSessionId && history.length > 0) {
      // Convert history to messages format - now without prefixes
      const historyMessages: Message[] = history.map((item) => {
        // Parse message metadata if it exists
        let sender: 'user' | 'ai' = 'user';
        let text = item.message;
        
        // Check if message has metadata indicating sender
        if (item.message.startsWith('{"sender":')) {
          try {
            const parsed = JSON.parse(item.message);
            sender = parsed.sender;
            text = parsed.text;
          } catch {
            // Fallback to old prefix parsing
            if (text.startsWith('USER: ')) {
              sender = 'user';
              text = text.substring(6);
            } else if (text.startsWith('AI: ')) {
              sender = 'ai';
              text = text.substring(4);
            }
          }
        } else {
          // Fallback to old prefix parsing for backward compatibility
          if (text.startsWith('USER: ')) {
            sender = 'user';
            text = text.substring(6);
          } else if (text.startsWith('AI: ')) {
            sender = 'ai';
            text = text.substring(4);
          }
        }
        
        return {
          id: item.id,
          text: text,
          sender: sender,
          timestamp: new Date(item.created_at),
        };
      });
      
      setMessages([...initialMessages, ...historyMessages]);
    } else if (!currentSessionId) {
      setMessages(initialMessages);
    }
  }, [currentSessionId, history]);

  const handleSendMessage = async (text?: string, messageText?: string) => {
    const finalMessageText = text || messageText;
    if (!finalMessageText || finalMessageText.trim() === '') return;

    const newUserMessage: Message = {
      id: uuidv4(),
      text: finalMessageText,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newUserMessage]);

    // Save user message with new format (no prefixes)
    if (currentSessionId) {
      const messageData = {
        sender: 'user',
        text: finalMessageText,
        timestamp: new Date().toISOString()
      };
      await addMessage(JSON.stringify(messageData));
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
      const aiResponseText = await sendMessageToN8n(finalMessageText, currentSessionId);
      
      const aiResponse: Message = {
        id: uuidv4(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
      // Save AI response with new format (no prefixes)
      if (currentSessionId) {
        const messageData = {
          sender: 'ai',
          text: aiResponseText,
          timestamp: new Date().toISOString()
        };
        await addMessage(JSON.stringify(messageData));
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
    setMessages([initialMessages[0]]);
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

  return {
    messages,
    isTyping,
    viewportRef,
    handleSendMessage,
    handleClearConversation,
    handleDownloadChat,
    isConfigured
  };
};
