import { useCallback, useState } from 'react';
import { nanoid } from 'nanoid';
import { useDeerFlowMessageStore } from '@/stores/deerFlowMessageStore';
import { useToast } from '@/hooks/use-toast';

interface PodcastGenerationOptions {
  voice?: string;
  format?: string;
  speed?: number;
}

export const usePodcastGeneration = () => {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const { addMessageWithId, updateMessage, getMessage } = useDeerFlowMessageStore();
  const { toast } = useToast();

  const generatePodcast = useCallback(async (
    researchId: string,
    title: string,
    content: string,
    options: PodcastGenerationOptions = {}
  ) => {
    setIsGenerating(researchId);
    
    try {
      // 1. Create user request message
      addMessageWithId({
        id: nanoid(),
        role: "user",
        content: "Please generate a podcast for the above research.",
        contentChunks: ["Please generate a podcast for the above research."],
        threadId: useDeerFlowMessageStore.getState().currentThreadId,
        timestamp: new Date(),
      });
      
      // 2. Create streaming podcast message
      const podcastMessageId = nanoid();
      const podcastObject = { title, researchId };
      
      addMessageWithId({
        id: podcastMessageId,
        role: "assistant",
        agent: "podcast",
        content: JSON.stringify(podcastObject),
        contentChunks: [],
        isStreaming: true,
        threadId: useDeerFlowMessageStore.getState().currentThreadId,
        timestamp: new Date(),
      });
      
      // 3. Mock podcast generation (will be replaced with real API)
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate generation time
      
      // For now, create a mock audio URL
      const mockAudioUrl = `data:audio/mp3;base64,mock-audio-data-${researchId}`;
      
      // 4. Update with "generated" podcast
      updateMessage(podcastMessageId, {
        content: JSON.stringify({ 
          ...podcastObject, 
          audioUrl: mockAudioUrl 
        }),
        isStreaming: false,
      });
      
      toast({
        title: "Podcast Generated",
        description: "Your research podcast is ready to listen!",
      });
      
      return mockAudioUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      toast({
        title: "Podcast Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsGenerating(null);
    }
  }, [addMessageWithId, updateMessage, toast]);

  const isGeneratingPodcast = useCallback((researchId: string) => {
    return isGenerating === researchId;
  }, [isGenerating]);

  return {
    generatePodcast,
    isGeneratingPodcast,
  };
};