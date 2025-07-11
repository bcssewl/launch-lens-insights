import { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, initialMessages, formatTimestamp } from '@/constants/aiAssistant';
import { useN8nWebhook } from '@/hooks/useN8nWebhook';
import { useChatHistory } from '@/hooks/useChatHistory';
import { useStreamingOverlay } from '@/hooks/useStreamingOverlay';
import { supabase } from '@/integrations/supabase/client';

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
  
  // Initialize streaming overlay functionality
  const {
    streamingState,
    startStreaming,
    addStreamingUpdate,
    stopStreaming,
    isStreamingForMessage,
    getUpdatesForMessage,
    getSourcesForMessage,
    getProgressForMessage
  } = useStreamingOverlay();

  const scrollToBottom = useCallback(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Load messages from history when session changes - but wait for initial load to complete
  useEffect(() => {
    console.log('useMessages: Session/History changed - Session:', currentSessionId, 'History length:', history.length, 'Is initial load:', isInitialLoad);
    
    // Don't process until initial load is complete
    if (isInitialLoad) {
      console.log('useMessages: Still loading initial history, waiting...');
      return;
    }
    
    if (currentSessionId && history.length > 0) {
      console.log('useMessages: Loading history for session:', currentSessionId);
      // Convert history to messages format, parsing out USER: and AI: prefixes
      const historyMessages: Message[] = history.map((item) => {
        let text = item.message;
        let sender: 'user' | 'ai' = 'user';
        
        // Parse the message to determine sender and clean text
        if (text.startsWith('USER: ')) {
          sender = 'user';
          text = text.substring(6); // Remove "USER: " prefix
        } else if (text.startsWith('AI: ')) {
          sender = 'ai';
          text = text.substring(4); // Remove "AI: " prefix
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
    } else if (!currentSessionId || history.length === 0) {
      console.log('useMessages: No session or empty history, showing initial messages only');
      // Reset to initial messages for new sessions or when no session is selected
      setMessages([...initialMessages]);
    }
  }, [currentSessionId, history, isInitialLoad]);

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

    // Save user message to history without prefix
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
      
      const aiResponse: Message = {
        id: uuidv4(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date(),
        metadata: selectedModel === 'stratix' ? {
          messageType: aiResponseText.includes('Starting Stratix Research') ? 'progress_update' : 'stratix_conversation'
        } : { messageType: 'standard' },
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
      // Save AI response to history without showing prefix to user
      if (currentSessionId) {
        try {
          console.log('💾 Saving AI response to chat history...', aiResponseText.length, 'characters');
          await addMessage(`AI: ${aiResponseText}`);
          console.log('✅ Successfully saved AI response to chat history');
        } catch (error) {
          console.error('❌ Failed to save AI response to chat history:', error);
          // Don't throw - the message is already shown to user
        }
      }
    } catch (error) {
      console.error('💥 useMessages: Error sending message:', error);
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
  }, [currentSessionId, addMessage, isConfigured, sendMessageToN8n, canvasState]);

  const handleStratixRequest = useCallback(async (prompt: string, sessionId: string | null): Promise<string> => {
    if (!sessionId) {
      throw new Error('Session ID required for Stratix communication');
    }

    try {
      console.log('Smart routing Stratix request:', prompt);
      
      // Smart detection for streaming vs instant response
      const shouldUseStreaming = detectStreamingNeed(prompt);
      
      if (shouldUseStreaming) {
        console.log('🚀 Using WebSocket streaming for research query');
        return await handleStreamingRequest(prompt, sessionId);
      } else {
        console.log('⚡ Using instant response for simple query');
        return await handleInstantRequest(prompt);
      }

    } catch (error) {
      console.error('Stratix communication error:', error);
      
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to Stratix backend. Please check your internet connection.');
      } else {
        throw new Error(`Stratix error: ${error.message}`);
      }
    }
  }, []);

  // Smart detection logic for when to use streaming
  const detectStreamingNeed = useCallback((prompt: string): boolean => {
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
    
    // Use streaming if:
    // - Contains research keywords
    // - Query is longer than 20 characters (complex question)
    // - Contains multiple sentences or questions
    const isLongQuery = prompt.length > 20;
    const hasMultipleSentences = (prompt.match(/[.!?]/g) || []).length > 1;
    
    return hasResearchKeywords || isLongQuery || hasMultipleSentences;
  }, []);

  // Handle instant responses for simple queries
  const handleInstantRequest = useCallback(async (prompt: string): Promise<string> => {
    const response = await fetch('https://ai-agent-research-optivise-production.up.railway.app/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: prompt })
    });

    if (!response.ok) {
      throw new Error(`API error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Instant response received:', {
      methodology: data.methodology,
      analysisDepth: data.analysis_depth
    });
    
    return data.answer || "I'm ready to help! What would you like to discuss?";
  }, []);

  // Handle streaming requests for research queries
  const handleStreamingRequest = useCallback(async (prompt: string, sessionId: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        // Create a unique ID for this streaming message
        const streamingMessageId = uuidv4();
        console.log('🎯 Starting streaming request with messageId:', streamingMessageId);
        
        // Start streaming IMMEDIATELY
        console.log('▶️ Starting streaming overlay for message:', streamingMessageId);
        startStreaming(streamingMessageId);
        
        // Add initial update after ensuring streaming has started
        setTimeout(() => {
          console.log('🚀 Adding initial search event for message:', streamingMessageId);
          addStreamingUpdate(streamingMessageId, 'search', 'Initializing comprehensive research...', {
            progress_percentage: 5
          });
        }, 100);
        
        // Show immediate feedback with streaming message
        const streamingIndicator = "🔍 **Initializing Perplexity Research...**\n\nConnecting to research specialists...";
        
        // Add the streaming message to the UI
        const streamingMessage: Message = {
          id: streamingMessageId,
          text: streamingIndicator,
          sender: 'ai',
          timestamp: new Date(),
          metadata: { messageType: 'progress_update' }
        };
        
        setMessages(prev => {
          console.log('📝 Adding streaming message to UI with ID:', streamingMessageId);
          return [...prev, streamingMessage];
        });
        
        // Connect to WebSocket with improved error handling
        const wsUrl = 'wss://ai-agent-research-optivise-production.up.railway.app/stream';
        console.log('🔌 Connecting to WebSocket:', wsUrl);
        const ws = new WebSocket(wsUrl);
        
        let hasReceivedResponse = false;
        let connectionTimeout: NodeJS.Timeout;
        let heartbeatInterval: NodeJS.Timeout;
        let initialTimeout: NodeJS.Timeout;
        let isConnectionAlive = true;
        
        // IMPROVED: Longer connection timeout for complex research
        connectionTimeout = setTimeout(() => {
          console.error('⏰ WebSocket connection timeout (60 seconds)');
          if (!hasReceivedResponse && isConnectionAlive) {
            clearTimeout(initialTimeout);
            isConnectionAlive = false;
            ws.close();
            stopStreaming();
            console.log('🔄 Falling back to REST API due to connection timeout');
            handleInstantRequest(prompt).then(resolve).catch(reject);
          }
        }, 60000); // Increased to 60 seconds
        
        ws.onopen = () => {
          console.log('✅ WebSocket connected for Perplexity-style streaming research');
          clearTimeout(connectionTimeout);
          
          // Send search progress event
          setTimeout(() => {
            if (isConnectionAlive) {
              console.log('🚀 Sending search progress event for message:', streamingMessageId);
              addStreamingUpdate(streamingMessageId, 'search', 'Analyzing query and selecting research approach...', {
                progress_percentage: 10
              });
            }
          }, 200);
          
          // Send the research request
          const requestPayload = {
            query: prompt,
            context: { 
              sessionId,
              conversation_history: messages.slice(-5).map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text
              }))
            }
          };
          
          console.log('📤 Sending WebSocket request:', requestPayload);
          ws.send(JSON.stringify(requestPayload));
          
          // IMPROVED: More frequent heartbeat for better connection stability
          heartbeatInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN && isConnectionAlive) {
              try {
                ws.send(JSON.stringify({ type: 'ping' }));
              } catch (error) {
                console.error('❌ Failed to send heartbeat:', error);
                isConnectionAlive = false;
              }
            }
          }, 15000); // Reduced to 15 seconds for better stability
        };
        
        ws.onmessage = (event) => {
          try {
            if (!isConnectionAlive) return;
            
            const data = JSON.parse(event.data);
            console.log('📨 WebSocket message received:', {
              type: data.type,
              message: data.message,
              messageId: streamingMessageId
            });
            
            // Ignore ping responses
            if (data.type === 'pong') {
              return;
            }
            
            // Handle new Perplexity-style events with enhanced logging
            switch (data.type) {
              case 'search':
                console.log('🔍 Processing search event for message:', streamingMessageId);
                addStreamingUpdate(streamingMessageId, 'search', data.message || 'Searching for information...', {
                  search_queries: data.data?.search_queries,
                  progress_percentage: data.data?.progress_percentage || 15
                });
                break;
                
              case 'source':
                console.log('🌐 Processing source event for message:', streamingMessageId);
                addStreamingUpdate(streamingMessageId, 'source', 
                  data.message || `Found: ${data.data?.source_name || 'New source'}`, {
                  source_name: data.data?.source_name,
                  source_url: data.data?.source_url,
                  source_type: data.data?.source_type,
                  confidence: data.data?.confidence,
                  progress_percentage: data.data?.progress_percentage
                });
                break;
                
              case 'snippet':
                console.log('📄 Processing snippet event for message:', streamingMessageId);
                addStreamingUpdate(streamingMessageId, 'snippet',
                  data.message || 'Analyzing content...', {
                  snippet_text: data.data?.snippet_text,
                  source_name: data.data?.source_name,
                  confidence: data.data?.confidence,
                  progress_percentage: data.data?.progress_percentage
                });
                break;
                
              case 'thought':
                console.log('🧠 Processing thought event for message:', streamingMessageId);
                addStreamingUpdate(streamingMessageId, 'thought',
                  data.message || 'Processing insights...', {
                  progress_percentage: data.data?.progress_percentage,
                  confidence: data.data?.confidence
                });
                break;
                
              case 'complete':
                console.log('🎉 Processing complete event for message:', streamingMessageId);
                hasReceivedResponse = true;
                isConnectionAlive = false;
                clearInterval(heartbeatInterval);
                clearTimeout(initialTimeout);
                clearTimeout(connectionTimeout);
                ws.close();
                
                // Stop streaming overlay
                stopStreaming();
                
                // Format final response
                let finalResponse = data.message || data.data?.content || "Research completed successfully.";
                
                // Add sources to the final response if provided
                if (data.data?.sources && data.data.sources.length > 0) {
                  finalResponse += '\n\n**Sources:**';
                  data.data.sources.forEach((source: any) => {
                    finalResponse += `\n- [${source.name}](${source.url})`;
                  });
                }
                
                // Update the streaming message with the final response
                console.log('📝 Updating message with final response');
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === streamingMessageId 
                      ? { ...msg, text: finalResponse, metadata: { messageType: 'completed_report' } }
                      : msg
                  )
                );
                
                resolve(finalResponse);
                break;
                
              // Handle legacy events for backward compatibility
              case 'research_complete':
                console.log('✅ Processing legacy research_complete event for message:', streamingMessageId);
                hasReceivedResponse = true;
                isConnectionAlive = false;
                clearInterval(heartbeatInterval);
                clearTimeout(initialTimeout);
                ws.close();
                stopStreaming();
                
                let legacyResponse = data.final_answer || "Research completed successfully.";
                
                if (data.methodology && data.methodology !== "Conversational Response") {
                  legacyResponse += `\n\n---\n**Research Method:** ${data.methodology}`;
                  
                  if (data.clickable_sources && data.clickable_sources.length > 0) {
                    legacyResponse += '\n**Sources:**';
                    data.clickable_sources.forEach((source: any) => {
                      legacyResponse += `\n- [${source.name}](${source.url})`;
                    });
                  }
                }
                
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === streamingMessageId 
                      ? { ...msg, text: legacyResponse, metadata: { messageType: 'completed_report' } }
                      : msg
                  )
                );
                
                resolve(legacyResponse);
                break;
                
              default:
                console.log('❓ Processing unknown event type for message:', streamingMessageId, 'type:', data.type);
                // Add as a generic thought event
                addStreamingUpdate(streamingMessageId, 'thought', 
                  data.message || `Status: ${data.type}`, data.data);
                break;
            }
          } catch (error) {
            console.error('💥 Error parsing streaming message:', error, 'Raw event:', event.data);
          }
        };
        
        ws.onerror = (error) => {
          console.error('🚨 WebSocket error for message:', streamingMessageId, error);
          if (isConnectionAlive) {
            isConnectionAlive = false;
            clearTimeout(connectionTimeout);
            clearTimeout(initialTimeout);
            clearInterval(heartbeatInterval);
            if (!hasReceivedResponse) {
              stopStreaming();
              console.log('🔄 Falling back to REST API for message:', streamingMessageId);
              handleInstantRequest(prompt).then(resolve).catch(reject);
            }
          }
        };
        
        ws.onclose = (event) => {
          console.log('🔌 WebSocket connection closed for message:', streamingMessageId, { code: event.code, reason: event.reason });
          if (isConnectionAlive) {
            isConnectionAlive = false;
            clearTimeout(connectionTimeout);
            clearTimeout(initialTimeout);
            clearInterval(heartbeatInterval);
            if (!hasReceivedResponse) {
              stopStreaming();
              console.log('🔄 Falling back due to incomplete streaming for message:', streamingMessageId);
              handleInstantRequest(prompt).then(resolve).catch(reject);
            }
          }
        };
        
        // IMPROVED: Extended overall timeout for complex research
        initialTimeout = setTimeout(() => {
          if (!hasReceivedResponse && isConnectionAlive) {
            console.log('⏰ Streaming timeout (5 minutes), falling back to REST API for message:', streamingMessageId);
            isConnectionAlive = false;
            clearInterval(heartbeatInterval);
            clearTimeout(connectionTimeout);
            stopStreaming();
            ws.close();
            handleInstantRequest(prompt).then(resolve).catch(reject);
          }
        }, 300000); // Increased to 5 minutes for complex research
        
      } catch (error) {
        console.error('💥 Failed to initiate streaming for message:', error);
        stopStreaming();
        handleInstantRequest(prompt).then(resolve).catch(reject);
      }
    });
  }, [handleInstantRequest, startStreaming, addStreamingUpdate, stopStreaming, messages]);

  const handleClearConversation = useCallback(() => {
    console.log('useMessages: Clearing conversation');
    setMessages([initialMessages[0]]);
  }, []);

  const handleDownloadChat = useCallback(() => {
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
    setCanvasState({
      isOpen: false,
      messageId: null,
      content: ''
    });
  }, []);

  const handleCanvasDownload = useCallback(() => {
    if (!canvasState.content) return;
    
    console.log('useMessages: Downloading canvas content');
    const blob = new Blob([canvasState.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [canvasState.content]);

  const handleCanvasPrint = useCallback(() => {
    console.log('useMessages: Printing canvas');
    window.print();
  }, []);

  const handleCanvasPdfDownload = useCallback(() => {
    console.log('useMessages: PDF download initiated');
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
    // Enhanced streaming overlay functionality
    isStreamingForMessage,
    getUpdatesForMessage,
    getSourcesForMessage,
    getProgressForMessage,
    streamingState
  };
};
