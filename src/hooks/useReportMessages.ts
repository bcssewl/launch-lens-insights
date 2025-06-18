
import { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, initialMessages, formatTimestamp } from '@/constants/aiAssistant';
import { useN8nWebhook } from '@/hooks/useN8nWebhook';
import { useChatHistory } from '@/hooks/useChatHistory';

interface ReportContext {
  reportId: string;
  ideaName: string;
  score: number;
  recommendation: string;
  reportData: any;
}

export const useReportMessages = (reportContext: ReportContext, sessionId: string | null) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const { sendMessageToN8n, isConfigured } = useN8nWebhook();
  const { history, addMessage } = useChatHistory(sessionId);

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
    if (sessionId && history.length > 0) {
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
      
      setMessages([...initialMessages, ...historyMessages]);
    } else if (!sessionId) {
      setMessages(initialMessages);
    }
  }, [sessionId, history]);

  // Create initial context message when report context is available
  useEffect(() => {
    if (reportContext && sessionId && history.length === 0) {
      const contextMessage = `I'm looking at my business idea validation report for "${reportContext.ideaName}". 
      The overall score is ${reportContext.score}/10. 
      The recommendation is: ${reportContext.recommendation}
      
      I'd like to discuss this report and ask questions about the analysis.`;
      
      // Don't wait for this, just send it as background context
      sendContextMessage(contextMessage);
    }
  }, [reportContext, sessionId, history.length]);

  const sendContextMessage = async (contextMessage: string) => {
    try {
      await sendMessageToN8n(contextMessage, sessionId);
    } catch (error) {
      console.error('Failed to send context message:', error);
    }
  };

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

    if (sessionId) {
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
      // Include report context in the message for better AI understanding
      const contextualMessage = `Report Context: Business idea "${reportContext.ideaName}" with score ${reportContext.score}/10.
      
      User Question: ${finalMessageText}`;
      
      const aiResponseText = await sendMessageToN8n(contextualMessage, sessionId);
      
      const aiResponse: Message = {
        id: uuidv4(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
      if (sessionId) {
        await addMessage(`AI: ${aiResponseText}`);
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
    a.download = `report-chat-${reportContext.ideaName}-${new Date().toISOString().split('T')[0]}.txt`;
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
