import { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, initialMessages, formatTimestamp } from '@/constants/aiAssistant';
import { useN8nWebhook } from '@/hooks/useN8nWebhook';
import { useChatHistory } from '@/hooks/useChatHistory';
import { usePerplexityStreaming } from '@/hooks/usePerplexityStreaming';
import { useAlegeonStreamingV2 } from '@/hooks/useAlegeonStreamingV2';
import { supabase } from '@/integrations/supabase/client';
import { type AlgeonResearchType } from '@/utils/algeonResearchTypes';

interface StreamingMessage extends Message {
  isStreaming?: boolean;
  streamingData?: {
    phase: string;
    progress: number;
    sources: Array<{
      name: string;
      url: string;
      type: string;
      confidence: number;
    }>;
    searchQueries: string[];
  };
}

export const useMessages = (currentSessionId: string | null, updateSessionTitle?: (id: string, title: string) => void, currentTitle?: string) => {
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
  
  // Initialize Perplexity-style streaming
  const { streamingState, startStreaming, stopStreaming } = usePerplexityStreaming();
  
  // Initialize Algeon V2 streaming
  const { 
    streamingState: alegeonStreamingState, 
    startStreaming: startAlegeonStreaming, 
    stopStreaming: stopAlegeonStreaming 
  } = useAlegeonStreamingV2();

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
    console.log('useMessages: Session/History changed - Session:', currentSessionId, 'History length:', history.length, 'Is initial load:', isInitialLoad);
    
    if (!isInitialLoad && history.length > 0) {
      console.log('Converting history to messages:', history.slice(0, 3));
      const convertedMessages = history.map((entry, index) => {
        const messageText = entry.message || '';
        const lines = messageText.split('\n');
        const isUser = lines[0].startsWith('USER:');
        const text = isUser ? lines[0].substring(5).trim() : lines.slice(1).join('\n').trim();
        
        return {
          id: `history-${index}`,
          text,
          sender: (isUser ? 'user' : 'ai') as 'user' | 'ai',
          timestamp: new Date(Date.now() - (history.length - index) * 1000),
        };
      });
      
      setMessages([...initialMessages, ...convertedMessages]);
      console.log('Loaded messages from history:', convertedMessages.length);
    } else if (!isInitialLoad && history.length === 0) {
      console.log('No history found, using initial messages');
      setMessages(initialMessages);
    }
  }, [currentSessionId, history, isInitialLoad]);

  // Smart detection logic for when to use different AI models
  const detectModelAndResearchType = useCallback((prompt: string): { model: string; researchType: AlgeonResearchType } => {
    const trimmedPrompt = prompt.trim().toLowerCase();
    
    // Simple conversations - use regular model
    const simplePatterns = [
      /^(hello|hi|hey|good morning|good afternoon)[\s\?\.!]*$/,
      /^(how are you|how\'s it going|what\'s up)[\s\?\.!]*$/,
      /^(thanks|thank you|thx|ty)[\s\?\.!]*$/,
      /^(ok|okay|alright|good|great|cool)[\s\?\.!]*$/,
      /^(who are you|what are you|what can you do)[\s\?\.!]*$/,
      /^(bye|goodbye|see you|talk later)[\s\?\.!]*$/
    ];
    
    if (simplePatterns.some(pattern => pattern.test(trimmedPrompt))) {
      return { model: 'regular', researchType: 'quick_facts' };
    }
    
    // Research type detection based on keywords
    if (trimmedPrompt.includes('market size') || trimmedPrompt.includes('market sizing')) {
      return { model: 'algeon', researchType: 'market_sizing' };
    }
    if (trimmedPrompt.includes('competitor') || trimmedPrompt.includes('competitive')) {
      return { model: 'algeon', researchType: 'competitive_analysis' };
    }
    if (trimmedPrompt.includes('regulation') || trimmedPrompt.includes('regulatory') || trimmedPrompt.includes('compliance')) {
      return { model: 'algeon', researchType: 'regulatory_scan' };
    }
    if (trimmedPrompt.includes('trend') || trimmedPrompt.includes('trends')) {
      return { model: 'algeon', researchType: 'trend_analysis' };
    }
    if (trimmedPrompt.includes('legal') || trimmedPrompt.includes('law')) {
      return { model: 'algeon', researchType: 'legal_analysis' };
    }
    if (trimmedPrompt.includes('deep') || trimmedPrompt.includes('comprehensive') || trimmedPrompt.includes('detailed')) {
      return { model: 'algeon', researchType: 'deep_analysis' };
    }
    if (trimmedPrompt.includes('industry report') || trimmedPrompt.includes('industry analysis')) {
      return { model: 'algeon', researchType: 'industry_reports' };
    }
    
    // Default research queries
    const researchKeywords = [
      'analyze', 'research', 'strategy', 'insights', 'report', 'study',
      'comparison', 'evaluation', 'assessment', 'forecast', 'outlook',
      'landscape', 'ecosystem', 'opportunities', 'growth'
    ];
    
    const hasResearchKeywords = researchKeywords.some(keyword => 
      trimmedPrompt.includes(keyword)
    );
    
    // Complex query indicators
    const isLongQuery = prompt.length > 30;
    const hasQuestionWords = /\b(what|how|why|when|where|which|should|could|would)\b/i.test(prompt);
    
    if (hasResearchKeywords || (isLongQuery && hasQuestionWords)) {
      return { model: 'algeon', researchType: 'quick_facts' };
    }
    
    return { model: 'regular', researchType: 'quick_facts' };
  }, []);

  // Handle instant responses for simple queries
  const handleInstantRequest = useCallback(async (prompt: string): Promise<string> => {
    try {
      console.log('⚡ Making instant request to Stratix API');
      
      const response = await fetch('https://ai-agent-research-optivise-production.up.railway.app/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          sessionId: currentSessionId || 'instant-session'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || data.message || 'Response received successfully.';
      
    } catch (error) {
      console.error('❌ Instant request failed:', error);
      return `I apologize, but I'm currently unable to process your request. Please try again later.`;
    }
  }, [currentSessionId]);

  const handleSendMessage = useCallback(async (
    text?: string, 
    messageText?: string, 
    selectedModel?: string, 
    selectedResearchType?: string,
    sessionIdOverride?: string
  ) => {
    const finalMessageText = text || messageText;
    if (!finalMessageText || finalMessageText.trim() === '') return;

    const sessionId = sessionIdOverride || currentSessionId;
    console.log('🚀 useMessages: Sending message in session:', sessionId, 'with model:', selectedModel);

    const userMessageId = uuidv4();
    const newUserMessage: Message = {
      id: userMessageId,
      text: finalMessageText,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newUserMessage]);

    // Save user message to history
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
      let aiResponseText: string;

      // Auto-detect model and research type if not specified
      const detectedSettings = detectModelAndResearchType(finalMessageText);
      const modelToUse = selectedModel === 'algeon' ? 'algeon' : 
                        selectedModel === 'stratix' ? 'stratix' : 
                        detectedSettings.model;
      const researchTypeToUse = selectedResearchType || detectedSettings.researchType;

      // System cleanup of previous streaming sessions before starting new one
      console.log('🧹 Cleaning up previous streaming sessions before new request');
      stopStreaming();
      stopAlegeonStreaming(false); // false = system cleanup, not user-initiated

      if (modelToUse === 'algeon') {
        console.log('🧠 Using Algeon model with research type:', researchTypeToUse);
        try {
          aiResponseText = await startAlegeonStreaming(finalMessageText, userMessageId, researchTypeToUse);
        } catch (error) {
          console.log('⚠️ Algeon streaming cleanup or error, using fallback');
          // Check if this is just a cleanup error (not a real failure)
          if (error.message === 'Streaming stopped by user.' || 
              error.message.includes('cleanup')) {
            console.log('🔄 Detected cleanup, using instant request as fallback');
            aiResponseText = await handleInstantRequest(finalMessageText);
          } else {
            throw error; // Re-throw actual errors
          }
        }
      } else if (modelToUse === 'stratix') {
        console.log('🎯 Using Stratix model with Perplexity-style streaming');
        aiResponseText = await startStreaming(finalMessageText, sessionId || 'temp-session');
      } else {
        // Use existing N8N webhook for regular model
        let contextMessage = finalMessageText;
        if (canvasState.isOpen && canvasState.content) {
          contextMessage = `Current document content:\n\n${canvasState.content}\n\n---\n\nUser message: ${finalMessageText}`;
        }
        
        aiResponseText = await sendMessageToN8n(contextMessage, sessionId);
      }
      
      const aiResponse: Message = {
        id: uuidv4(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date(),
        metadata: {
          messageType: modelToUse === 'algeon' ? 'algeon_research' : 
                      modelToUse === 'stratix' ? 'stratix_conversation' : 
                      'standard',
          researchType: modelToUse === 'algeon' ? researchTypeToUse : undefined
        },
      };
      
      setMessages(prev => [...prev, aiResponse]);

      // Save AI response to history
      if (sessionId) {
        await addMessage(`AI: ${aiResponseText}`);
      }

      // Auto-generate title if this is the first meaningful exchange
      if (updateSessionTitle && sessionId && (!currentTitle || currentTitle === 'New Chat')) {
        const messageCount = messages.filter(m => m.id !== 'initial').length;
        if (messageCount <= 2) { // First user message + first AI response
          const title = finalMessageText.length > 50 
            ? finalMessageText.substring(0, 47) + '...' 
            : finalMessageText;
          updateSessionTitle(sessionId, title);
        }
      }

    } catch (error) {
      console.error('Message sending error:', error);
      
      const errorResponse: Message = {
        id: uuidv4(),
        text: `I apologize, but I encountered an error: ${error.message}. Please try again.`,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  }, [
    currentSessionId, 
    addMessage, 
    isConfigured, 
    canvasState, 
    sendMessageToN8n, 
    detectModelAndResearchType,
    handleInstantRequest,
    startStreaming,
    stopStreaming,
    startAlegeonStreaming,
    stopAlegeonStreaming,
    messages,
    updateSessionTitle,
    currentTitle
  ]);

  const handleClearConversation = useCallback(() => {
    console.log('useMessages: Clearing conversation');
    setMessages(initialMessages);
    stopStreaming();
    stopAlegeonStreaming(false); // System cleanup
  }, [stopStreaming, stopAlegeonStreaming]);

  const handleDownloadChat = useCallback(() => {
    const chatContent = messages
      .filter(msg => msg.id !== 'initial')
      .map(msg => `${msg.sender.toUpperCase()}: ${msg.text}`)
      .join('\n\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_${new Date().toISOString().split('T')[0]}.txt`;
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
    setCanvasState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleCanvasDownload = useCallback(() => {
    if (canvasState.content) {
      const blob = new Blob([canvasState.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `canvas_report_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [canvasState.content]);

  const handleCanvasPrint = useCallback(() => {
    if (canvasState.content) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>Canvas Report</title></head>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
              <pre style="white-space: pre-wrap;">${canvasState.content}</pre>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  }, [canvasState.content]);

  const handleCanvasPdfDownload = useCallback(() => {
    handleCanvasDownload();
  }, [handleCanvasDownload]);

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
    streamingState,
    stratixStreamingState: streamingState, // For backward compatibility
    alegeonStreamingState,
    // Provide streaming state for components that need it
    isStreamingForMessage: () => streamingState.isStreaming || alegeonStreamingState.isStreaming,
    getStreamingState: () => streamingState
  };
};
