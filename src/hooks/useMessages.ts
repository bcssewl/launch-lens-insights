import { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, initialMessages, formatTimestamp } from '@/constants/aiAssistant';
import { useN8nWebhook } from '@/hooks/useN8nWebhook';
import { useChatHistory } from '@/hooks/useChatHistory';
import { useStratixStreaming } from '@/hooks/useStratixStreaming';
import { supabase } from '@/integrations/supabase/client';

// Configuration constants
const WEBSOCKET_TIMEOUT_MS = 300000; // 5 minutes for complex processing

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
  
  // Only use Stratix streaming now
  const { 
    streamingState: stratixStreamingState, 
    startStreaming: startStratixStreaming, 
    stopStreaming: stopStratixStreaming 
  } = useStratixStreaming();

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

  // Always use Stratix for research queries - no model detection needed
  const handleStratixRequest = useCallback(async (prompt: string, sessionId: string | null): Promise<string> => {
    if (!sessionId) {
      throw new Error('Session ID required for Stratix communication');
    }

    try {
      console.log('🎯 Using new Stratix agent for:', prompt.substring(0, 100));
      
      // Stop any existing streaming
      stopStratixStreaming();
      
      // Use the new Stratix streaming directly
      return await startStratixStreaming(prompt, sessionId);

    } catch (error) {
      console.error('❌ Stratix communication error:', error);
      
      // Ensure streaming is stopped on error
      stopStratixStreaming();
      
      // Return a helpful error message
      return 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.';
    }
  }, [startStratixStreaming, stopStratixStreaming]);

  // Simplified message handling - always use Stratix
  const handleSendMessage = useCallback(async (text?: string, messageText?: string) => {
    const finalMessageText = text || messageText;
    if (!finalMessageText || finalMessageText.trim() === '') return;

    console.log('🚀 useMessages: Sending message to Stratix in session:', currentSessionId);

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
    
    try {
      let aiResponseText: string;

      // Always use Stratix now
      console.log('🎯 Using Stratix agent for all requests');
      
      let contextMessage = finalMessageText;
      if (canvasState.isOpen && canvasState.content) {
        contextMessage = `Current document content:\n\n${canvasState.content}\n\n---\n\nUser message: ${finalMessageText}`;
      }
      
      aiResponseText = await handleStratixRequest(contextMessage, currentSessionId);
      
      // Don't create message if response is empty
      if (!aiResponseText || aiResponseText.trim() === '') {
        console.warn('Received empty response from Stratix service');
        aiResponseText = "I apologize, but I didn't receive a proper response. Please try asking your question again.";
      }
      
      console.log('✅ Creating Stratix response message with text:', aiResponseText.substring(0, 100) + '...');
      
      const aiResponse: Message = {
        id: uuidv4(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date(),
        metadata: {
          messageType: 'stratix_conversation'
        },
      };
      
      setMessages(prev => {
        const newMessages = [...prev, aiResponse];
        console.log('📝 Updated messages array, new length:', newMessages.length);
        console.log('📝 Last message:', newMessages[newMessages.length - 1]);
        
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
      
      const errorResponse: Message = {
        id: uuidv4(),
        text: `I'm having trouble accessing my capabilities right now, but I'm still here to help! Please feel free to ask me about business strategy, market analysis, or any startup-related questions.`,
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
  }, [currentSessionId, addMessage, isConfigured, canvasState, handleStratixRequest]);

  const handleClearConversation = useCallback(() => {
    console.log('useMessages: Clearing conversation');
    setMessages(initialMessages);
    stopStratixStreaming();
  }, [stopStratixStreaming]);

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
    // Only return Stratix streaming state now
    streamingState: { isStreaming: false, currentPhase: '', progress: 0, error: null, searchQueries: [], discoveredSources: [] },
    stratixStreamingState,
    // Provide streaming state for components that need it
    isStreamingForMessage: () => stratixStreamingState.isStreaming,
    getStreamingState: () => ({ isStreaming: false, currentPhase: '', progress: 0, error: null, searchQueries: [], discoveredSources: [] }),
    getStratixStreamingState: () => stratixStreamingState
  };
};
