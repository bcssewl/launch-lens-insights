/**
 * @file deerflowService.ts
 * @description Service for handling DeerFlow agent interactions with proper workflow management
 */

import { v4 as uuidv4 } from 'uuid';
import { fetchStream } from '@/utils/fetchStream';
import { useChatStore } from '@/stores/chatStore';
import { Message, FeedbackOption } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';

interface DeerFlowOptions {
  threadId?: string;
  autoAcceptedPlan?: boolean;
  maxPlanIterations?: number;
  maxStepNum?: number;
  maxSearchResults?: number;
  reportStyle?: string;
}

interface SendDeerFlowMessageResult {
  success: boolean;
  messageId?: string;
  threadId?: string;
  error?: string;
}

const DEERFLOW_API_URL = 'https://deer-flow-wrappers.up.railway.app/api/chat/stream';

/**
 * Sends a message to DeerFlow agent following the 3-stage workflow
 */
export async function sendDeerFlowMessage(
  userMessage: string,
  options: DeerFlowOptions = {}
): Promise<SendDeerFlowMessageResult> {
  const { appendMessage, updateMessage, setResponding, setCurrentThreadId } = useChatStore.getState();
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Generate message IDs
    const userMessageId = uuidv4();
    const assistantMessageId = uuidv4();

    // Add user message immediately (only for new conversations)
    if (!options.threadId || options.threadId === '__default__') {
      const userMsg: Message = {
        id: userMessageId,
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      };
      appendMessage(userMsg);
    }

    // Set responding state
    setResponding(true);

    // Prepare request body following DeerFlow protocol
    const requestBody = {
      messages: options.threadId && options.threadId !== '__default__' 
        ? [] // Empty array for continuing conversations
        : [{ role: 'user', content: userMessage }], // New conversation
      thread_id: options.threadId || '__default__',
      auto_accepted_plan: options.autoAcceptedPlan ?? false,
      max_plan_iterations: options.maxPlanIterations ?? 1,
      max_step_num: options.maxStepNum ?? 3,
      max_search_results: options.maxSearchResults ?? 3,
      enable_background_investigation: true,
      report_style: options.reportStyle ?? 'academic',
      enable_deep_thinking: false,
      debug: true
    };

    console.log('🦌 Sending DeerFlow request:', requestBody);

    // Create assistant message shell (only for new conversations)
    if (!options.threadId || options.threadId === '__default__') {
      const assistantMsg: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        metadata: { isCompleted: false }
      };
      appendMessage(assistantMsg);
    }

    let capturedThreadId: string | null = null;
    let currentMessageId = assistantMessageId;

    // Process the stream
    const requestInit: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    };

    // Add better error handling and logging
    console.log('🔗 Starting DeerFlow stream request...');
    
    try {
      for await (const { event, data: eventData } of fetchStream(DEERFLOW_API_URL, requestInit)) {
        console.log(`📨 Received DeerFlow event: ${event}`, eventData);
        
        // Parse event data - DeerFlow may send different formats
        let parsedData;
        try {
          parsedData = JSON.parse(eventData);
        } catch {
          // If not JSON, treat as raw content (markdown report)
          parsedData = { content: eventData };
        }
        
        console.log('📊 Parsed DeerFlow data:', parsedData);

        // Capture thread_id from first event
        if (!capturedThreadId && parsedData.thread_id) {
          capturedThreadId = parsedData.thread_id;
          setCurrentThreadId(capturedThreadId);
          console.log('🆔 Captured thread_id:', capturedThreadId);
        }

        // Handle different event types
        switch (event) {
          case 'message_chunk':
          case 'data': // DeerFlow might use 'data' event type
          case '': // Some APIs send events without explicit type
          default: {
            // Handle any content from DeerFlow
            const content = parsedData.content || parsedData.text || parsedData.message || eventData;
            
            if (content && content.trim()) {
              const currentMessage = useChatStore.getState().messages.find(m => m.id === currentMessageId);
              updateMessage(currentMessageId, {
                content: (currentMessage?.content || '') + content,
                threadId: capturedThreadId || undefined
              });
              
              console.log('📝 Updated message content, length:', ((currentMessage?.content || '') + content).length);
            }
            break;
          }

          case 'interrupt': {
            // This is the key event for DeerFlow workflow
            const { content, options: interruptOptions } = parsedData;
            
            updateMessage(currentMessageId, {
              content: content || 'Research plan generated. Please review and choose an option.',
              finishReason: 'interrupt',
              options: interruptOptions || [
                { title: 'Edit plan', value: 'edit_plan' },
                { title: 'Start research', value: 'accepted' }
              ],
              threadId: capturedThreadId || undefined,
              metadata: { 
                isCompleted: false,
                isInterrupted: true 
              }
            });
            
            console.log('🛑 Interrupt received with options:', interruptOptions);
            setResponding(false);
            break;
          }

          case 'tool_call': {
            const { id, name, args } = parsedData;
            const currentMessage = useChatStore.getState().messages.find(m => m.id === currentMessageId);
            updateMessage(currentMessageId, {
              toolCalls: [
                ...(currentMessage?.toolCalls || []),
                { id, name, args }
              ]
            });
            break;
          }

          case 'tool_call_result': {
            console.log('🔧 Tool call result:', parsedData);
            break;
          }

          case 'thinking':
          case 'reasoning': {
            console.log('🤔 Agent thinking:', parsedData);
            break;
          }

          case 'search': {
            console.log('🔍 Agent searching:', parsedData);
            break;
          }

          case 'done':
          case 'end':
          case 'complete': {
            updateMessage(currentMessageId, {
              metadata: {
                isCompleted: true,
                isInterrupted: false
              },
              threadId: capturedThreadId || undefined
            });
            setResponding(false);
            console.log('✅ DeerFlow stream completed');
            break;
          }

          case 'error': {
            updateMessage(currentMessageId, {
              content: `Error: ${parsedData.error || 'Unknown error occurred'}`,
              metadata: {
                isCompleted: true,
                isInterrupted: false
              }
            });
            setResponding(false);
            throw new Error(parsedData.error || 'Stream error');
          }
        }
      }
      
      console.log('✅ DeerFlow stream completed successfully');
    } catch (streamError) {
      console.error('❌ DeerFlow stream error:', streamError);
      
      // Create more descriptive error message
      let errorMessage = 'Unable to connect to DeerFlow service';
      if (streamError instanceof Error) {
        if (streamError.message.includes('CORS')) {
          errorMessage = 'DeerFlow API has CORS restrictions. Please try a different model.';
        } else if (streamError.message.includes('timeout')) {
          errorMessage = 'DeerFlow API is taking too long to respond. Please try again.';
        } else if (streamError.message.includes('404')) {
          errorMessage = 'DeerFlow API endpoint not found. The service may be unavailable.';
        } else {
          errorMessage = `DeerFlow API error: ${streamError.message}`;
        }
      }
      
      // Update the message with error info
      updateMessage(currentMessageId, {
        content: `⚠️ **DeerFlow Service Error**\n\n${errorMessage}\n\nPlease try:\n1. Selecting a different AI model (Algeon or ii-Research)\n2. Refreshing the page and trying again\n3. Checking your internet connection`,
        metadata: { isCompleted: true }
      });
      
      throw streamError;
    }

    return {
      success: true,
      messageId: currentMessageId,
      threadId: capturedThreadId || undefined
    };

  } catch (error) {
    setResponding(false);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ DeerFlow error:', errorMessage);
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Sends feedback for interrupted DeerFlow conversations
 */
export async function sendDeerFlowFeedback(
  feedbackValue: string,
  threadId: string
): Promise<SendDeerFlowMessageResult> {
  const { setResponding, updateMessage, appendMessage } = useChatStore.getState();
  
  try {
    setResponding(true);
    
    // Create new assistant message for the continuation
    const assistantMessageId = uuidv4();
    const assistantMsg: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      threadId,
      metadata: { isCompleted: false }
    };
    appendMessage(assistantMsg);

    // Prepare feedback request body
    const requestBody = {
      messages: [], // Empty array for continuing conversation
      thread_id: threadId,
      interrupt_feedback: feedbackValue,
      auto_accepted_plan: false,
      debug: true
    };

    console.log('🔄 Sending DeerFlow feedback:', requestBody);

    // Process the continuation stream
    const requestInit: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    };

    for await (const { event, data: eventData } of fetchStream(DEERFLOW_API_URL, requestInit)) {
      let parsedData;
      try {
        parsedData = JSON.parse(eventData);
      } catch {
        parsedData = { content: eventData };
      }

      // Handle continuation events
      switch (event) {
        case 'message_chunk': {
          const { content } = parsedData;
          const currentMessage = useChatStore.getState().messages.find(m => m.id === assistantMessageId);
          updateMessage(assistantMessageId, {
            content: (currentMessage?.content || '') + (content || '')
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

        case 'done': {
          updateMessage(assistantMessageId, {
            metadata: { isCompleted: true }
          });
          setResponding(false);
          break;
        }

        case 'error': {
          updateMessage(assistantMessageId, {
            content: `Error: ${parsedData.error || 'Unknown error occurred'}`,
            metadata: { isCompleted: true }
          });
          setResponding(false);
          throw new Error(parsedData.error || 'Feedback error');
        }
      }
    }

    return {
      success: true,
      messageId: assistantMessageId,
      threadId
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