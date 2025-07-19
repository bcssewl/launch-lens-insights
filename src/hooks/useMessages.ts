import { useState, useRef, useEffect, useCallback, useReducer } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, initialMessages, formatTimestamp } from '@/constants/aiAssistant';
import { useN8nWebhook } from '@/hooks/useN8nWebhook';
import { useChatHistory } from '@/hooks/useChatHistory';
import { usePerplexityStreaming } from '@/hooks/usePerplexityStreaming';
import { useStratixStreaming } from '@/hooks/useStratixStreaming';
import { useAlegeonStreaming } from '@/hooks/useAlegeonStreaming';
import { useAutoTitle } from '@/hooks/useAutoTitle';
import { supabase } from '@/integrations/supabase/client';

// Configuration constants
const WEBSOCKET_TIMEOUT_MS = 300000; // 5 minutes for complex processing

// Extended Message interface for internal use
interface ExtendedMessage extends Message {
  isStreaming?: boolean;
  alegeonCitations?: Array<{
    name: string;
    url: string;
    type?: string;
  }>;
}

// Actions for message state management using useReducer
type MessageAction = 
  | { type: 'SET_MESSAGES'; payload: ExtendedMessage[] }
  | { type: 'ADD_MESSAGE'; payload: ExtendedMessage }
  | { type: 'ADD_STREAMING_MESSAGE'; payload: ExtendedMessage }
  | { type: 'REPLACE_STREAMING_WITH_FINAL'; payload: { finalMessage: ExtendedMessage; streamingId: string } }
  | { type: 'REMOVE_STREAMING_MESSAGE'; payload: string }
  | { type: 'UPDATE_STREAMING_MESSAGE'; payload: { id: string; updates: Partial<ExtendedMessage> } };

function messageReducer(state: ExtendedMessage[], action: MessageAction): ExtendedMessage[] {
  switch (action.type) {
    case 'SET_MESSAGES':
      return action.payload;
    case 'ADD_MESSAGE':
      return [...state, action.payload];
    case 'ADD_STREAMING_MESSAGE':
      // Remove any existing streaming message first
      const withoutStreaming = state.filter(msg => !msg.isStreaming);
      return [...withoutStreaming, action.payload];
    case 'REPLACE_STREAMING_WITH_FINAL':
      return state.map(msg => 
        msg.id === action.payload.streamingId 
          ? action.payload.finalMessage 
          : msg
      );
    case 'REMOVE_STREAMING_MESSAGE':
      return state.filter(msg => msg.id !== action.payload);
    case 'UPDATE_STREAMING_MESSAGE':
      return state.map(msg => 
        msg.id === action.payload.id 
          ? { ...msg, ...action.payload.updates }
          : msg
      );
    default:
      return state;
  }
}

// Helper function to extract domain name from URL
const extractDomainName = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
};

// Helper function to parse citations from message text
const parseCitationsFromText = (messageText: string): Array<{ name: string; url: string; type?: string }> => {
  // Look for citations pattern anywhere in the text using regex
  const citationMatch = messageText.match(/Citations:\s*(\[.*?\])\s*$/s);
  
  if (!citationMatch) {
    return [];
  }

  try {
    const citationData = JSON.parse(citationMatch[1]);
    
    // Convert URL strings to proper citation objects
    if (Array.isArray(citationData)) {
      return citationData.map((item: string | object) => {
        if (typeof item === 'string') {
          // Convert URL string to citation object
          return {
            name: extractDomainName(item),
            url: item,
            type: 'web'
          };
        } else if (typeof item === 'object' && item !== null) {
          // Already a proper citation object
          return item as { name: string; url: string; type?: string };
        }
        return null;
      }).filter(Boolean);
    }
  } catch (e) {
    console.warn('Failed to parse citations from message:', e);
  }
  
  return [];
};

