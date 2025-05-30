
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
  const { toast } = useToast();

  useEffect(() => {
    if (sessionId) {
      fetchHistory();
    } else {
      setHistory([]);
    }
  }, [sessionId]);

  const fetchHistory = async () => {
    if (!sessionId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('n8n_chat_history')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
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
    }
  };

  const addMessage = async (message: string) => {
    if (!sessionId) return null;

    try {
      const { data, error } = await supabase
        .from('n8n_chat_history')
        .insert([
          {
            session_id: sessionId,
            message,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setHistory(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error adding message to history:', error);
      toast({
        title: "Error",
        description: "Failed to save message",
        variant: "destructive",
      });
      return null;
    }
  };

  const clearHistory = async () => {
    if (!sessionId) return;

    try {
      const { error } = await supabase
        .from('n8n_chat_history')
        .delete()
        .eq('session_id', sessionId);

      if (error) throw error;
      setHistory([]);
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
    addMessage,
    clearHistory,
    refreshHistory: fetchHistory,
  };
};
