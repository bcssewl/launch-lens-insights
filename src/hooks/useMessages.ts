import { useState, useRef, useEffect, useCallback, useReducer } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, initialMessages, formatTimestamp } from '@/constants/aiAssistant';
import { useN8nWebhook } from '@/hooks/useN8nWebhook';
import { useChatHistory } from '@/hooks/useChatHistory';
import { usePerplexityStreaming } from '@/hooks/usePerplexityStreaming';
import { useStratixStreaming } from '@/hooks/useStratixStreaming';
import { useAlegeonStreamingV2 } from '@/hooks/useAlegeonStreamingV2';
import { useIIResearchStreaming } from '@/hooks/useIIResearchStreaming';
import { useDeerStreaming } from '@/hooks/useDeerStreaming';
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
    stopStreaming: stopAlegeonStreaming,
    fastForward: alegeonFastForward
  } = useAlegeonStreamingV2(currentSessionId);
  const { 
    streamingState: iiResearchStreamingState, 
    startStreaming: startIIResearch, 
    stopStreaming: stopIIResearch 
  } = useIIResearchStreaming();
  const { 
    streamingState: deerStreamingState, 
    startStreaming: startDeerStreaming, 
    stopStreaming: stopDeerStreaming 
  } = useDeerStreaming();

  // Consistent streaming message ID
  const STREAMING_MESSAGE_ID = 'algeon-streaming-message';
  const isAddingMessageRef = useRef(false);
  const alegeonCompletionProcessedRef = useRef<boolean>(false); // Track if completion was processed
  const currentStreamingSessionRef = useRef<string | null>(null); // Track current streaming session

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

  // Handle Algeon streaming state changes - separated into two effects
  // Effect 1: Handle streaming messages (display updates)
  useEffect(() => {
    if (alegeonStreamingState.isStreaming && alegeonStreamingState.hasContent && alegeonStreamingState.bufferedText) {
      console.log('📝 Managing Algeon V2 streaming message display');
      
      const streamingMessage: ExtendedMessage = {
        id: STREAMING_MESSAGE_ID,
        text: alegeonStreamingState.bufferedText,
        sender: 'ai',
        timestamp: new Date(),
        isStreaming: true,
        metadata: {
          messageType: 'progress_update',
          isCompleted: false
        },
        alegeonCitations: alegeonStreamingState.citations?.map(citation => ({
          name: citation.title,
          url: citation.url,
          type: citation.description
        }))
      };
      
      dispatch({ type: 'ADD_STREAMING_MESSAGE', payload: streamingMessage });
    }
  }, [
    alegeonStreamingState.isStreaming, 
    alegeonStreamingState.hasContent,
    alegeonStreamingState.bufferedText,
    alegeonStreamingState.citations
  ]);

  // Handle II-Research streaming state changes
  useEffect(() => {
    if (iiResearchStreamingState.isStreaming) {
      console.log('📝 Managing II-Research streaming message display');
      
      let progressText = 'Starting research...';
      
      // Update progress text based on current phase
      switch (iiResearchStreamingState.currentPhase) {
        case 'connecting':
          progressText = 'Connecting to research system...';
          break;
        case 'connected':
          progressText = 'Connected. Initializing research...';
          break;
        case 'using_tools':
          progressText = 'Gathering information from various sources...';
          break;
        case 'reasoning':
          progressText = `Analyzing data...\n\n${iiResearchStreamingState.currentReasoning}`;
          break;
        case 'gathering_sources':
          progressText = `Visiting and analyzing web sources (${iiResearchStreamingState.sources.length} sources found)...\n\n${iiResearchStreamingState.currentReasoning}`;
          break;
        case 'writing_report':
          progressText = 'Compiling final research report...';
          break;
        default:
          progressText = iiResearchStreamingState.currentReasoning || 'Researching...';
      }
      
      // Add thought steps summary if available
      if (iiResearchStreamingState.thoughtSteps.length > 0) {
        const recentSteps = iiResearchStreamingState.thoughtSteps.slice(-3);
        progressText += '\n\n**Recent Activity:**\n' + recentSteps.map(step => `• ${step.content}`).join('\n');
      }
      
      const streamingMessage: ExtendedMessage = {
        id: STREAMING_MESSAGE_ID,
        text: progressText,
        sender: 'ai',
        timestamp: new Date(),
        isStreaming: true,
        metadata: {
          messageType: 'progress_update',
          isCompleted: false
        }
      };
      
      dispatch({ type: 'ADD_STREAMING_MESSAGE', payload: streamingMessage });
    }
  }, [
    iiResearchStreamingState.isStreaming,
    iiResearchStreamingState.currentPhase,
    iiResearchStreamingState.currentReasoning,
    iiResearchStreamingState.thoughtSteps,
    iiResearchStreamingState.sources
  ]);

  // Effect 2: Handle completion (final message creation) - ONCE per session
  useEffect(() => {
    if (alegeonStreamingState.isComplete && 
        alegeonStreamingState.bufferedText && 
        !alegeonCompletionProcessedRef.current) {
        
      console.log('✅ Processing Algeon V2 completion - ONE TIME ONLY');
      alegeonCompletionProcessedRef.current = true; // Mark as processed immediately
      
      // Create final message with citations preserved
      const finalMessage: ExtendedMessage = {
        id: uuidv4(),
        text: alegeonStreamingState.bufferedText,
        sender: 'ai',
        timestamp: new Date(),
        metadata: {
          messageType: 'completed_report',
          isCompleted: true
        },
        alegeonCitations: alegeonStreamingState.citations?.map(citation => ({
          name: citation.title,
          url: citation.url,
          type: citation.description
        }))
      };
      
      dispatch({ 
        type: 'REPLACE_STREAMING_WITH_FINAL', 
        payload: { finalMessage, streamingId: STREAMING_MESSAGE_ID }
      });
      
      // Save final message to history with citations metadata - ONCE
      if (currentSessionId && alegeonStreamingState.bufferedText) {
        const messageWithCitations = `AI: ${alegeonStreamingState.bufferedText}${
          alegeonStreamingState.citations.length > 0 
            ? `\n\nCitations: ${JSON.stringify(alegeonStreamingState.citations)}`
            : ''
        }`;
        
        console.log('💾 Saving Algeon V2 completion to history - ONE TIME');
        addMessage(messageWithCitations);

        // Auto-title generation - only once per completion
        if (updateSessionTitle && sessionTitle && shouldGenerateTitle(history.length + 1, sessionTitle)) {
          const userMessages = history.filter(h => h.message.startsWith('USER:'));
          if (userMessages.length > 0) {
            const firstUserMessage = userMessages[0].message.substring(5).trim();
            console.log('🏷️ Triggering auto-title generation - ONE TIME');
            generateAndSetTitle(currentSessionId, firstUserMessage, alegeonStreamingState.bufferedText, updateSessionTitle);
          }
        }
      }
    }
  }, [
    alegeonStreamingState.isComplete,
    alegeonStreamingState.bufferedText,
    alegeonStreamingState.citations,
    currentSessionId,
    addMessage,
    updateSessionTitle,
    sessionTitle,
    shouldGenerateTitle,
    generateAndSetTitle,
    history
  ]);

  // Reset completion flag when new streaming starts
  useEffect(() => {
    if (alegeonStreamingState.isStreaming && !alegeonCompletionProcessedRef.current) {
      const newSessionId = `${Date.now()}-${Math.random()}`;
      if (currentStreamingSessionRef.current !== newSessionId) {
        console.log('🔄 New Algeon V2 streaming session started - resetting completion flag');
        currentStreamingSessionRef.current = newSessionId;
        alegeonCompletionProcessedRef.current = false;
      }
    }
  }, [alegeonStreamingState.isStreaming]);

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

  // Handle Algeon requests with enhanced citation support - Updated for V2
  const handleAlegeonRequest = useCallback(async (message: string, researchType?: string, sessionId?: string | null, clientMessageId?: string): Promise<string> => {
    try {
      console.log('🔬 Starting Algeon V2 streaming for message:', message.substring(0, 100));
      
      // Reset completion flag for new request
      alegeonCompletionProcessedRef.current = false;
      
      // Use the V2 Algeon streaming implementation
      const result = await startAlegeonStreaming(message, researchType as any, clientMessageId);
      
      console.log('✅ Algeon V2 request completed:', {
        textLength: result.length
      });
      
      return result;
      
    } catch (error) {
      console.error('❌ Algeon V2 streaming failed:', error);
      dispatch({ type: 'REMOVE_STREAMING_MESSAGE', payload: STREAMING_MESSAGE_ID });
      alegeonCompletionProcessedRef.current = false; // Reset on error
      return 'I apologize, but I encountered an issue with the research system. Please try again or check your connection.';
    }
  }, [startAlegeonStreaming]);

  // Handle II-Research requests using Server-Sent Events
  const handleIIResearchRequest = useCallback(async (message: string): Promise<string> => {
    try {
      console.log('🔬 Starting II-Research SSE streaming for message:', message.substring(0, 100));
      
      // Create a streaming message to show progress
      const streamingMessage: ExtendedMessage = {
        id: STREAMING_MESSAGE_ID,
        text: 'Starting research...',
        sender: 'ai',
        timestamp: new Date(),
        isStreaming: true,
        metadata: {
          messageType: 'progress_update',
          isCompleted: false
        }
      };
      
      dispatch({ type: 'ADD_STREAMING_MESSAGE', payload: streamingMessage });
      
      // Use the II-Research streaming implementation
      const result = await startIIResearch(message);
      
      console.log('✅ II-Research request completed:', {
        finalAnswer: result.finalAnswer?.substring(0, 100),
        sourcesCount: result.sources?.length || 0,
        thoughtStepsCount: result.thoughtSteps?.length || 0
      });
      
      // Enhanced validation and content extraction
      let finalContent = result.finalAnswer || '';
      
      if (!finalContent || finalContent.trim().length === 0) {
        console.warn('useMessages: Final answer is empty, trying reasoning content');
        finalContent = result.reasoning || '';
      }
      
      if (!finalContent || finalContent.trim().length === 0) {
        console.warn('useMessages: No meaningful content found, using fallback');
        finalContent = 'Research completed but no detailed report was generated. Please check the thought process and sources for more information.';
      }
      
      console.log('useMessages: Using final content length:', finalContent.length);
      
      return finalContent;
      
    } catch (error) {
      console.error('❌ II-Research streaming failed:', error);
      dispatch({ type: 'REMOVE_STREAMING_MESSAGE', payload: STREAMING_MESSAGE_ID });
      return 'I apologize, but I encountered an issue with the II-Research system. Please try again or check your connection.';
    }
  }, [startIIResearch]);

  // Handle Deer requests using Server-Sent Events
  const handleDeerRequest = useCallback(async (message: string): Promise<string> => {
    try {
      console.log('🦌 Starting Deer SSE streaming for message:', message.substring(0, 100));
      
      // Create a streaming message to show progress
      const streamingMessage: ExtendedMessage = {
        id: STREAMING_MESSAGE_ID,
        text: 'Starting Deer processing...',
        sender: 'ai',
        timestamp: new Date(),
        isStreaming: true,
        metadata: {
          messageType: 'progress_update',
          isCompleted: false
        }
      };
      
      dispatch({ type: 'ADD_STREAMING_MESSAGE', payload: streamingMessage });
      
      // Use the Deer streaming implementation
      const result = await startDeerStreaming(message);
      
      console.log('✅ Deer request completed:', {
        finalAnswer: result.finalAnswer?.substring(0, 100),
        sourcesCount: result.sources?.length || 0,
        thoughtStepsCount: result.thoughtSteps?.length || 0
      });
      
      // Enhanced validation and content extraction
      let finalContent = result.finalAnswer || '';
      
      if (!finalContent || finalContent.trim().length === 0) {
        console.warn('useMessages: Deer final answer is empty, trying reasoning content');
        finalContent = result.reasoning || '';
      }
      
      if (!finalContent || finalContent.trim().length === 0) {
        console.warn('useMessages: No meaningful content found, using fallback');
        finalContent = 'Processing completed but no detailed response was generated. Please check the thought process and sources for more information.';
      }
      
      console.log('useMessages: Using Deer final content length:', finalContent.length);
      
      return finalContent;
      
    } catch (error) {
      console.error('❌ Deer streaming failed:', error);
      dispatch({ type: 'REMOVE_STREAMING_MESSAGE', payload: STREAMING_MESSAGE_ID });
      return 'I apologize, but I encountered an issue with the Deer system. Please try again or check your connection.';
    }
  }, [startDeerStreaming]);

  const handleSendMessage = useCallback(async (text?: string, messageText?: string, selectedModel?: string, researchType?: string, sessionIdOverride?: string) => {
    const finalMessageText = text || messageText;
    if (!finalMessageText || finalMessageText.trim() === '') return;

    console.log('🚀 useMessages: Routing request based on selected model:', selectedModel);

    isAddingMessageRef.current = true;

    // Generate client message ID for request-response correlation
    const clientMessageId = uuidv4();

    const newUserMessage: ExtendedMessage = {
      id: uuidv4(),
      text: finalMessageText,
      sender: 'user',
      timestamp: new Date(),
      clientMessageId,
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
    stopIIResearch();
    stopDeerStreaming();
    
    // Remove any existing streaming messages
    dispatch({ type: 'REMOVE_STREAMING_MESSAGE', payload: STREAMING_MESSAGE_ID });
    
    // Reset completion flag for new request
    alegeonCompletionProcessedRef.current = false;
    
    try {
      let aiResponseText: string;

      // Route based on selected model
      if (selectedModel === 'ii-research') {
        console.log('🔬 Using II-Research SSE for request');
        aiResponseText = await handleIIResearchRequest(finalMessageText);
      } else if (selectedModel === 'deer') {
        console.log('🦌 Using Deer SSE for request');
        aiResponseText = await handleDeerRequest(finalMessageText);
        
        // For ii-research, create final message immediately since it's not handled by useEffect
        const finalMessage: ExtendedMessage = {
          id: uuidv4(),
          text: aiResponseText,
          sender: 'ai',
          timestamp: new Date(),
          metadata: {
            messageType: 'completed_report',
            isCompleted: true
          }
        };
        
        dispatch({ 
          type: 'REPLACE_STREAMING_WITH_FINAL', 
          payload: { finalMessage, streamingId: STREAMING_MESSAGE_ID }
        });
        
        // Save to history
        if (sessionIdToUse) {
          const messageWithSources = `AI: ${aiResponseText}${
            deerStreamingState.sources.length > 0 
              ? `\n\nSources: ${JSON.stringify(deerStreamingState.sources.map(s => ({ url: s.url, title: s.title })))}`
              : ''
          }`;
          addMessage(messageWithSources);
        }
      } else {
        // Default to Algeon WebSocket
        console.log('🔬 Using Algeon WebSocket for request');
        aiResponseText = await handleAlegeonRequest(finalMessageText, researchType, currentSessionId, clientMessageId);
        // Note: Final message handling is done in the useEffect above
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
        text: `I'm having trouble accessing my capabilities right now. Please try again in a moment.`,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      dispatch({ type: 'ADD_MESSAGE', payload: errorResponse });
      isAddingMessageRef.current = false;
      alegeonCompletionProcessedRef.current = false; // Reset on error
    } finally {
      setIsTyping(false);
    }
  }, [currentSessionId, addMessage, isConfigured, canvasState, handleAlegeonRequest, handleIIResearchRequest, handleDeerRequest, stopStreaming, stopStratixStreaming, stopAlegeonStreaming, stopIIResearch, stopDeerStreaming, deerStreamingState.sources]);

  const handleClearConversation = useCallback(() => {
    console.log('useMessages: Clearing conversation');
    dispatch({ type: 'SET_MESSAGES', payload: initialMessages as ExtendedMessage[] });
    stopStreaming();
    stopAlegeonStreaming();
    // Reset completion flag on conversation clear
    alegeonCompletionProcessedRef.current = false;
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
    iiResearchStreamingState,
    deerStreamingState,
    // Provide streaming state for components that need it
    isStreamingForMessage: () => streamingState.isStreaming || stratixStreamingState.isStreaming || alegeonStreamingState.isStreaming || iiResearchStreamingState.isStreaming || deerStreamingState.isStreaming,
    getStreamingState: () => streamingState,
    getStratixStreamingState: () => stratixStreamingState,
    getAlegeonStreamingState: () => alegeonStreamingState,
    getIIResearchStreamingState: () => iiResearchStreamingState,
    alegeonFastForward
  };
};
