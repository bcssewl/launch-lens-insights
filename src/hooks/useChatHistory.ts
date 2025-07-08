
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ChatHistoryItem {
  id: string;
  session_id: string;
  message: string;
  created_at: string;
}

export const useChatHistory = (sessionId: string | null) => {
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (sessionId) {
      fetchHistory();
    } else {
      setHistory([]);
      setIsInitialLoad(false);
    }
  }, [sessionId]);

  const fetchHistory = async () => {
    if (!sessionId) return;

    console.log('useChatHistory: Fetching history for session:', sessionId);
    setLoading(true);
    setIsInitialLoad(true);
    
    try {
      const { data, error } = await supabase
        .from('n8n_chat_history')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      console.log('useChatHistory: Fetched history:', data?.length, 'messages');
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  const clearHistory = async () => {
    if (!sessionId) return;

    console.log('useChatHistory: Clearing history for session:', sessionId);
    try {
      const { error } = await supabase
        .from('n8n_chat_history')
        .delete()
        .eq('session_id', sessionId);

      if (error) throw error;
      setHistory([]);
      
      console.log('useChatHistory: History cleared successfully');
    } catch (error) {
      console.error('Error clearing chat history:', error);
      toast({
        title: "Error",
        description: "Failed to clear chat history",
        variant: "destructive",
      });
    }
  };

  return {
    history,
    loading,
    isInitialLoad,
    clearHistory,
    refreshHistory: fetchHistory,
  };
};
