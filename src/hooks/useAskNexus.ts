
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface NexusConversation {
  id: string;
  question: string;
  response: string;
  created_at: string;
  cached?: boolean;
}

interface UseAskNexusProps {
  fileId: string;
}

export const useAskNexus = ({ fileId }: UseAskNexusProps) => {
  const [conversations, setConversations] = useState<NexusConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const { toast } = useToast();

  const loadConversationHistory = useCallback(async () => {
    if (!fileId) return;
    
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('nexus_conversations')
        .select('id, question, response, created_at')
        .eq('file_id', fileId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading conversation history:', error);
        toast({
          title: "Error",
          description: "Failed to load conversation history",
          variant: "destructive",
        });
        return;
      }

      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversation history:', error);
    } finally {
      setLoadingHistory(false);
    }
  }, [fileId, toast]);

  const askQuestion = useCallback(async (question: string): Promise<boolean> => {
    if (!question.trim() || !fileId) return false;

    setLoading(true);
    try {
      console.log('Asking Nexus question:', { question, fileId });

      const { data, error } = await supabase.functions.invoke('ask-nexus-gemini', {
        body: {
          question: question.trim(),
          fileId
        }
      });

      console.log('Ask Nexus response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.error) {
        if (data.needsExtraction) {
          toast({
            title: "Content Not Ready",
            description: "Please extract the file content first before asking questions.",
            variant: "destructive",
          });
          return false;
        }
        
        console.error('Function returned error:', data.error);
        throw new Error(data.error);
      }

      if (!data?.response) {
        console.error('No response from function:', data);
        throw new Error('No response received from Nexus');
      }

      // Add the new conversation to the local state
      const newConversation: NexusConversation = {
        id: Date.now().toString(),
        question: question.trim(),
        response: data.response,
        created_at: new Date().toISOString(),
        cached: data.cached || false
      };

      setConversations(prev => [...prev, newConversation]);

      const toastTitle = data.cached ? "Cached Response" : "Response received";
      const toastDescription = data.cached 
        ? `Found previous answer (used ${data.useCount} times)`
        : "Nexus has analyzed your question";

      toast({
        title: toastTitle,
        description: toastDescription,
      });

      return true;
    } catch (error) {
      console.error('Error asking Nexus:', error);
      
      let errorMessage = "Failed to get response from Nexus";
      
      if (error instanceof Error) {
        if (error.message.includes('File not found') || error.message.includes('content not accessible')) {
          errorMessage = "File content not yet extracted. Please extract content first.";
        } else if (error.message.includes('Text content not yet extracted')) {
          errorMessage = "File content is being processed. Please try again in a moment.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    } finally {
      setLoading(false);
    }
  }, [fileId, toast]);

  const clearConversations = useCallback(async () => {
    if (!fileId) return;

    try {
      const { error } = await supabase
        .from('nexus_conversations')
        .delete()
        .eq('file_id', fileId);

      if (error) {
        throw error;
      }

      setConversations([]);
      
      toast({
        title: "Conversations cleared",
        description: "All conversations for this file have been cleared",
      });
    } catch (error) {
      console.error('Error clearing conversations:', error);
      toast({
        title: "Error",
        description: "Failed to clear conversations",
        variant: "destructive",
      });
    }
  }, [fileId, toast]);

  const getSuggestedQuestions = useCallback((fileName: string, fileType: string): string[] => {
    const baseQuestions = [
      "What is this document about?",
      "Can you summarize the key points?",
      "What are the main topics covered?"
    ];

    if (fileType.includes('pdf') || fileType.includes('document')) {
      return [
        ...baseQuestions,
        "What are the important dates or deadlines mentioned?",
        "Are there any action items or recommendations?",
        "What data or statistics are presented?"
      ];
    }

    if (fileType.includes('presentation')) {
      return [
        ...baseQuestions,
        "What is the main message of this presentation?",
        "What are the key conclusions?",
        "What recommendations are made?"
      ];
    }

    if (fileType.includes('spreadsheet')) {
      return [
        "What data is contained in this file?",
        "What are the key metrics or numbers?",
        "Can you explain the data trends?",
        "What calculations or formulas are used?"
      ];
    }

    return baseQuestions;
  }, []);

  const getCacheStats = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('nexus_query_cache')
        .select('use_count, api_cost_estimate')
        .eq('file_id', fileId);

      if (error) {
        console.error('Error fetching cache stats:', error);
        return null;
      }

      const totalQueries = data?.length || 0;
      const totalUses = data?.reduce((sum, item) => sum + item.use_count, 0) || 0;
      const estimatedSavings = data?.reduce((sum, item) => sum + (item.api_cost_estimate * (item.use_count - 1)), 0) || 0;

      return {
        totalQueries,
        totalUses,
        estimatedSavings: estimatedSavings.toFixed(4)
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return null;
    }
  }, [fileId]);

  return {
    conversations,
    loading,
    loadingHistory,
    askQuestion,
    loadConversationHistory,
    clearConversations,
    getSuggestedQuestions,
    getCacheStats
  };
};