export const useMessages = (currentSessionId: string | null, updateSessionTitle?: (sessionId: string, title: string) => Promise<void>, sessionTitle?: string) => {
  const [messages, dispatch] = useReducer(messageReducer, initialMessages as ExtendedMessage[]);
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
  const { history, addMessage, addMessageToSession, isInitialLoad } = useChatHistory(currentSessionId);
  
  // Initialize auto-title system
  const { generateAndSetTitle, shouldGenerateTitle } = useAutoTitle();
  
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

  // Consistent streaming message ID
  const STREAMING_MESSAGE_ID = 'algeon-streaming-message';
  const isAddingMessageRef = useRef(false);
  const processedCompletionsRef = useRef<Set<string>>(new Set()); // Track processed completions

  // Improved scroll behavior - only auto-scroll when user is near bottom
  const scrollToBottom = useCallback(() => {
    if (viewportRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = viewportRef.current;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      
      // Only auto-scroll if user is within 100px of bottom
      if (distanceFromBottom <= 100) {
        requestAnimationFrame(() => {
          if (viewportRef.current) {
            viewportRef.current.scrollTo({ 
              top: viewportRef.current.scrollHeight, 
              behavior: 'smooth' 
            });
          }
        });
      }
    }
  }, []);

  // Only scroll on actual message changes, not streaming updates
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, isTyping, scrollToBottom]);

  // Enhanced Algeon streaming message management with duplicate prevention
  useEffect(() => {
    const currentBufferedText = alegeonStreamingState.bufferedText;
    const completionKey = `${currentBufferedText.substring(0, 100)}-${alegeonStreamingState.isComplete}`;
    
    if (alegeonStreamingState.isStreaming && alegeonStreamingState.hasContent) {
      console.log('📝 Managing Algeon streaming message - isStreaming:', alegeonStreamingState.isStreaming);
      
      const streamingMessage: ExtendedMessage = {
        id: STREAMING_MESSAGE_ID,
        text: currentBufferedText || 'Initializing Algeon research...',
        sender: 'ai',
        timestamp: new Date(),
        isStreaming: true,
        metadata: {
          messageType: 'progress_update',
          isCompleted: false
        },
        alegeonCitations: alegeonStreamingState.citations
      };
      
      dispatch({ type: 'ADD_STREAMING_MESSAGE', payload: streamingMessage });
      
    } else if (alegeonStreamingState.isComplete && currentBufferedText && !processedCompletionsRef.current.has(completionKey)) {
      console.log('✅ Algeon streaming completed, replacing with final message');
      
      // Mark this completion as processed
      processedCompletionsRef.current.add(completionKey);
      
      // Create final message with citations preserved
      const finalMessage: ExtendedMessage = {
        id: uuidv4(),
        text: currentBufferedText,
        sender: 'ai',
        timestamp: new Date(),
        metadata: {
          messageType: 'completed_report',
          isCompleted: true
        },
        alegeonCitations: alegeonStreamingState.finalCitations
      };
      
      dispatch({ 
        type: 'REPLACE_STREAMING_WITH_FINAL', 
        payload: { finalMessage, streamingId: STREAMING_MESSAGE_ID }
      });
      
      // Save final message to history with citations metadata
      if (currentSessionId && currentBufferedText) {
        const messageWithCitations = `AI: ${currentBufferedText}${
          alegeonStreamingState.finalCitations.length > 0 
            ? `\n\nCitations: ${JSON.stringify(alegeonStreamingState.finalCitations)}`
            : ''
        }`;
        addMessage(messageWithCitations);

        // Check if we should generate an auto-title after first exchange
        // At this point, history includes the new AI message we just added, so we check for exactly 2 messages
        console.log('🏷️ Checking auto-title conditions:', {
          messageCount: history.length + 1,
          sessionTitle,
          shouldGenerate: shouldGenerateTitle(history.length + 1, sessionTitle),
          historyLength: history.length,
          updateSessionTitleExists: !!updateSessionTitle
        });
        
        if (updateSessionTitle && sessionTitle && shouldGenerateTitle(history.length + 1, sessionTitle)) {
          // Find the user's first message for title generation
          const userMessages = history.filter(h => h.message.startsWith('USER:'));
          console.log('🏷️ Found user messages for title generation:', userMessages.length);
          if (userMessages.length > 0) {
            const firstUserMessage = userMessages[0].message.substring(5).trim();
            console.log('🏷️ Triggering auto-title generation for session:', currentSessionId, 'with', history.length + 1, 'messages');
            generateAndSetTitle(currentSessionId, firstUserMessage, currentBufferedText, updateSessionTitle);
          } else {
            console.log('🏷️ No user messages found in history for title generation');
          }
        }
      }
      
      // Clean up processed completions after a delay to prevent memory leaks
      setTimeout(() => {
        processedCompletionsRef.current.delete(completionKey);
      }, 5000);
    }
  }, [
    alegeonStreamingState.isStreaming, 
    alegeonStreamingState.bufferedText, 
    alegeonStreamingState.isComplete,
    alegeonStreamingState.hasContent,
    alegeonStreamingState.citations,
    alegeonStreamingState.finalCitations,
    currentSessionId,
    addMessage
  ]);

  // Load messages from history when session changes
  useEffect(() => {
    console.log('useMessages: History effect triggered - Session:', currentSessionId, 'History length:', history.length, 'Is initial load:', isInitialLoad);
    
    if (isAddingMessageRef.current) {
      console.log('🚫 Skipping history reload while adding message');
      return;
    }
    
    if (!isInitialLoad && history.length > 0) {
      console.log('📚 Converting history to messages:', history.slice(0, 3));
      const convertedMessages = history.map((entry, index) => {
        console.log(`Processing history entry ${index}:`, entry);
        
        if (!entry.message || typeof entry.message !== 'string') {
          console.warn(`Invalid message entry at index ${index}:`, entry);
          return null;
        }
        
        const lines = entry.message.split('\n');
        const isUser = lines[0].startsWith('USER:');
        const isAI = lines[0].startsWith('AI:');
        
        let text = '';
        let alegeonCitations: Array<{ name: string; url: string; type?: string }> = [];
        
        if (isUser) {
          text = lines[0].substring(5).trim();
        } else if (isAI) {
          const firstLineContent = lines[0].substring(3).trim();
          const fullMessageText = [firstLineContent, ...lines.slice(1)].join('\n').trim();
          
          // Parse citations using the new regex-based approach
          alegeonCitations = parseCitationsFromText(fullMessageText);
          
          if (alegeonCitations.length > 0) {
            // Remove citations from the content text
            text = fullMessageText.replace(/\n*Citations:\s*\[.*?\]\s*$/s, '').trim();
            console.log('📎 Extracted citations from message:', {
              messageId: entry.id || `history-${index}`,
              citationsCount: alegeonCitations.length,
              extractedCitations: alegeonCitations
            });
          } else {
            text = fullMessageText;
          }
        } else {
          text = entry.message.trim();
        }
        
        if (!isUser && (!text || text.trim() === '')) {
          console.log(`Skipping empty AI message at index ${index}`);
          return null;
        }
        
        const message: ExtendedMessage = {
          id: entry.id || `history-${index}`,
          text,
          sender: isUser ? 'user' : 'ai',
          timestamp: new Date(entry.created_at),
          alegeonCitations: alegeonCitations.length > 0 ? alegeonCitations : undefined
        };
        
        return message;
      }).filter(Boolean) as ExtendedMessage[];
      
      console.log('🔄 REPLACING messages array with history');
      dispatch({ type: 'SET_MESSAGES', payload: [...initialMessages as ExtendedMessage[], ...convertedMessages] });
      console.log('✅ Loaded messages from history:', convertedMessages.length);
      
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
      dispatch({ type: 'SET_MESSAGES', payload: initialMessages as ExtendedMessage[] });
    }
  }, [currentSessionId, history, isInitialLoad]);

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

  // Handle Algeon requests with enhanced citation support
  const handleAlegeonRequest = useCallback(async (message: string, researchType?: string, sessionId?: string | null): Promise<string> => {
    try {
      console.log('🔬 Starting Algeon streaming for message:', message.substring(0, 100));
      
      // Use the enhanced Algeon streaming implementation
      const result = await startAlegeonStreaming(message, researchType as any);
      
      console.log('✅ Algeon request completed:', {
        textLength: result.text.length,
        citationsCount: result.citations.length
      });
      
      return result.text;
      
    } catch (error) {
      console.error('❌ Algeon streaming failed:', error);
      dispatch({ type: 'REMOVE_STREAMING_MESSAGE', payload: STREAMING_MESSAGE_ID });
      return 'I apologize, but I encountered an issue with the Algeon research system. Please try again or select a different model.';
    }
  }, [startAlegeonStreaming]);

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

  const handleSendMessage = useCallback(async (text?: string, messageText?: string, selectedModel?: string, researchType?: string, sessionIdOverride?: string) => {
    const finalMessageText = text || messageText;
    if (!finalMessageText || finalMessageText.trim() === '') return;

    console.log('🚀 useMessages: Sending message with model:', selectedModel, 'sessionOverride:', sessionIdOverride);

    isAddingMessageRef.current = true;

    const newUserMessage: ExtendedMessage = {
      id: uuidv4(),
      text: finalMessageText,
      sender: 'user',
      timestamp: new Date(),
    };
    
    dispatch({ type: 'ADD_MESSAGE', payload: newUserMessage });

    // Save user message to history - use override session ID if provided
    const sessionIdToUse = sessionIdOverride || currentSessionId;
    if (sessionIdToUse) {
      console.log('💾 Saving user message to history for session:', sessionIdToUse, '(override:', !!sessionIdOverride, ')');
      const savedMessage = await addMessageToSession(`USER: ${finalMessageText}`, sessionIdToUse);
      console.log('💾 User message save result:', savedMessage ? 'SUCCESS' : 'FAILED');
    } else {
      console.warn('💾 No session ID available for saving user message');
    }

    if (!isConfigured) {
      const fallbackResponse: ExtendedMessage = {
        id: uuidv4(),
        text: "The AI service is not configured properly. Please contact support for assistance.",
        sender: 'ai',
        timestamp: new Date(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: fallbackResponse });
      isAddingMessageRef.current = false;
      return;
    }

    setIsTyping(true);
    
    // Clean up any existing streaming state
    stopStreaming();
    stopStratixStreaming();
    stopAlegeonStreaming();
    
    // Remove any existing streaming messages
    dispatch({ type: 'REMOVE_STREAMING_MESSAGE', payload: STREAMING_MESSAGE_ID });
    
    // Clear processed completions for new request
    processedCompletionsRef.current.clear();
    
    try {
      let aiResponseText: string;

      // Route to Algeon if model is 'algeon' OR for research queries with 'best' model
      if (selectedModel === 'algeon' || (selectedModel === 'best' && detectResearchQuery(finalMessageText))) {
        console.log('🔬 Using Algeon model with typewriter animation');
        aiResponseText = await handleAlegeonRequest(finalMessageText, researchType, currentSessionId);
        // Note: Final message handling is done in the useEffect above
      }
      // Route to Stratix if model is 'stratix'
      else if (selectedModel === 'stratix') {
        console.log('🎯 Using Stratix model with Perplexity-style streaming');
        aiResponseText = await handleStratixRequest(finalMessageText, currentSessionId);
        stopStreaming();
        
        // Add final Stratix message
        const aiResponse: Message = {
          id: uuidv4(),
          text: aiResponseText,
          sender: 'ai',
          timestamp: new Date(),
          metadata: { messageType: 'stratix_conversation' },
        };
        
        dispatch({ type: 'ADD_MESSAGE', payload: aiResponse });
        
        // Save AI response to history
        if (currentSessionId) {
          await addMessage(`AI: ${aiResponseText}`);
        }
      } else {
        // Use existing N8N webhook for all other models
        let contextMessage = finalMessageText;
        if (canvasState.isOpen && canvasState.content) {
          contextMessage = `Current document content:\n\n${canvasState.content}\n\n---\n\nUser message: ${finalMessageText}`;
        }
        
        console.log('📨 Sending to N8N webhook...');
        aiResponseText = await sendMessageToN8n(contextMessage, currentSessionId);
        
        // Don't create message if response is empty
        if (!aiResponseText || aiResponseText.trim() === '') {
          console.warn('Received empty response from AI service');
          aiResponseText = "I apologize, but I didn't receive a proper response. Please try asking your question again.";
        }
        
        const aiResponse: Message = {
          id: uuidv4(),
          text: aiResponseText,
          sender: 'ai',
          timestamp: new Date(),
          metadata: { messageType: 'standard' },
        };
        
        dispatch({ type: 'ADD_MESSAGE', payload: aiResponse });

        // Save AI response to history
        if (currentSessionId) {
          await addMessage(`AI: ${aiResponseText}`);
        }
      }

      // Reset flag after successful completion
      setTimeout(() => {
        isAddingMessageRef.current = false;
        console.log('🔓 Reset isAddingMessageRef flag');
      }, 1000);

    } catch (error) {
      console.error('Message sending error:', error);
      
      dispatch({ type: 'REMOVE_STREAMING_MESSAGE', payload: STREAMING_MESSAGE_ID });
      
      const errorResponse: ExtendedMessage = {
        id: uuidv4(),
        text: `I'm having trouble accessing my full capabilities right now, but I'm still here to help! Please feel free to ask me about business strategy, market analysis, or any startup-related questions.`,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      dispatch({ type: 'ADD_MESSAGE', payload: errorResponse });
      isAddingMessageRef.current = false;
    } finally {
      setIsTyping(false);
    }
  }, [currentSessionId, addMessage, isConfigured, canvasState, handleAlegeonRequest, stopStreaming, stopStratixStreaming, stopAlegeonStreaming, sendMessageToN8n, handleStratixRequest]);

  const handleClearConversation = useCallback(() => {
    console.log('useMessages: Clearing conversation');
    dispatch({ type: 'SET_MESSAGES', payload: initialMessages as ExtendedMessage[] });
    stopStreaming();
    stopAlegeonStreaming();
    // Clear processed completions on conversation clear
    processedCompletionsRef.current.clear();
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
    messages: messages as Message[], // Cast back to Message[] for external use
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
