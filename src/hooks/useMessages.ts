import { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, initialMessages, formatTimestamp } from '@/constants/aiAssistant';
import { useN8nWebhook } from '@/hooks/useN8nWebhook';
import { useChatHistory } from '@/hooks/useChatHistory';
import { usePerplexityStreaming } from '@/hooks/usePerplexityStreaming';
import { useStratixStreaming } from '@/hooks/useStratixStreaming';
import { useAlegeonStreaming } from '@/hooks/useAlegeonStreaming';
import { supabase } from '@/integrations/supabase/client';

// Configuration constants
const WEBSOCKET_TIMEOUT_MS = 300000; // 5 minutes for complex processing

// API Endpoints
const API_ENDPOINTS = {
  openai: 'https://api.openai.com/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages',
  algeon: 'https://web-production-06ef2.up.railway.app/chat',
  // ... other endpoints
};

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
  
  // Initialize streaming systems
  const { streamingState, startStreaming, stopStreaming } = usePerplexityStreaming();
  const { 
    streamingState: stratixStreamingState, 
    startStreaming: startStratixStreaming, 
    stopStreaming: stopStratixStreaming 
  } = useStratixStreaming();
  const { 
    streamingState: alegeonStreamingState, 
    startStreaming: startAlegeonStreaming, 
    stopStreaming: stopAlegeonStreaming 
  } = useAlegeonStreaming();

  // Track streaming message ID to replace it when streaming completes
  const streamingMessageIdRef = useRef<string | null>(null);

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

  // Create or update streaming message when Algeon streaming state changes
  useEffect(() => {
    if (alegeonStreamingState.isStreaming && alegeonStreamingState.currentText) {
      console.log('📝 Updating streaming message with current text:', alegeonStreamingState.currentText.substring(0, 100));
      
      setMessages(prev => {
        const withoutStreamingMessage = prev.filter(msg => msg.id !== streamingMessageIdRef.current);
        
        // Create new streaming message ID if needed
        if (!streamingMessageIdRef.current) {
          streamingMessageIdRef.current = `streaming-${uuidv4()}`;
        }
        
        const streamingMessage: Message = {
          id: streamingMessageIdRef.current,
          text: alegeonStreamingState.currentText,
          sender: 'ai',
          timestamp: new Date(),
          metadata: {
            messageType: 'progress_update',
            isCompleted: false
          }
        };
        
        return [...withoutStreamingMessage, streamingMessage];
      });
    }
  }, [alegeonStreamingState.currentText, alegeonStreamingState.isStreaming]);

  // Load messages from history when session changes
  useEffect(() => {
    console.log('useMessages: History effect triggered - Session:', currentSessionId, 'History length:', history.length, 'Is initial load:', isInitialLoad, 'Adding message:', isAddingMessageRef.current);
    
    // Don't reload history if we're currently adding a new message
    if (isAddingMessageRef.current) {
      console.log('🚫 Skipping history reload while adding message - this prevents message disappearing');
      return;
    }
    
    // Only reload history on initial load or when switching sessions
    if (!isInitialLoad && history.length > 0) {
      console.log('📚 Converting history to messages:', history.slice(0, 3));
      const convertedMessages = history.map((entry, index) => {
        // Enhanced logging to debug the message conversion
        console.log(`Processing history entry ${index}:`, entry);
        
        if (!entry.message || typeof entry.message !== 'string') {
          console.warn(`Invalid message entry at index ${index}:`, entry);
          return null;
        }
        
        const lines = entry.message.split('\n');
        const isUser = lines[0].startsWith('USER:');
        const isAI = lines[0].startsWith('AI:');
        
        let text = '';
        if (isUser) {
          text = lines[0].substring(5).trim(); // Remove "USER: " prefix
        } else if (isAI) {
          // For AI messages, join all lines after removing the AI prefix from first line
          const firstLineContent = lines[0].substring(3).trim(); // Remove "AI: " prefix
          const remainingLines = lines.slice(1); // Get all remaining lines
          text = [firstLineContent, ...remainingLines].join('\n').trim(); // Rejoin everything
        } else {
          text = entry.message.trim(); // Use full message if no prefix
        }
        
        // Enhanced logging for canvas report debugging
        if (text.includes('## Executive Summary')) {
          console.log('🎨 Canvas report detected in history restoration:', {
            messageId: entry.id,
            contentLength: text.length,
            hasFullContent: text.includes('## Strategic Analysis'),
            preview: text.substring(0, 200)
          });
        }
        
        // Don't render empty AI messages
        if (!isUser && (!text || text.trim() === '')) {
          console.log(`Skipping empty AI message at index ${index}:`, { text, originalMessage: entry.message });
          return null;
        }
        
        return {
          id: entry.id || `history-${index}`, // Use actual database ID if available, fallback to index
          text,
          sender: isUser ? 'user' : 'ai',
          timestamp: new Date(entry.created_at), // Use actual database timestamp
        } as Message;
      }).filter(Boolean); // Remove null entries
      
      console.log('🔄 REPLACING messages array with history. Current length:', messages.length, 'New length:', convertedMessages.length + initialMessages.length);
      setMessages([...initialMessages, ...convertedMessages]);
      console.log('✅ Loaded messages from history:', convertedMessages.length);
      
      // Check for canvas documents associated with AI messages and restore the latest one
      const restoreCanvasFromHistory = async () => {
        try {
          console.log('🎨 Checking for canvas documents to restore...');
          
          // Find the most recent AI message that might have a canvas document
          const aiMessages = convertedMessages.filter(msg => msg.sender === 'ai');
          
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          // Check each AI message for canvas documents, starting with the most recent
          for (let i = aiMessages.length - 1; i >= 0; i--) {
            const message = aiMessages[i];
            // Use the actual message ID from the database
            const messageId = message.id || `history-${i}`;
            
            console.log('🔍 Checking message for canvas document:', messageId, 'from message:', message);

            const { data: mapping, error } = await supabase
              .from('message_canvas_documents')
              .select(`
                document_id,
                canvas_documents (
                  id,
                  title,
                  content,
                  created_at,
                  updated_at,
                  created_by
                )
              `)
              .eq('message_id', messageId)
              .eq('created_by', user.id)
              .single();

            if (!error && mapping && mapping.canvas_documents) {
              console.log('🎨 Found canvas document to restore:', mapping.canvas_documents.id);
              setCanvasState({
                isOpen: false, // Don't auto-open, just restore the association
                messageId,
                content: mapping.canvas_documents.content
              });
              break; // Use the most recent canvas document
            }
          }
        } catch (err) {
          console.error('❌ Error restoring canvas from history:', err);
        }
      };
      
      // Restore canvas documents after a short delay to ensure messages are loaded
      setTimeout(restoreCanvasFromHistory, 100);
      
    } else if (!isInitialLoad && history.length === 0) {
      console.log('🔄 No history found, resetting to initial messages');
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

  // Handle Algeon requests using the dedicated Algeon streaming implementation
  const handleAlegeonRequest = useCallback(async (message: string, researchType?: string, sessionId?: string | null): Promise<string> => {
    try {
      console.log('🔬 Starting Algeon streaming for message:', message.substring(0, 100));
      console.log('📋 Research type:', researchType);
      
      // Create streaming message ID
      streamingMessageIdRef.current = `streaming-${uuidv4()}`;
      
      // Use the dedicated Algeon streaming implementation with explicit research type
      const result = await startAlegeonStreaming(message, researchType as any);
      
      // Clear streaming message ID when done
      streamingMessageIdRef.current = null;
      
      return result;
      
    } catch (error) {
      console.error('❌ Algeon streaming failed:', error);
      
      // Clear streaming message ID on error
      streamingMessageIdRef.current = null;
      
      // Fallback error message
      return 'I apologize, but I encountered an issue with the Algeon research system. The connection may have been interrupted. Please try again or select a different model.';
    }
  }, [startAlegeonStreaming]);

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

  // Handle Stratix requests with enhanced streaming
  const handleStratixRequest = useCallback(async (prompt: string, sessionId: string | null): Promise<string> => {
    if (!sessionId) {
      throw new Error('Session ID required for Stratix communication');
    }

    try {
      console.log('🎯 Enhanced Stratix Request - Smart routing for:', prompt);
      
      // Reset both streaming systems
      stopStreaming();
      stopStratixStreaming();
      
      const isResearchQuery = detectResearchQuery(prompt);
      
      if (isResearchQuery) {
        console.log('🚀 Using enhanced Stratix streaming for research query');
        return await startStratixStreaming(prompt, sessionId);
      } else {
        console.log('⚡ Using Stratix backend for simple query (WebSocket instant)');
        // For simple queries, use a quick WebSocket connection following exact backend spec
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
            }, WEBSOCKET_TIMEOUT_MS); // 5 minutes for complex processing
            
            ws.onopen = () => {
              console.log('📡 Connected to Stratix for simple query');
              // Send with exact backend format
              ws.send(JSON.stringify({
                query: prompt,
                context: { sessionId: sessionId }
              }));
            };
            
            ws.onmessage = (event) => {
              try {
                const data = JSON.parse(event.data);
                console.log('📨 Stratix simple query response type:', data.type, 'data:', data);
                
                // Handle backend event types exactly as specified
                switch (data.type) {
                  case 'connection_confirmed':
                    console.log('🔗 Connection confirmed for simple query');
                    break;
                    
                  case 'search':
                    console.log('🔍 Search phase for simple query');
                    break;
                    
                  case 'thought':
                    console.log('💭 Thought phase for simple query');
                    break;
                    
                  case 'source':
                    console.log('📄 Source found for simple query');
                    break;
                    
                  case 'snippet':
                    console.log('📝 Snippet analysis for simple query');
                    break;
                    
                  case 'complete':
                    hasReceivedResponse = true;
                    clearTimeout(timeout);
                    ws.close();
                    
                    const finalResponse = data.data?.final_answer || data.message || 'Hello! How can I help you today?';
                    console.log('✅ Stratix simple query complete, response:', finalResponse);
                    resolve(finalResponse);
                    break;
                    
                  case 'error':
                    hasReceivedResponse = true;
                    clearTimeout(timeout);
                    ws.close();
                    console.error('❌ Stratix backend error:', data.message);
                    reject(new Error(data.message || 'Stratix backend error'));
                    break;
                    
                  default:
                    console.warn('⚠️ Unknown event type for simple query:', data.type);
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

  const handleSendMessage = useCallback(async (text?: string, messageText?: string, selectedModel?: string, researchType?: string) => {
    const finalMessageText = text || messageText;
    if (!finalMessageText || finalMessageText.trim() === '') return;

    console.log('🚀 useMessages: Sending message in session:', currentSessionId, 'with model:', selectedModel, 'research type:', researchType);

    // Set flag to prevent history reload interference
    isAddingMessageRef.current = true;

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
      // Reset flag after adding response
      isAddingMessageRef.current = false;
      return;
    }

    setIsTyping(true);
    
    // Ensure streaming state is clean before starting
    if (!detectResearchQuery(finalMessageText) || selectedModel !== 'stratix') {
      stopStreaming();
    }
    
    try {
      let aiResponseText: string;

      // Route to Algeon if model is 'algeon'
      if (selectedModel === 'algeon') {
        console.log('🔬 Using Algeon model with research type:', researchType);
        aiResponseText = await handleAlegeonRequest(finalMessageText, researchType, currentSessionId);
      }
      // Route to Stratix if model is 'stratix'
      else if (selectedModel === 'stratix') {
        console.log('🎯 Using Stratix model with Perplexity-style streaming');
        aiResponseText = await handleStratixRequest(finalMessageText, currentSessionId);
        // Ensure streaming state is fully reset after Stratix completion
        stopStreaming();
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
      
      // Remove any streaming message before adding final response
      if (streamingMessageIdRef.current) {
        setMessages(prev => prev.filter(msg => msg.id !== streamingMessageIdRef.current));
        streamingMessageIdRef.current = null;
      }
      
      const aiResponse: Message = {
        id: uuidv4(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date(),
        metadata: selectedModel === 'stratix' ? {
          messageType: 'stratix_conversation'
        } : selectedModel === 'algeon' ? {
          messageType: 'completed_report',
          isCompleted: true
        } : { messageType: 'standard' },
      };
      
      setMessages(prev => {
        const newMessages = [...prev, aiResponse];
        console.log('📝 Updated messages array, new length:', newMessages.length);
        console.log('📝 Last message:', newMessages[newMessages.length - 1]);
        console.log('📝 Current streaming state:', streamingState.isStreaming);
        
        // For Stratix responses, ensure streaming overlay is not interfering
        if (selectedModel === 'stratix') {
          console.log('🎯 Stratix response added, streaming state should be reset');
        }
        
        return newMessages;
      });

      // Save AI response to history
      if (currentSessionId) {
        await addMessage(`AI: ${aiResponseText}`);
      }

      // Reset flag after successfully adding message and saving to database
      setTimeout(() => {
        isAddingMessageRef.current = false;
        console.log('🔓 Reset isAddingMessageRef flag after message completion');
      }, 1000); // Wait 1 second to ensure database operations complete

    } catch (error) {
      console.error('Message sending error:', error);
      
      // Remove any streaming message on error
      if (streamingMessageIdRef.current) {
        setMessages(prev => prev.filter(msg => msg.id !== streamingMessageIdRef.current));
        streamingMessageIdRef.current = null;
      }
      
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

      // Reset flag even on error
      isAddingMessageRef.current = false;
    } finally {
      setIsTyping(false);
    }
  }, [currentSessionId, addMessage, isConfigured, canvasState, sendMessageToN8n, handleStratixRequest, handleAlegeonRequest]);

  const handleClearConversation = useCallback(() => {
    console.log('useMessages: Clearing conversation');
    setMessages(initialMessages);
    stopStreaming();
    streamingMessageIdRef.current = null;
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

  const handleOpenCanvas = useCallback(async (messageId: string, content: string) => {
    console.log('useMessages: Opening canvas for message:', messageId);
    
    // Set canvas state immediately for UI responsiveness
    setCanvasState({
      isOpen: true,
      messageId,
      content
    });

    // Ensure the canvas document is created and saved to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('useMessages: User not authenticated for canvas creation');
        return;
      }

      // Check if a document already exists for this message
      const { data: existingMapping } = await supabase
        .from('message_canvas_documents')
        .select('document_id')
        .eq('message_id', messageId)
        .eq('created_by', user.id)
        .single();

      if (existingMapping) {
        console.log('useMessages: Canvas document already exists for message:', messageId);
        return;
      }

      // Extract title from content (first heading or fallback)
      const titleMatch = content.match(/^#\s*(.+)$/m);
      const title = titleMatch ? titleMatch[1].trim() : 'AI Report';

      // Create the canvas document
      const { data: newDocument, error: docError } = await supabase
        .from('canvas_documents')
        .insert({
          title,
          content,
          created_by: user.id
        })
        .select()
        .single();

      if (docError) {
        console.error('useMessages: Error creating canvas document:', docError);
        return;
      }

      // Create the message-document mapping
      const { error: mappingError } = await supabase
        .from('message_canvas_documents')
        .insert({
          message_id: messageId,
          document_id: newDocument.id,
          created_by: user.id
        });

      if (mappingError) {
        console.error('useMessages: Error creating message-document mapping:', mappingError);
      } else {
        console.log('useMessages: Successfully created and linked canvas document for message:', messageId);
      }
    } catch (error) {
      console.error('useMessages: Error in handleOpenCanvas:', error);
    }
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
    stratixStreamingState,
    alegeonStreamingState,
    // Provide streaming state for components that need it
    isStreamingForMessage: () => streamingState.isStreaming || stratixStreamingState.isStreaming || alegeonStreamingState.isStreaming,
    getStreamingState: () => streamingState,
    getStratixStreamingState: () => stratixStreamingState,
    getAlegeonStreamingState: () => alegeonStreamingState
  };
};
