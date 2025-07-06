
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface NexusConversation {
  id: string;
  question: string;
  response: string;
  created_at: string;
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

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.response) {
        throw new Error('No response received from Nexus');
      }

      // Add the new conversation to the local state
      const newConversation: NexusConversation = {
        id: Date.now().toString(), // Temporary ID
        question: question.trim(),
        response: data.response,
        created_at: new Date().toISOString()
      };

      setConversations(prev => [...prev, newConversation]);

      toast({
        title: "Response received",
        description: "Nexus has analyzed your question",
      });

      return true;
    } catch (error) {
      console.error('Error asking Nexus:', error);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response from Nexus",
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

    // File type specific suggestions
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

  return {
    conversations,
    loading,
    loadingHistory,
    askQuestion,
    loadConversationHistory,
    clearConversations,
    getSuggestedQuestions
  };
};
