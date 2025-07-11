
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
    getUpdatesForMessage
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

    console.log('useMessages: Sending message in session:', currentSessionId, 'with model:', selectedModel);

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
          console.log('Saving AI response to chat history...', aiResponseText.length, 'characters');
          await addMessage(`AI: ${aiResponseText}`);
          console.log('Successfully saved AI response to chat history');
        } catch (error) {
          console.error('Failed to save AI response to chat history:', error);
          // Don't throw - the message is already shown to user
        }
      }
    } catch (error) {
      console.error('useMessages: Error sending message:', error);
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
        
        // Show immediate feedback
        const streamingIndicator = "🔍 **Initializing Research Stream...**\n\nConnecting to research specialists...";
        
        // Add the streaming message to the UI
        const streamingMessage: Message = {
          id: streamingMessageId,
          text: streamingIndicator,
          sender: 'ai',
          timestamp: new Date(),
          metadata: { messageType: 'progress_update' }
        };
        
        setMessages(prev => [...prev, streamingMessage]);
        
        // Start streaming overlay for this message
        startStreaming(streamingMessageId);
        
        // Connect to WebSocket
        const wsUrl = 'wss://ai-agent-research-optivise-production.up.railway.app/stream';
        const ws = new WebSocket(wsUrl);
        
        let hasReceivedResponse = false;
        
        ws.onopen = () => {
          console.log('🔗 WebSocket connected for streaming research');
          ws.send(JSON.stringify({
            query: prompt,
            context: { sessionId }
          }));
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📡 Streaming update:', data.type);
            
            switch (data.type) {
              case 'started':
                addStreamingUpdate(streamingMessageId, 'started', '🎯 Research initiated - Analyzing query...', data);
                break;
                
              case 'agents_selected':
                const agentNames = data.agent_names?.join(', ') || 'Research Specialists';
                addStreamingUpdate(streamingMessageId, 'agents_selected', `🧠 Consulting: ${agentNames}`, data);
                break;
                
              case 'source_discovery_started':
                addStreamingUpdate(streamingMessageId, 'source_discovery_started', `🔍 ${data.agent_name || 'Agent'} searching for sources...`, data);
                break;
                
              case 'source_discovered':
                addStreamingUpdate(streamingMessageId, 'source_discovered', `📚 Found: ${data.source_name} (${data.source_count || 1} sources)`, data);
                break;
                
              case 'research_progress':
                const progress = data.progress ? `${data.progress}%` : 'In progress';
                addStreamingUpdate(streamingMessageId, 'research_progress', `📊 Analyzing data... ${progress}`, data);
                break;
                
              case 'expert_analysis_started':
                addStreamingUpdate(streamingMessageId, 'expert_analysis_started', `🧠 ${data.agent_name || 'Expert'} applying insights...`, data);
                break;
                
              case 'synthesis_started':
                addStreamingUpdate(streamingMessageId, 'synthesis_started', '🔗 Synthesizing findings from all specialists...', data);
                break;
                
              case 'research_complete':
                console.log('✅ Streaming research complete');
                hasReceivedResponse = true;
                ws.close();
                
                // Stop streaming overlay
                stopStreaming();
                
                // Format final response with metadata
                let finalResponse = data.final_answer || "Research completed successfully.";
                
                if (data.methodology && data.methodology !== "Conversational Response") {
                  finalResponse += `\n\n---\n**Research Method:** ${data.methodology}`;
                  
                  if (data.agents_consulted && data.agents_consulted.length > 0) {
                    finalResponse += `\n**Agents Consulted:** ${data.agents_consulted.join(', ')}`;
                  }
                  
                  if (data.confidence) {
                    const confidencePercent = Math.round(data.confidence * 100);
                    finalResponse += `\n**Confidence Level:** ${confidencePercent}%`;
                  }
                  
                  if (data.clickable_sources && data.clickable_sources.length > 0) {
                    finalResponse += '\n**Sources:**';
                    data.clickable_sources.forEach(source => {
                      finalResponse += `\n- [${source.name}](${source.url})`;
                    });
                  }
                }
                
                // Update the streaming message with the final response
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === streamingMessageId 
                      ? { ...msg, text: finalResponse, metadata: { messageType: 'completed_report' } }
                      : msg
                  )
                );
                
                resolve(finalResponse);
                break;
                
              case 'conversation_complete':
                console.log('� Streaming conversation complete');
                hasReceivedResponse = true;
                ws.close();
                stopStreaming();
                
                // Update the streaming message with the final response
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === streamingMessageId 
                      ? { ...msg, text: data.final_answer || "Conversation completed.", metadata: { messageType: 'standard' } }
                      : msg
                  )
                );
                
                resolve(data.final_answer || "Conversation completed.");
                break;
                
              default:
                console.log('🔄 Unknown streaming event:', data.type);
                break;
            }
          } catch (error) {
            console.error('Error parsing streaming message:', error);
          }
        };
        
        ws.onerror = (error) => {
          console.error('🚨 WebSocket error:', error);
          if (!hasReceivedResponse) {
            stopStreaming();
            // Fallback to regular API call
            console.log('🔄 Falling back to REST API');
            handleInstantRequest(prompt).then(resolve).catch(reject);
          }
        };
        
        ws.onclose = () => {
          console.log('🔌 WebSocket connection closed');
          if (!hasReceivedResponse) {
            stopStreaming();
            // If we didn't get a complete response, fall back
            console.log('🔄 Falling back due to incomplete streaming');
            handleInstantRequest(prompt).then(resolve).catch(reject);
          }
        };
        
        // Timeout fallback
        setTimeout(() => {
          if (!hasReceivedResponse) {
            console.log('⏰ Streaming timeout, falling back to REST API');
            stopStreaming();
            ws.close();
            handleInstantRequest(prompt).then(resolve).catch(reject);
          }
        }, 30000); // 30 second timeout
        
      } catch (error) {
        console.error('Failed to initiate streaming:', error);
        stopStreaming();
        // Fallback to instant request
        handleInstantRequest(prompt).then(resolve).catch(reject);
      }
    });
  }, [handleInstantRequest, startStreaming, addStreamingUpdate, stopStreaming]);

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
    // Streaming overlay functionality
    isStreamingForMessage,
    getUpdatesForMessage,
    streamingState
  };
};
