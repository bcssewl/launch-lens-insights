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

  const addMessage = async (message: string) => {
    if (!sessionId) {
      console.warn('useChatHistory: No sessionId provided for addMessage');
      return null;
    }

    console.log('useChatHistory: Adding message to session:', sessionId);
    console.log('useChatHistory: Message preview:', message.substring(0, 200) + '...');
    console.log('useChatHistory: Message length:', message.length);

    try {
      // First, let's check if we have a valid auth session
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('useChatHistory: Auth error when getting user:', authError);
        throw new Error(`Authentication error: ${authError.message}`);
      }
      
      if (!user) {
        console.error('useChatHistory: No authenticated user found');
        throw new Error('No authenticated user found');
      }
      
      console.log('useChatHistory: Authenticated user:', user.id);

      // Check if this session belongs to the current user
      const { data: sessionCheck, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('user_id, title')
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        console.error('useChatHistory: Error checking session ownership:', sessionError);
        throw new Error(`Session verification error: ${sessionError.message}`);
      }

      if (sessionCheck.user_id !== user.id) {
        console.error('useChatHistory: Session does not belong to current user');
        throw new Error('Session does not belong to current user');
      }

      console.log('useChatHistory: Session verification passed, inserting message...');

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

      if (error) {
        console.error('useChatHistory: Database error when saving message:', error);
        console.error('useChatHistory: Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('useChatHistory: Successfully saved message with ID:', data.id);
      setHistory(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('useChatHistory: Error adding message to history:', error);
      toast({
        title: "Error",
        description: `Failed to save message: ${error.message}`,
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
    isInitialLoad,
    addMessage,
    clearHistory,
    refreshHistory: fetchHistory,
  };
};
