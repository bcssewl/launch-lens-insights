
import { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, initialMessages, formatTimestamp } from '@/constants/aiAssistant';
import { useN8nWebhook } from '@/hooks/useN8nWebhook';
import { useChatHistory } from '@/hooks/useChatHistory';
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
      console.log('Routing ALL input to Stratix backend...');
      
      // Send ALL user input to backend - let backend decide conversation vs research
      const { data, error } = await supabase.functions.invoke('stratix-router', {
        body: {
          prompt,
          sessionId,
          deepDive: false // Could be made configurable
        }
      });

      if (error) {
        console.error('Stratix request error:', error);
        throw new Error(`Stratix request failed: ${error.message}`);
      }
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Debug: Log the response structure
      console.log('Stratix response received:', {
        hasProjectId: !!data.projectId,
        hasResponse: !!data.response,
        hasMessage: !!data.message,
        analysisDepth: data.analysis_depth,
        methodology: data.methodology,
        finalAnswer: data.final_answer,
        keys: Object.keys(data)
      });

      // ONLY start research if explicitly indicated by backend
      // Must have both projectId AND explicit research indicators
      const isExplicitResearch = data.projectId && (
        data.analysis_depth === "research" || 
        data.analysis_depth === "deep_research" ||
        (data.methodology && data.methodology !== "Conversational Response" && data.methodology !== "Direct Response")
      );

      // Safety check: Never start research for simple conversational inputs
      const isSimpleConversation = /^(hello|hi|hey|how are you|thanks|thank you|good|great|ok|okay)[\s\?\.!]*$/i.test(prompt.trim());
      
      if (isExplicitResearch && !isSimpleConversation) {
        console.log('Backend explicitly requested research project:', data.projectId);
        console.log('Research indicators:', { 
          analysis_depth: data.analysis_depth, 
          methodology: data.methodology 
        });
        startStratixStream(data.projectId);
        
        return `🔍 **Starting Stratix Research...**

Initializing comprehensive market research and analysis.`;
      }
      
      // For ALL other cases (conversations, direct responses), return backend response
      if (data.response || data.message || data.final_answer) {
        const backendResponse = data.response || data.message || data.final_answer;
        console.log('Displaying backend response directly - Type:', {
          methodology: data.methodology,
          analysis_depth: data.analysis_depth,
          hasProjectId: !!data.projectId
        });
        return backendResponse;
      }
      
      // If no response from backend, this is an error
      throw new Error('No response received from Stratix backend');

    } catch (error) {
      console.error('Stratix communication error:', error);
      throw new Error(`Failed to communicate with Stratix: ${error.message}`);
    }
  }, []);

  const startStratixStream = useCallback((projectId: string) => {
    console.log('Starting Stratix stream for project:', projectId);
    
    let pollInterval: NodeJS.Timeout;
    let timeoutInterval: NodeJS.Timeout;
    let lastEventTime = new Date().toISOString();
    let progressMessageId: string | null = null;
    let currentProgress = '';
    
    // Add a timeout to prevent infinite polling for simple conversations
    timeoutInterval = setTimeout(() => {
      console.log('Research polling timeout - stopping and providing fallback message');
      clearInterval(pollInterval);
      updateProgressMessage(`❌ **Research Timeout**\n\nThis request might be better suited for a direct conversation. Let me respond directly instead of running research.`);
    }, 30000); // 30 second timeout
    
    const updateProgressMessage = (newContent: string) => {
      currentProgress = newContent;
      setMessages(prev => {
        if (!progressMessageId) {
          // Create new progress message
          const progressMessage: Message = {
            id: uuidv4(),
            text: newContent,
            sender: 'ai',
            timestamp: new Date(),
            metadata: {
              messageType: 'progress_update'
            }
          };
          progressMessageId = progressMessage.id;
          return [...prev, progressMessage];
        } else {
          // Update existing progress message
          return prev.map(msg => 
            msg.id === progressMessageId 
              ? { ...msg, text: newContent, timestamp: new Date() }
              : msg
          );
        }
      });
    };
    
    const pollForUpdates = async () => {
      try {
        // Get new events from the project
        const { data: events, error } = await supabase
          .from('stratix_events')
          .select('*')
          .eq('project_id', projectId)
          .gt('created_at', lastEventTime)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching Stratix events:', error);
          return;
        }

        // Process new events
        if (events && events.length > 0) {
          for (const event of events) {
            const eventData = event.event_data as any;
            console.log('Stratix event:', eventData);

            // Handle different event types with real-time updates
            switch (eventData?.type) {
              case 'agent_start':
                updateProgressMessage(`🤖 **${eventData.agent || 'Research Agent'} Activated**\n\n${eventData.message || 'Starting analysis...'}`);
                break;
                
              case 'source_discovered':
                updateProgressMessage(`${currentProgress}\n\n📖 **Source Found:** ${eventData.source_name}\n*${eventData.agent || 'Agent'} is analyzing this source...*`);
                break;
                
              case 'agent_progress':
                updateProgressMessage(`${currentProgress}\n\n⚡ **${eventData.agent || 'Agent'} Update:** ${eventData.message || 'Processing...'}`);
                break;
                
              case 'intermediate_result':
                updateProgressMessage(`${currentProgress}\n\n📊 **Preliminary Finding:**\n${eventData.content || eventData.message}`);
                break;
                
              case 'research_complete':
                // Final result received - replace progress with final result
                const finalAnswer = eventData?.final_answer || eventData?.content;
                if (finalAnswer) {
                  formatStratixResults(finalAnswer, eventData, projectId).then(async formattedText => {
                    const finalResponse: Message = {
                      id: uuidv4(),
                      text: formattedText,
                      sender: 'ai',
                      timestamp: new Date(),
                      metadata: {
                        isCompleted: true,
                        messageType: 'completed_report'
                      }
                    };
                    
                    // CRITICAL: Save to chat history BEFORE updating UI
                    if (currentSessionId) {
                      try {
                        console.log('Saving Stratix report to chat history...', formattedText.length, 'characters');
                        await addMessage(`AI: ${formattedText}`);
                        console.log('Successfully saved Stratix report to chat history');
                      } catch (error) {
                        console.error('Failed to save Stratix report to chat history:', error);
                        // Don't throw - still update UI even if save fails
                      }
                    }
                    
                    setMessages(prev => {
                      // Remove progress message and add final result
                      const filteredMessages = progressMessageId 
                        ? prev.filter(msg => msg.id !== progressMessageId)
                        : prev;
                      return [...filteredMessages, finalResponse];
                    });
                  });
                }
                
                // Stop polling when research is complete
                clearInterval(pollInterval);
                clearTimeout(timeoutInterval);
                return;
                
              default:
                // Handle any other event types
                if (eventData.message) {
                  updateProgressMessage(`${currentProgress}\n\n🔄 **Research Update:** ${eventData.message}`);
                }
                break;
            }
            
            // Update last event time to newest event's timestamp
            lastEventTime = event.created_at;
          }
        }

        // Check if project is complete or in error state
        const { data: project } = await supabase
          .from('stratix_projects')
          .select('status')
          .eq('id', projectId)
          .single();

        if (project) {
          if (project.status === 'done') {
            // Get final result if we haven't received it via events
            const { data: result } = await supabase
              .from('stratix_results')
              .select('*')
              .eq('project_id', projectId)
              .single();
            
            if (result && !currentProgress.includes('Research Report')) {
              formatStratixResults(result.content, result, projectId).then(async formattedText => {
                const finalResponse: Message = {
                  id: uuidv4(),
                  text: formattedText,
                  sender: 'ai',
                  timestamp: new Date(),
                  metadata: {
                    isCompleted: true,
                    messageType: 'completed_report'
                  }
                };
                
                // CRITICAL: Save to chat history BEFORE updating UI
                if (currentSessionId) {
                  try {
                    console.log('Saving final Stratix result to chat history...', formattedText.length, 'characters');
                    await addMessage(`AI: ${formattedText}`);
                    console.log('Successfully saved final Stratix result to chat history');
                  } catch (error) {
                    console.error('Failed to save final Stratix result to chat history:', error);
                    // Don't throw - still update UI even if save fails
                  }
                }
                
                setMessages(prev => {
                  const filteredMessages = progressMessageId 
                    ? prev.filter(msg => msg.id !== progressMessageId)
                    : prev;
                  return [...filteredMessages, finalResponse];
                });
              });
            }
            
            clearInterval(pollInterval);
            clearTimeout(timeoutInterval);
          } else if (project.status === 'error') {
            console.log('Research project failed, providing helpful error message');
            updateProgressMessage(`❌ **Unable to Complete Research**\n\nThis request might not require research, or there was a technical issue. For simple questions or conversations, I can respond directly without research. Please try rephrasing your message or ask me something specific about market research, competitive analysis, or business insights.`);
            clearInterval(pollInterval);
            clearTimeout(timeoutInterval);
          }
        }
      } catch (error) {
        console.error('Error polling Stratix updates:', error);
      }
    };

    // Poll every 1.5 seconds for updates (slightly faster for better UX)
    pollInterval = setInterval(pollForUpdates, 1500);
    
    // Initial poll
    pollForUpdates();

    // Clean up on component unmount
    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeoutInterval);
    };
  }, [currentSessionId, addMessage]);

  const formatStratixResults = useCallback(async (content: string, eventData?: any, projectId?: string): Promise<string> => {
    let formattedResponse = "# 📊 Stratix Research Report\n\n";
    
    // Add the main content
    formattedResponse += content + "\n\n";
    
    // Add metadata if available
    if (eventData) {
      formattedResponse += "## Research Details\n\n";
      
      if (eventData.confidence) {
        const confidence = Math.round((eventData.confidence || 0) * 100);
        const confidenceIcon = confidence >= 85 ? '🟢' : confidence >= 70 ? '🟡' : '🔴';
        formattedResponse += `${confidenceIcon} **Research Confidence:** ${confidence}%\n\n`;
      }
      
      if (eventData.agents_consulted && Array.isArray(eventData.agents_consulted)) {
        formattedResponse += "**🤖 Agents Consulted:** " + eventData.agents_consulted.join(', ') + "\n\n";
      }
      
      if (eventData.methodology) {
        formattedResponse += "**📋 Methodology:** " + eventData.methodology + "\n\n";
      }
      
      if (eventData.processing_time) {
        const timeInSeconds = Math.round(eventData.processing_time / 1000);
        formattedResponse += `**⏱️ Processing Time:** ${timeInSeconds} seconds\n\n`;
      }
    }
    
    // Try to get citations if projectId is available
    if (projectId || eventData?.project_id) {
      try {
        const { data: citations } = await supabase
          .from('stratix_citations')
          .select('*')
          .eq('project_id', projectId || eventData.project_id)
          .eq('clickable', true);
        
        if (citations && citations.length > 0) {
          formattedResponse += "## 📚 Sources & References\n\n";
          citations.forEach((citation, index) => {
            if (citation.source_url) {
              formattedResponse += `${index + 1}. **[${citation.source_name}](${citation.source_url})**`;
            } else {
              formattedResponse += `${index + 1}. **${citation.source_name}**`;
            }
            if (citation.agent) {
              formattedResponse += ` *(via ${citation.agent})*`;
            }
            formattedResponse += "\n";
          });
          formattedResponse += "\n";
        }
      } catch (error) {
        console.error('Error fetching citations:', error);
      }
    }
    
    formattedResponse += "---\n\n*✅ Research completed by Stratix Research Agent*";
    
    return formattedResponse;
  }, []);

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
    handleCanvasPdfDownload
  };
};
