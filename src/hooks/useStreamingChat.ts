import { useCallback } from 'react';
import { useDeerFlowStore } from '@/stores/deerFlowStore';
import { DeerMessage } from '@/stores/deerFlowMessageStore';
import { useEnhancedStreaming } from './useEnhancedStreaming';
import { useToast } from '@/hooks/use-toast';

/**
 * @interface ChatStreamRequest
 * @description Structure of the request payload sent to the streaming API
 */
interface ChatStreamRequest {
  messages: Array<{
    role: string;
    content: string;
    agent?: string;
  }>;
  resources: any[];
  thread_id: string;
  max_plan_iterations: number;
  max_step_number: number;
  max_search_results: number;
  deep_thinking: boolean;
  background_investigation: boolean;
  report_style: string;
}

export const useStreamingChat = () => {
  const { 
    messages, 
    addMessage, 
    settings,
    currentThreadId
  } = useDeerFlowStore();

  const { toast } = useToast();
  const { startStreaming, stopStreaming, streamingState } = useEnhancedStreaming();

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;

    // Add user message immediately
    const userMsg: Omit<DeerMessage, 'id' | 'timestamp'> = {
      role: 'user',
      content: userMessage.trim(),
      isStreaming: false,
    };
    
    addMessage(userMsg);

    // Prepare request data
    const requestData: ChatStreamRequest = {
      messages: [
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          agent: msg.metadata?.agent
        })),
        {
          role: 'user',
          content: userMessage.trim()
        }
      ],
      resources: [],
      thread_id: currentThreadId,
      max_plan_iterations: settings.maxPlanIterations,
      max_step_number: settings.maxStepNum,
      max_search_results: settings.maxSearchResults,
      deep_thinking: settings.deepThinking,
      background_investigation: settings.backgroundInvestigation,
      report_style: settings.reportStyle,
    };

    try {
      await startStreaming('/api/chat/stream', requestData);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast({
        title: "Message Failed",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    }
  }, [messages, settings, currentThreadId, addMessage, startStreaming, toast]);

  const sendFeedback = useCallback(async (feedback: string) => {
    if (!feedback.trim()) return;

    const requestData = {
      messages: [
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          agent: msg.metadata?.agent
        }))
      ],
      resources: [],
      thread_id: currentThreadId,
      max_plan_iterations: settings.maxPlanIterations,
      max_step_number: settings.maxStepNum,
      max_search_results: settings.maxSearchResults,
      deep_thinking: settings.deepThinking,
      background_investigation: settings.backgroundInvestigation,
      report_style: settings.reportStyle,
      interrupt_feedback: feedback,
    };

    try {
      await startStreaming('/api/deer-feedback-stream', requestData);
    } catch (error: any) {
      console.error('Failed to send feedback:', error);
      toast({
        title: "Feedback Failed",
        description: error.message || "Failed to send feedback",
        variant: "destructive",
      });
    }
  }, [messages, settings, currentThreadId, startStreaming, toast]);

  const enhancePrompt = useCallback(async (prompt: string): Promise<string> => {
    if (!prompt.trim()) return prompt;

    try {
      const response = await fetch('/api/prompt/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.enhanced_prompt || prompt;
    } catch (error: any) {
      console.error('Failed to enhance prompt:', error);
      toast({
        title: "Enhancement Failed",
        description: error.message || "Failed to enhance prompt",
        variant: "destructive",
      });
      return prompt;
    }
  }, [toast]);

  const generatePodcast = useCallback(async (content: string) => {
    if (!content.trim()) return;

    try {
      const response = await fetch('/api/podcast/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.audio_url) {
        const podcastMessage: Omit<DeerMessage, 'id' | 'timestamp'> = {
          role: 'assistant',
          content: `Podcast generated from the content`,
          isStreaming: false,
          metadata: {
            agent: 'podcast',
            title: 'Generated Podcast',
            audioUrl: data.audio_url,
          }
        };
        
        addMessage(podcastMessage);
        
        toast({
          title: "Podcast Generated",
          description: "Your podcast is ready to listen!",
        });
      }
    } catch (error: any) {
      console.error('Failed to generate podcast:', error);
      toast({
        title: "Podcast Generation Failed",
        description: error.message || "Failed to generate podcast",
        variant: "destructive",
      });
    }
  }, [addMessage, toast]);

  return {
    sendMessage,
    sendFeedback,
    stopStreaming,
    enhancePrompt,
    generatePodcast,
    isStreaming: streamingState.isStreaming
  };
};