import { useCallback, useRef } from 'react';
import { useDeerFlowStore, DeerMessage, ToolCall, FeedbackOption } from '@/stores/deerFlowStore';
import { fetchStream } from '@/utils/fetchStream';
import { toast } from '@/hooks/use-toast';

interface ChatStreamRequest {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  resources: string[];
  thread_id: string;
  max_plan_iterations: number;
  max_step_number: number;
  max_search_results: number;
  deep_thinking: boolean;
  background_investigation: boolean;
  report_style: string;
  interrupt_feedback?: string;
}

export const useStreamingChat = () => {
  const { 
    messages, 
    settings, 
    isResponding,
    setIsResponding, 
    addMessage, 
    addMessageWithId,
    existsMessage,
    updateMessage,
    setResearchPanelOpen 
  } = useDeerFlowStore();
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const mergeMessage = useCallback((messageId: string, eventData: any) => {
    const { content, reasoning_content, finish_reason } = eventData;
    
    if (!existsMessage(messageId)) {
      return; // Message doesn't exist, shouldn't happen
    }

    // Get current message to build update
    const currentMessage = messages.find(msg => msg.id === messageId);
    if (!currentMessage) return;

    updateMessage(messageId, {
      content: (currentMessage.content || '') + (content || ''),
      metadata: {
        ...currentMessage.metadata,
        reasoningContent: (currentMessage.metadata?.reasoningContent || '') + (reasoning_content || ''),
      },
      isStreaming: !finish_reason,
    });
  }, [existsMessage, updateMessage, messages]);

  const mergeToolCall = useCallback((messageId: string, toolCall: any) => {
    if (!existsMessage(messageId)) {
      return;
    }

    const currentMessage = messages.find(msg => msg.id === messageId);
    if (!currentMessage) return;

    const existing = currentMessage.toolCalls || [];
    const existingIndex = existing.findIndex(tc => tc.id === toolCall.id);
    
    if (existingIndex >= 0) {
      // Update existing tool call
      const updated = [...existing];
      updated[existingIndex] = { ...updated[existingIndex], ...toolCall };
      updateMessage(messageId, { toolCalls: updated });
    } else {
      // Add new tool call
      updateMessage(messageId, { toolCalls: [...existing, toolCall] });
    }
  }, [existsMessage, updateMessage, messages]);

  const mergeToolCallChunk = useCallback((messageId: string, chunkData: any) => {
    const { id, index, chunk } = chunkData;
    
    if (!existsMessage(messageId)) {
      return;
    }

    const currentMessage = messages.find(msg => msg.id === messageId);
    if (!currentMessage) return;

    const existing = currentMessage.toolCalls || [];
    const toolCallIndex = existing.findIndex(tc => tc.id === id);
    
    if (toolCallIndex >= 0) {
      const updated = [...existing];
      const toolCall = updated[toolCallIndex];
      const argsChunks = toolCall.argsChunks || [];
      argsChunks[index] = chunk;
      updated[toolCallIndex] = { ...toolCall, argsChunks };
      updateMessage(messageId, { toolCalls: updated });
    }
  }, [existsMessage, updateMessage, messages]);

  const finalizeToolCalls = useCallback((messageId: string) => {
    if (!existsMessage(messageId)) {
      return;
    }

    const currentMessage = messages.find(msg => msg.id === messageId);
    if (!currentMessage) return;

    const finalizedToolCalls = (currentMessage.toolCalls || []).map(toolCall => {
      if (toolCall.argsChunks) {
        try {
          const argsString = toolCall.argsChunks.join('');
          const args = JSON.parse(argsString);
          return { ...toolCall, args, argsChunks: undefined };
        } catch (error) {
          console.error('Failed to parse tool call args:', error);
          return toolCall;
        }
      }
      return toolCall;
    });

    updateMessage(messageId, { toolCalls: finalizedToolCalls });
  }, [existsMessage, updateMessage, messages]);

  const handleMessageChunk = useCallback((eventData: any) => {
    const { id, agent, role, content, reasoning_content, finish_reason } = eventData;

    if (!existsMessage(id)) {
      // Create new message
      const newMessage: DeerMessage = {
        id,
        role: 'assistant', // All backend messages are 'assistant', agent determines type
        content: content || '',
        timestamp: new Date(),
        isStreaming: true,
        metadata: {
          agent,
          reasoningContent: reasoning_content || '',
        },
      };
      addMessageWithId(newMessage);

      // Open research panel for research agents
      if (agent === 'coder' || agent === 'researcher' || agent === 'reporter') {
        setResearchPanelOpen(true);
      }
    } else {
      // Merge into existing message
      mergeMessage(id, eventData);
    }
  }, [existsMessage, addMessageWithId, mergeMessage, setResearchPanelOpen]);

  const handleToolCall = useCallback((eventData: any) => {
    const { id: messageId, tool_calls } = eventData;
    
    if (tool_calls && Array.isArray(tool_calls)) {
      tool_calls.forEach((toolCall: any) => {
        mergeToolCall(messageId, {
          id: toolCall.id,
          name: toolCall.name,
          args: toolCall.args || {},
        });
      });
    }
  }, [mergeToolCall]);

  const handleToolCallChunk = useCallback((eventData: any) => {
    const { id: messageId, tool_call_id, index, chunk } = eventData;
    mergeToolCallChunk(messageId, { id: tool_call_id, index, chunk });
  }, [mergeToolCallChunk]);

  const handleToolCallResult = useCallback((eventData: any) => {
    const { id: messageId, tool_call_id, result } = eventData;
    
    if (!existsMessage(messageId)) {
      return;
    }

    const currentMessage = messages.find(msg => msg.id === messageId);
    if (!currentMessage) return;

    const updatedToolCalls = (currentMessage.toolCalls || []).map(toolCall => 
      toolCall.id === tool_call_id 
        ? { ...toolCall, result }
        : toolCall
    );

    updateMessage(messageId, { toolCalls: updatedToolCalls });
  }, [existsMessage, updateMessage, messages]);

  const handleInterrupt = useCallback((eventData: any) => {
    const { options } = eventData;
    
    if (options) {
      // Find the last assistant message with planner agent and add options to it
      const lastPlannerMessage = [...messages].reverse().find(msg => 
        msg.role === 'assistant' && msg.metadata?.agent === 'planner'
      );
      
      if (lastPlannerMessage) {
        updateMessage(lastPlannerMessage.id, {
          isStreaming: false,
          options: options as FeedbackOption[],
        });
      }
    }
  }, [messages, updateMessage]);

  const sendMessage = useCallback(async (userMessage: string) => {
    // Add user message
    addMessage({
      role: 'user',
      content: userMessage,
    });

    setIsResponding(true);
    abortControllerRef.current = new AbortController();

    try {
      const requestBody: ChatStreamRequest = {
        messages: [
          ...messages.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          })),
          {
            role: 'user',
            content: userMessage,
          }
        ],
        resources: [],
        thread_id: '__default__',
        max_plan_iterations: settings.maxPlanIterations,
        max_step_number: settings.maxStepNum,
        max_search_results: settings.maxSearchResults,
        deep_thinking: settings.deepThinking,
        background_investigation: settings.backgroundInvestigation,
        report_style: settings.reportStyle,
      };

      const stream = fetchStream(
        'https://deer-flow-wrappers.up.railway.app/api/chat/stream',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: abortControllerRef.current.signal,
        }
      );

      for await (const { event, data: dataStr } of stream) {
        if (abortControllerRef.current?.signal.aborted) break;

        try {
          const eventData = JSON.parse(dataStr);

          switch (event) {
            case 'message_chunk':
              handleMessageChunk(eventData);
              if (eventData.finish_reason === 'tool_calls') {
                finalizeToolCalls(eventData.id);
              }
              break;
            case 'tool_calls':
              handleToolCall(eventData);
              break;
            case 'tool_call_chunks':
              handleToolCallChunk(eventData);
              break;
            case 'tool_call_result':
              handleToolCallResult(eventData);
              break;
            case 'interrupt':
              handleInterrupt(eventData);
              break;
            case 'done':
              console.log('Stream completed');
              break;
            case 'error':
              console.error('Stream error:', eventData);
              toast({
                title: "Error",
                description: eventData.error || "An error occurred during streaming",
                variant: "destructive",
              });
              break;
            default:
              console.log('Unknown event:', event, eventData);
          }
        } catch (error) {
          console.error('Error parsing event data:', error);
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error in sendMessage:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to the AI assistant",
          variant: "destructive",
        });
      }
    } finally {
      setIsResponding(false);
      abortControllerRef.current = null;
    }
  }, [
    messages, 
    settings, 
    addMessage, 
    setIsResponding, 
    handleMessageChunk, 
    handleToolCall, 
    handleToolCallChunk,
    handleToolCallResult, 
    handleInterrupt,
    finalizeToolCalls
  ]);

  const sendFeedback = useCallback(async (feedback: string) => {
    // Add acknowledgment message
    const acknowledgmentMessage = feedback === 'accepted' 
      ? "Great, let's start the research!"
      : "Let me revise the plan.";
      
    addMessage({
      role: 'user',
      content: acknowledgmentMessage,
    });

    setIsResponding(true);
    abortControllerRef.current = new AbortController();

    try {
      const requestBody: ChatStreamRequest = {
        messages: [
          ...messages.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          })),
          {
            role: 'user',
            content: acknowledgmentMessage,
          }
        ],
        resources: [],
        thread_id: '__default__',
        max_plan_iterations: settings.maxPlanIterations,
        max_step_number: settings.maxStepNum,
        max_search_results: settings.maxSearchResults,
        deep_thinking: settings.deepThinking,
        background_investigation: settings.backgroundInvestigation,
        report_style: settings.reportStyle,
        interrupt_feedback: feedback,
      };

      const stream = fetchStream(
        'https://deer-flow-wrappers.up.railway.app/api/chat/stream',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: abortControllerRef.current.signal,
        }
      );

      for await (const { event, data: dataStr } of stream) {
        if (abortControllerRef.current?.signal.aborted) break;

        try {
          const eventData = JSON.parse(dataStr);

          switch (event) {
            case 'message_chunk':
              handleMessageChunk(eventData);
              if (eventData.finish_reason === 'tool_calls') {
                finalizeToolCalls(eventData.id);
              }
              break;
            case 'tool_calls':
              handleToolCall(eventData);
              break;
            case 'tool_call_chunks':
              handleToolCallChunk(eventData);
              break;
            case 'tool_call_result':
              handleToolCallResult(eventData);
              break;
            case 'interrupt':
              handleInterrupt(eventData);
              break;
            case 'done':
              console.log('Stream completed');
              break;
            case 'error':
              console.error('Stream error:', eventData);
              toast({
                title: "Error",
                description: eventData.error || "An error occurred during streaming",
                variant: "destructive",
              });
              break;
            default:
              console.log('Unknown event:', event, eventData);
          }
        } catch (error) {
          console.error('Error parsing event data:', error);
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error in sendFeedback:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to the AI assistant",
          variant: "destructive",
        });
      }
    } finally {
      setIsResponding(false);
      abortControllerRef.current = null;
    }
  }, [
    messages, 
    settings, 
    addMessage, 
    setIsResponding, 
    handleMessageChunk, 
    handleToolCall, 
    handleToolCallChunk,
    handleToolCallResult, 
    handleInterrupt,
    finalizeToolCalls
  ]);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsResponding(false);
  }, [setIsResponding]);

  const enhancePrompt = useCallback(async (prompt: string): Promise<string> => {
    try {
      const response = await fetch('https://deer-flow-wrappers.up.railway.app/api/enhance-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance prompt');
      }

      const data = await response.json();
      return data.enhanced_prompt || prompt;
    } catch (error) {
      console.error('Error enhancing prompt:', error);
      toast({
        title: "Enhancement Error",
        description: "Failed to enhance prompt",
        variant: "destructive",
      });
      return prompt;
    }
  }, []);

  const generatePodcast = useCallback(async (content: string): Promise<void> => {
    try {
      const response = await fetch('https://deer-flow-wrappers.up.railway.app/api/generate-podcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate podcast');
      }

      const data = await response.json();
      
      // Add podcast message
      addMessage({
        role: 'assistant',
        content: JSON.stringify({
          title: data.title || 'Generated Podcast',
          audioUrl: data.audioUrl,
        }),
        metadata: {
          agent: 'podcast',
          title: data.title || 'Generated Podcast',
          audioUrl: data.audioUrl,
        },
      });

      toast({
        title: "Podcast Generated",
        description: "Your podcast has been generated successfully!",
      });
    } catch (error) {
      console.error('Error generating podcast:', error);
      toast({
        title: "Podcast Error",
        description: "Failed to generate podcast",
        variant: "destructive",
      });
    }
  }, [addMessage]);

  return {
    sendMessage,
    sendFeedback,
    stopStreaming,
    enhancePrompt,
    generatePodcast,
    isStreaming: isResponding,
  };
};