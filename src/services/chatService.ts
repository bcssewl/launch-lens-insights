/**
 * @file chatService.ts
 * @description Service module for orchestrating chat API calls and state updates
 */

import { v4 as uuidv4 } from 'uuid';
import { fetchStream } from '@/utils/fetchStream';
import { useChatStore } from '@/stores/chatStore';
import { Message, ChatEvent } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';

interface ChatOptions {
  model?: string;
  researchType?: string;
  sessionId?: string;
  endpoint?: string;
}

interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Sends a message and handles the streaming response
 */
export async function sendMessage(
  userMessage: string, 
  feedback?: string,
  options: ChatOptions = {}
): Promise<SendMessageResult> {
  const { appendMessage, updateMessage, setResponding } = useChatStore.getState();
  
  console.log('📨 sendMessage called with:', { userMessage, feedback, options });
  
  // Handle DeerFlow model routing
  if (options.model === 'deer') {
    console.log('🦌 Routing to DeerFlow service');
    const { sendDeerFlowMessage, sendDeerFlowFeedback } = await import('./deerflowService');
    
    if (feedback) {
      // This is feedback for an existing DeerFlow conversation
      const { currentThreadId } = useChatStore.getState();
      if (currentThreadId) {
        return await sendDeerFlowFeedback(feedback, currentThreadId);
      }
    } else {
      // This is a new DeerFlow message
      return await sendDeerFlowMessage(userMessage, {
        threadId: '__default__',
        autoAcceptedPlan: false
      });
    }
  }
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Generate message IDs
    const userMessageId = uuidv4();
    const assistantMessageId = uuidv4();
    const clientMessageId = uuidv4();

    // Add user message immediately
    const userMsg: Message = {
      id: userMessageId,
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    appendMessage(userMsg);

    // Set responding state
    setResponding(true);

    // Prepare request body
    const requestBody = {
      message: userMessage,
      ...(feedback && { feedback }),
      user: {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || '',
        created_at: user.created_at
      },
      ...(options.sessionId && { session_id: options.sessionId }),
      client_message_id: clientMessageId,
      ...(options.model && { model: options.model }),
      ...(options.researchType && { research_type: options.researchType })
    };

    // Determine endpoint
    const endpoint = options.endpoint || 'n8n-chat-webhook';
    const { data } = await supabase.functions.invoke(endpoint, {
      body: requestBody
    });

    if (!data?.stream_url) {
      throw new Error('No stream URL received from server');
    }

    // Create assistant message shell
    const assistantMsg: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      metadata: { isCompleted: false }
    };
    appendMessage(assistantMsg);

    // Process the stream
    let hasStarted = false;
    
    for await (const { event, data: eventData } of fetchStream(data.stream_url)) {
      if (!hasStarted) {
        hasStarted = true;
      }

      // Parse event data
      let parsedData;
      try {
        parsedData = JSON.parse(eventData);
      } catch {
        // If not JSON, treat as plain text
        parsedData = { content: eventData };
      }

      // Handle different event types
      switch (event) {
        case 'message_chunk': {
          const { content, role, agent } = parsedData;
          const currentMessage = useChatStore.getState().messages.find(m => m.id === assistantMessageId);
          updateMessage(assistantMessageId, {
            content: (currentMessage?.content || '') + (content || ''),
            ...(role && { role }),
            ...(agent && { agent })
          });
          break;
        }

        case 'tool_call': {
          const { id, name, args } = parsedData;
          const currentMessage = useChatStore.getState().messages.find(m => m.id === assistantMessageId);
          updateMessage(assistantMessageId, {
            toolCalls: [
              ...(currentMessage?.toolCalls || []),
              { id, name, args }
            ]
          });
          break;
        }

        case 'tool_call_result': {
          // For now, we'll just log the result since metadata doesn't support it
          console.log('Tool call result:', parsedData);
          break;
        }

        case 'thinking': {
          // Log thinking for now since metadata interface is limited
          console.log('Thinking:', parsedData);
          break;
        }

        case 'search': {
          // Log search for now since metadata interface is limited
          console.log('Search:', parsedData);
          break;
        }

        case 'reasoning': {
          // Log reasoning for now since metadata interface is limited
          console.log('Reasoning:', parsedData);
          break;
        }

        case 'interrupt': {
          // Handle interrupt events for workflow continuation
          const { content, options } = parsedData;
          const currentMessage = useChatStore.getState().messages.find(m => m.id === assistantMessageId);
          updateMessage(assistantMessageId, {
            content: content || currentMessage?.content || '',
            finishReason: 'interrupt',
            options: options || [],
            metadata: {
              ...assistantMsg.metadata,
              isInterrupted: true,
              isCompleted: false
            }
          });
          setResponding(false);
          break;
        }

        case 'done': {
          updateMessage(assistantMessageId, {
            metadata: {
              ...assistantMsg.metadata,
              isCompleted: true
            }
          });
          setResponding(false);
          break;
        }

        case 'error': {
          updateMessage(assistantMessageId, {
            content: `Error: ${parsedData.error || 'Unknown error occurred'}`,
            metadata: {
              ...assistantMsg.metadata,
              isCompleted: true
            }
          });
          setResponding(false);
          throw new Error(parsedData.error || 'Stream error');
        }

        default:
          // Handle unknown event types gracefully
          console.warn('Unknown event type:', event, parsedData);
          break;
      }
    }

    // Ensure responding is set to false on completion
    setResponding(false);

    return {
      success: true,
      messageId: assistantMessageId
    };

  } catch (error) {
    setResponding(false);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Clears all messages from the store
 */
export function clearMessages(): void {
  const { messages } = useChatStore.getState();
  useChatStore.setState({ messages: [] });
}

/**
 * Gets the current chat state
 */
export function getChatState() {
  return useChatStore.getState();
}