import { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, initialMessages, formatTimestamp } from '@/constants/aiAssistant';
import { useN8nWebhook } from '@/hooks/useN8nWebhook';
import { useChatHistory } from '@/hooks/useChatHistory';
import { usePerplexityStreaming } from '@/hooks/usePerplexityStreaming';
import { supabase } from '@/integrations/supabase/client';

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
  
  // Initialize Perplexity-style streaming
  const { streamingState, startStreaming, stopStreaming } = usePerplexityStreaming();

  const scrollToBottom = useCallback(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Add a flag to prevent history loading from interfering with new messages
  const isAddingMessageRef = useRef(false);

  // Load messages from history when session changes
  useEffect(() => {
    console.log('useMessages: Session/History changed - Session:', currentSessionId, 'History length:', history.length, 'Is initial load:', isInitialLoad, 'Adding message:', isAddingMessageRef.current);
    
    // Don't reload history if we're currently adding a new message
    if (isAddingMessageRef.current) {
      console.log('Skipping history reload while adding message');
      return;
    }
    
    if (!isInitialLoad && history.length > 0) {
      console.log('Converting history to messages:', history.slice(0, 3));
      const convertedMessages = history.map((entry, index) => {
        // Enhanced logging to debug the message conversion
        console.log(`Processing history entry ${index}:`, entry);
        
        if (!entry.message || typeof entry.message !== 'string') {
          console.warn(`Invalid message entry at index ${index}:`, entry);
          return null;
        }
        
        const lines = entry.message.split('\n');
        const isUser = lines[0].startsWith('USER:');
        const text = isUser ? lines[0].substring(5).trim() : lines.slice(1).join('\n').trim();
        
        // Don't render empty AI messages
        if (!isUser && (!text || text.trim() === '')) {
          console.log(`Skipping empty AI message at index ${index}`);
          return null;
        }
        
        return {
          id: `history-${index}`,
          text,
          sender: isUser ? 'user' : 'ai',
          timestamp: new Date(Date.now() - (history.length - index) * 1000),
        } as Message;
      }).filter(Boolean); // Remove null entries
      
      setMessages([...initialMessages, ...convertedMessages]);
      console.log('Loaded messages from history:', convertedMessages.length);
    } else if (!isInitialLoad && history.length === 0) {
      console.log('No history found, using initial messages');
      setMessages(initialMessages);
    }
  }, [currentSessionId, history, isInitialLoad]);

  // Smart detection logic for when to use streaming (Perplexity-style research)
  const detectResearchQuery = useCallback((prompt: string): boolean => {
    const trimmedPrompt = prompt.trim().toLowerCase();
    
    // Simple conversations - never stream
    const simplePatterns = [
      /^(hello|hi|hey|good morning|good afternoon)[\s\?\.!]*$/,
      /^(how are you|how\'s it going|what\'s up)[\s\?\.!]*$/,
      /^(thanks|thank you|thx|ty)[\s\?\.!]*$/,
      /^(ok|okay|alright|good|great|cool)[\s\?\.!]*$/,
      /^(who are you|what are you|what can you do)[\s\?\.!]*$/,
      /^(bye|goodbye|see you|talk later)[\s\?\.!]*$/
    ];
    
    if (simplePatterns.some(pattern => pattern.test(trimmedPrompt))) {
      return false;
    }
    
    // Research indicators - use streaming
    const researchKeywords = [
      'analyze', 'research', 'competitive', 'market', 'strategy', 'trends',
      'industry', 'growth', 'opportunities', 'insights', 'report', 'study',
      'comparison', 'evaluation', 'assessment', 'forecast', 'outlook',
      'landscape', 'ecosystem', 'regulations', 'compliance'
    ];
    
    const hasResearchKeywords = researchKeywords.some(keyword => 
      trimmedPrompt.includes(keyword)
    );
    
    // Complex query indicators
    const isLongQuery = prompt.length > 30;
    const hasQuestionWords = /\b(what|how|why|when|where|which|should|could|would)\b/i.test(prompt);
    
    return hasResearchKeywords || (isLongQuery && hasQuestionWords);
  }, []);

  // Handle instant responses for simple queries
  const handleInstantRequest = useCallback(async (prompt: string): Promise<string> => {
    try {
      console.log('⚡ Making instant request to Stratix API');
      
      // Try the correct endpoint first
      let response = await fetch('https://ai-agent-research-optivise-production.up.railway.app/instant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          sessionId: currentSessionId || 'instant-session'
        }),
      });

      // If that fails, try the chat endpoint
      if (!response.ok) {
        console.log('⚡ Instant endpoint failed, trying chat endpoint');
        response = await fetch('https://ai-agent-research-optivise-production.up.railway.app/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: prompt,
            sessionId: currentSessionId || 'instant-session'
          }),
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || data.message || 'Response received successfully.';
      
    } catch (error) {
      console.error('❌ Instant request failed:', error);
      // Return a more helpful error message that won't disappear
      return `Hello! I'm having trouble connecting to my advanced AI service right now, but I'm still here to help. Feel free to ask me anything about business strategy, market analysis, or startup advice and I'll do my best to assist you.`;
    }
  }, [currentSessionId]);

  // Handle Stratix requests with smart routing
  const handleStratixRequest = useCallback(async (prompt: string, sessionId: string | null): Promise<string> => {
    if (!sessionId) {
      throw new Error('Session ID required for Stratix communication');
    }

    try {
      console.log('🎯 Stratix Request - Smart routing for:', prompt);
      
      // Always reset streaming state at the start of any Stratix request
      stopStreaming();
      
      const isResearchQuery = detectResearchQuery(prompt);
      
      if (isResearchQuery) {
        console.log('🚀 Using Perplexity-style streaming for research query');
        return await startStreaming(prompt, sessionId);
      } else {
        console.log('⚡ Using Stratix backend for simple query (WebSocket instant)');
        // For simple queries, use a quick WebSocket connection to ensure it goes through Stratix backend
        return new Promise((resolve, reject) => {
          try {
            const ws = new WebSocket('wss://ai-agent-research-optivise-production.up.railway.app/stream');
            let response = '';
            let hasReceivedResponse = false;
            
            const timeout = setTimeout(() => {
              if (!hasReceivedResponse) {
                console.log('⏰ Timeout waiting for Stratix response');
                ws.close();
                reject(new Error('Timeout waiting for Stratix response'));
              }
            }, 15000); // Increased to 15 seconds
            
            ws.onopen = () => {
              console.log('📡 Connected to Stratix for simple query');
              ws.send(JSON.stringify({
                query: prompt,
                context: { sessionId: sessionId }
              }));
            };
            
            ws.onmessage = (event) => {
              try {
                const data = JSON.parse(event.data);
                console.log('📨 Stratix simple query response type:', data.type, 'data:', data);
                
                // Handle all possible response formats from the streaming backend
                if (data.type === 'content' || data.type === 'content_chunk') {
                  response += data.content || data.data?.content || data.message || '';
                } else if (data.type === 'stream_start') {
                  console.log('📡 Stream started for simple query');
                } else if (data.type === 'complete' || data.type === 'research_complete') {
                  hasReceivedResponse = true;
                  clearTimeout(timeout);
                  ws.close();
                  const finalResponse = response.trim() || 'Hello! How can I help you today?';
                  console.log('✅ Stratix simple query complete, response:', finalResponse);
                  resolve(finalResponse);
                } else if (data.type === 'error') {
                  hasReceivedResponse = true;
                  clearTimeout(timeout);
                  ws.close();
                  console.error('❌ Stratix backend error:', data.message);
                  reject(new Error(data.message || 'Stratix backend error'));
                } else if (data.response || data.message) {
                  // Direct response format
                  hasReceivedResponse = true;
                  clearTimeout(timeout);
                  ws.close();
                  const directResponse = data.response || data.message;
                  console.log('✅ Direct Stratix response:', directResponse);
                  resolve(directResponse);
                }
              } catch (parseError) {
                console.error('❌ Error parsing Stratix response:', parseError, 'Raw data:', event.data);
              }
            };
            
            ws.onerror = (error) => {
              hasReceivedResponse = true;
              clearTimeout(timeout);
              console.error('❌ Stratix WebSocket error details:', error);
              reject(new Error('Connection to Stratix backend failed'));
            };
            
            ws.onclose = (event) => {
              console.log('🔌 Stratix WebSocket closed:', event.code, event.reason);
              if (!hasReceivedResponse) {
                clearTimeout(timeout);
                reject(new Error(`Connection closed before receiving response: ${event.code} ${event.reason}`));
              }
            };
            
          } catch (connectionError) {
            console.error('❌ Failed to create Stratix WebSocket:', connectionError);
            reject(connectionError);
          }
        });
      }

    } catch (error) {
      console.error('❌ Stratix communication error:', error);
      
      // Ensure streaming is stopped on error
      stopStreaming();
      
      // For Stratix errors, return a Stratix-appropriate error message
      return 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.';
    }
  }, [detectResearchQuery, startStreaming, stopStreaming]);

  const handleSendMessage = useCallback(async (text?: string, messageText?: string, selectedModel?: string) => {
    const finalMessageText = text || messageText;
    if (!finalMessageText || finalMessageText.trim() === '') return;

    console.log('🚀 useMessages: Sending message in session:', currentSessionId, 'with model:', selectedModel);

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
    
    // Ensure streaming state is clean before starting
    if (!detectResearchQuery(finalMessageText) || selectedModel !== 'stratix') {
      stopStreaming();
    }
    
    try {
      let aiResponseText: string;

      // Route to Stratix if model is 'stratix'
      if (selectedModel === 'stratix') {
        console.log('🎯 Using Stratix model with Perplexity-style streaming');
        aiResponseText = await handleStratixRequest(finalMessageText, currentSessionId);
      } else {
        // Use existing N8N webhook for all other models
        let contextMessage = finalMessageText;
        if (canvasState.isOpen && canvasState.content) {
          contextMessage = `Current document content:\n\n${canvasState.content}\n\n---\n\nUser message: ${finalMessageText}`;
        }
        
        console.log('📨 Sending to N8N webhook...');
        aiResponseText = await sendMessageToN8n(contextMessage, currentSessionId);
      }
      
      // Don't create message if response is empty
      if (!aiResponseText || aiResponseText.trim() === '') {
        console.warn('Received empty response from AI service');
        aiResponseText = "I apologize, but I didn't receive a proper response. Please try asking your question again.";
      }
      
      console.log('✅ Creating AI response message with text:', aiResponseText.substring(0, 100) + '...');
      
      const aiResponse: Message = {
        id: uuidv4(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date(),
        metadata: selectedModel === 'stratix' ? {
          messageType: 'stratix_conversation'
        } : { messageType: 'standard' },
      };
      
      setMessages(prev => {
        const newMessages = [...prev, aiResponse];
        console.log('📝 Updated messages array, new length:', newMessages.length);
        console.log('📝 Last message:', newMessages[newMessages.length - 1]);
        console.log('📝 Current streaming state:', streamingState.isStreaming);
        return newMessages;
      });

      // Save AI response to history
      if (currentSessionId) {
        await addMessage(`AI: ${aiResponseText}`);
      }

    } catch (error) {
      console.error('Message sending error:', error);
      
      const errorResponse: Message = {
        id: uuidv4(),
        text: `I'm having trouble accessing my full capabilities right now, but I'm still here to help! Please feel free to ask me about business strategy, market analysis, or any startup-related questions.`,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => {
        const newMessages = [...prev, errorResponse];
        console.log('⚠️ Added error message, new messages length:', newMessages.length);
        return newMessages;
      });
    } finally {
      setIsTyping(false);
    }
  }, [currentSessionId, addMessage, isConfigured, canvasState, sendMessageToN8n, handleStratixRequest]);

  const handleClearConversation = useCallback(() => {
    console.log('useMessages: Clearing conversation');
    setMessages(initialMessages);
    stopStreaming();
  }, [stopStreaming]);

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
    // Provide streaming state for components that need it
    isStreamingForMessage: () => streamingState.isStreaming,
    getStreamingState: () => streamingState
  };
};
