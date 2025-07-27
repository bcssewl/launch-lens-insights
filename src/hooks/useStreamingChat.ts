import { useCallback, useRef } from 'react';
import { useDeerFlowStore } from '@/stores/deerFlowStore';
import { fetchStream } from '@/utils/fetchStream';
import { toast } from '@/hooks/use-toast';

const DEERFLOW_BASE_URL = 'https://deer-flow-wrappers.up.railway.app';

interface ChatStreamRequest {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  resources: any[];
  thread_id: string;
  max_plan_iterations: number;
  max_step_num: number;
  max_search_results: number;
  auto_accepted_plan: boolean;
  interrupt_feedback: any;
  enable_deep_thinking: boolean;
  enable_background_investigation: boolean;
  report_style: string;
  mcp_settings: any;
}

export const useStreamingChat = () => {
  const { 
    messages, 
    settings, 
    addMessage, 
    updateMessage, 
    setIsResponding,
    addResearchActivity,
    setReportContent,
    setResearchPanelOpen 
  } = useDeerFlowStore();
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentAssistantMessageRef = useRef<string | null>(null);
  const currentResearchIdRef = useRef<string | null>(null);

  const sendMessage = useCallback(async (userMessage: string) => {
    // Add user message to store
    addMessage({
      role: 'user',
      content: userMessage,
    });

    setIsResponding(true);
    
    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      // Prepare request body
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
        max_step_num: settings.maxStepNumber,
        max_search_results: settings.maxSearchResults,
        auto_accepted_plan: false,
        interrupt_feedback: null,
        enable_deep_thinking: settings.deepThinking,
        enable_background_investigation: settings.backgroundInvestigation,
        report_style: settings.reportStyle,
        mcp_settings: {}
      };

      // Start streaming
      const streamGenerator = fetchStream(`${DEERFLOW_BASE_URL}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal,
      });

      for await (const { event, data } of streamGenerator) {
        try {
          const eventData = JSON.parse(data);
          
          switch (event) {
            case 'message_chunk':
              handleMessageChunk(eventData);
              break;
            case 'tool_calls':
            case 'tool_call_chunks':
              handleToolCall(eventData);
              break;
            case 'tool_call_result':
              handleToolCallResult(eventData);
              break;
            case 'interrupt':
              handleInterrupt(eventData);
              break;
            default:
              console.log('Unknown event type:', event, eventData);
          }
        } catch (parseError) {
          console.error('Error parsing event data:', parseError);
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Streaming error:', error);
        toast({
          title: "Error",
          description: "Failed to get response from AI assistant",
          variant: "destructive",
        });
      }
    } finally {
      setIsResponding(false);
      currentAssistantMessageRef.current = null;
      currentResearchIdRef.current = null;
      abortControllerRef.current = null;
    }
  }, [messages, settings, addMessage, updateMessage, setIsResponding, addResearchActivity, setReportContent, setResearchPanelOpen]);

  const handleMessageChunk = useCallback((eventData: any) => {
    const { id, agent, role, content, reasoning_content } = eventData;

    // Determine message type based on agent
    if (agent === 'coordinator' || agent === 'planner') {
      // Assistant or planner message
      if (currentAssistantMessageRef.current !== id) {
        // New message
        currentAssistantMessageRef.current = id;
        addMessage({
          role: agent === 'planner' ? 'planner' : 'assistant',
          content: content || '',
          metadata: {
            reasoningContent: reasoning_content || '',
          }
        });
      } else {
        // Update existing message
        updateMessage(id, {
          content: content || '',
          metadata: {
            reasoningContent: reasoning_content || '',
          }
        });
      }
    } else if (agent === 'coder' || agent === 'researcher' || agent === 'reporter') {
      // Research activity
      if (!currentResearchIdRef.current) {
        currentResearchIdRef.current = id;
        setResearchPanelOpen(true);
      }

      if (agent === 'reporter' && content) {
        // Final research report
        setReportContent(content);
        addMessage({
          role: 'research',
          content,
          metadata: {
            researchState: 'report_generated'
          }
        });
      } else {
        // Research activity
        addResearchActivity({
          toolType: agent === 'coder' ? 'python' : 'web-search',
          title: `${agent} activity`,
          content: content || reasoning_content || '',
          status: content ? 'completed' : 'running',
        });
      }
    }
  }, [addMessage, updateMessage, addResearchActivity, setReportContent, setResearchPanelOpen]);

  const handleToolCall = useCallback((eventData: any) => {
    console.log('Tool call:', eventData);
    // Add tool call visualization if needed
  }, []);

  const handleToolCallResult = useCallback((eventData: any) => {
    console.log('Tool call result:', eventData);
    // Handle tool call results if needed
  }, []);

  const handleInterrupt = useCallback((eventData: any) => {
    console.log('Interrupt received:', eventData);
    // Handle plan acceptance/rejection UI
    const { options } = eventData;
    if (options && currentAssistantMessageRef.current) {
      updateMessage(currentAssistantMessageRef.current, {
        metadata: {
          options: options.map((opt: any) => ({
            title: opt.label || opt.title,
            value: opt.value || opt.action,
          }))
        }
      });
    }
  }, [updateMessage]);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const enhancePrompt = useCallback(async (prompt: string): Promise<string> => {
    try {
      const response = await fetch(`${DEERFLOW_BASE_URL}/api/prompt/enhance`, {
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
      return data.result || prompt;
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
      const response = await fetch(`${DEERFLOW_BASE_URL}/api/podcast/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content,
          voice: 'female_english'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate podcast');
      }

      // Get the MP3 blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Add podcast message to chat
      addMessage({
        role: 'podcast',
        content: 'Podcast generated from research report',
        metadata: {
          audioUrl,
          title: 'Research Report Podcast'
        }
      });

      toast({
        title: "Podcast Generated",
        description: "Your research report has been converted to audio",
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
    stopStreaming,
    enhancePrompt,
    generatePodcast,
    isStreaming: abortControllerRef.current !== null,
  };
};