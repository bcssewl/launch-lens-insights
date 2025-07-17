import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/components/ui/use-toast"
import { useCanvas } from '@/hooks/useCanvas';
import { useAlegeonStreaming } from '@/hooks/useAlegeonStreaming';
import { Message } from '@/constants/aiAssistant';
import { getChatHistory, saveChatHistory } from '@/utils/chatHistory';
import { isReportMessage } from '@/utils/reportDetection';
import type { StratixStreamingState } from '@/types/stratixStreaming';

const STREAMING_MESSAGE_ID = 'streaming-message';

interface Metadata {
  isCompleted?: boolean;
  messageType?: 'progress_update' | 'completed_report' | 'standard' | 'stratix_conversation';
}

export const useMessages = (sessionId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const viewportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { canvasState, openCanvas, closeCanvas, downloadCanvas, printCanvas, downloadCanvasPdf } = useCanvas();
  const alegeonStreaming = useAlegeonStreaming();

  // Add message deduplication helper
  const addOrUpdateMessage = useCallback((newMessage: Message) => {
    setMessages(prevMessages => {
      // Check if this is a duplicate based on content and timestamp proximity
      const isDuplicate = prevMessages.some(msg => 
        msg.sender === newMessage.sender &&
        msg.text === newMessage.text &&
        Math.abs(new Date(msg.timestamp).getTime() - new Date(newMessage.timestamp).getTime()) < 1000 // Within 1 second
      );

      if (isDuplicate) {
        console.log('🚫 useMessages: Duplicate message detected, skipping:', {
          content: newMessage.text.substring(0, 50),
          timestamp: newMessage.timestamp
        });
        return prevMessages;
      }

      // Check if we should replace a streaming message
      const streamingIndex = prevMessages.findIndex(msg => 
        msg.id === STREAMING_MESSAGE_ID || 
        (msg.metadata?.messageType === 'progress_update' && !msg.metadata?.isCompleted)
      );

      if (streamingIndex !== -1 && newMessage.metadata?.messageType === 'completed_report') {
        console.log('🔄 useMessages: Replacing streaming message with completed report');
        const updatedMessages = [...prevMessages];
        updatedMessages[streamingIndex] = {
          ...newMessage,
          metadata: { ...newMessage.metadata, isCompleted: true }
        };
        return updatedMessages;
      }

      // Add new message normally
      return [...prevMessages, newMessage];
    });
  }, []);

  const loadHistory = useCallback(async (sessionIdToLoad: string | null) => {
    setIsLoadingHistory(true);
    if (!sessionIdToLoad) {
      setMessages([]);
      setIsLoadingHistory(false);
      return;
    }

    try {
      const history = await getChatHistory(sessionIdToLoad);
      if (history) {
        setMessages(history);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      toast({
        variant: "destructive",
        title: "Error loading chat history",
        description: "Please try again."
      });
      setMessages([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [toast]);

  useEffect(() => {
    loadHistory(sessionId);
  }, [sessionId, loadHistory]);

  useEffect(() => {
    if (sessionId) {
      saveChatHistory(sessionId, messages);
    }
  }, [messages, sessionId]);

  const handleSendMessage = useCallback(async (
    text: string,
    attachments?: any[],
    selectedModel?: string,
    researchType?: string
  ) => {
    if (!text.trim() && !attachments) {
      toast({
        title: "Please enter a message",
      });
      return;
    }

    setIsTyping(true);

    const userMessage: Message = {
      id: uuidv4(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    addOrUpdateMessage(userMessage);

    try {
      const modelToUse = selectedModel || 'default';
      console.log('useMessages: Sending message to webhook with model:', modelToUse, 'research type:', researchType);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text.trim(),
          attachments: attachments,
          model: modelToUse,
          sessionId: sessionId,
          researchType: researchType
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Webhook error:', errorData);
        toast({
          variant: "destructive",
          title: "Webhook error",
          description: errorData.message || "Please try again."
        });
        return;
      }

      if (researchType === 'algeon') {
        console.log('🔬 useMessages: Starting Algeon streaming');
        
        // Start Algeon streaming
        alegeonStreaming.startStreaming();
        
        // Add streaming message
        const streamingMessage: Message = {
          id: STREAMING_MESSAGE_ID,
          text: '',
          sender: 'ai',
          timestamp: new Date(),
          metadata: { 
            messageType: 'progress_update',
            isCompleted: false
          },
          isStreaming: true
        };
        
        addOrUpdateMessage(streamingMessage);
        
        // Process the response
        if (response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') {
                    console.log('🏁 useMessages: Algeon streaming completed');
                    
                    // Complete the streaming and create final message
                    const finalText = alegeonStreaming.streamingState.bufferedText;
                    const finalCitations = alegeonStreaming.streamingState.citations;
                    
                    alegeonStreaming.completeStreaming();
                    
                    // Create the final completed message
                    const completedMessage: Message = {
                      id: uuidv4(),
                      text: finalText,
                      sender: 'ai',
                      timestamp: new Date(),
                      metadata: { 
                        messageType: 'completed_report',
                        isCompleted: true
                      },
                      alegeonCitations: finalCitations
                    };
                    
                    // Replace streaming message with completed message
                    setMessages(prevMessages => {
                      const filteredMessages = prevMessages.filter(msg => 
                        msg.id !== STREAMING_MESSAGE_ID && 
                        !(msg.metadata?.messageType === 'progress_update' && !msg.metadata?.isCompleted)
                      );
                      return [...filteredMessages, completedMessage];
                    });
                    
                    break;
                  }
                  
                  try {
                    const parsed = JSON.parse(data);
                    
                    if (parsed.type === 'chunk' && parsed.content) {
                      alegeonStreaming.processChunk(parsed.content);
                    } else if (parsed.type === 'citations' && parsed.citations) {
                      alegeonStreaming.processCitations(parsed.citations);
                    }
                  } catch (parseError) {
                    console.error('🚨 useMessages: Error parsing streaming data:', parseError);
                  }
                }
              }
            }
          } catch (streamError) {
            console.error('🚨 useMessages: Streaming error:', streamError);
            alegeonStreaming.setError('Streaming connection interrupted');
          }
        }
      } else {
        let aiResponse = '';
        let isStreaming = false;
        let currentPhase = '';
        let progress = 0;
        let error: string | null = null;
        let errorCode: string | undefined;
        let retryAfter: number | undefined;
        let searchQueries: string[] = [];
        let discoveredSources: Array<{ name: string; url: string; type: string; confidence: number; }> = [];
        let activeAgents: { name: string; status: 'active' | 'idle'; progress: number; }[] | undefined;
        let collaborationMode: string | undefined;

        const aiMessage: Message = {
          id: uuidv4(),
          text: aiResponse,
          sender: 'ai',
          timestamp: new Date(),
        };

        addOrUpdateMessage(aiMessage);

        if (response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                break;
              }
              buffer += decoder.decode(value, { stream: true });
              let lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (let line of lines) {
                if (line.startsWith('data:')) {
                  let data = line.substring(5).trim();
                  if (data) {
                    try {
                      const parsedData = JSON.parse(data);

                      if (parsedData.type === 'content') {
                        aiResponse += parsedData.content;
                        aiMessage.text = aiResponse;
                        addOrUpdateMessage(aiMessage);
                      } else if (parsedData.type === 'status') {
                        isStreaming = parsedData.streaming || false;
                        currentPhase = parsedData.phase || '';
                        progress = parsedData.progress || 0;
                        searchQueries = parsedData.searchQueries || [];
                        discoveredSources = parsedData.discoveredSources || [];
                        activeAgents = parsedData.activeAgents;
                        collaborationMode = parsedData.collaborationMode;
                      } else if (parsedData.type === 'error') {
                        error = parsedData.message;
                        errorCode = parsedData.code;
                        retryAfter = parsedData.retryAfter;
                      }
                    } catch (e) {
                      console.error('Error parsing JSON data:', e);
                    }
                  }
                }
              }
            }
          } catch (e) {
            console.error('Error reading stream:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error sending message",
        description: "Please try again."
      });
    } finally {
      setIsTyping(false);
    }
  }, [sessionId, addOrUpdateMessage, alegeonStreaming, toast]);

  const handleClearConversation = useCallback(() => {
    setMessages([]);
  }, []);

  const handleDownloadChat = useCallback(() => {
    const chatContent = messages.map(message => {
      return `${message.sender.toUpperCase()}: ${message.text}\n`;
    }).join('');

    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [messages]);

  const handleOpenCanvas = useCallback((messageId: string, content: string) => {
    console.log('useMessages: Opening canvas with message ID:', messageId);
    openCanvas(messageId, content);
  }, [openCanvas]);

  const handleCloseCanvas = useCallback(() => {
    console.log('useMessages: Closing canvas');
    closeCanvas();
  }, [closeCanvas]);

  const handleCanvasDownload = useCallback(() => {
    console.log('useMessages: Downloading canvas');
    downloadCanvas();
  }, [downloadCanvas]);

  const handleCanvasPrint = useCallback(() => {
    console.log('useMessages: Printing canvas');
    printCanvas();
  }, [printCanvas]);

  const handleCanvasPdfDownload = useCallback(() => {
    console.log('useMessages: Downloading canvas as PDF');
    downloadCanvasPdf();
  }, [downloadCanvasPdf]);

  const isConfigured = process.env.NEXT_PUBLIC_WEBHOOK_URL ? true : false;

  return {
    messages,
    isTyping,
    isLoadingHistory,
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
    streamingState: {
      isStreaming: false,
      currentPhase: '',
      progress: 0,
      searchQueries: [],
      discoveredSources: [],
    },
    stratixStreamingState: {
      isStreaming: false,
      displayedText: '',
      updates: [],
      sources: [],
      progress: { phase: '', progress: 0 },
    },
    alegeonStreamingState: alegeonStreaming.streamingState,
  };
};
