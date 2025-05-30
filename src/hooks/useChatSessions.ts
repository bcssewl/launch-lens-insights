
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export const useChatSessions = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load chat sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (title: string = 'New Chat') => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([
          {
            user_id: user.id,
            title,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setSessions(prev => [data, ...prev]);
      setCurrentSessionId(data.id);
      return data;
    } catch (error) {
      console.error('Error creating chat session:', error);
      toast({
        title: "Error",
        description: "Failed to create new chat session",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateSessionTitle = async (sessionId: string, title: string) => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ title })
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(prev => 
        prev.map(session => 
          session.id === sessionId ? { ...session, title } : session
        )
      );
    } catch (error) {
      console.error('Error updating session title:', error);
      toast({
        title: "Error",
        description: "Failed to update session title",
        variant: "destructive",
      });
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(prev => prev.filter(session => session.id !== sessionId));
      
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "Failed to delete session",
        variant: "destructive",
      });
    }
  };

  return {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    loading,
    createSession,
    updateSessionTitle,
    deleteSession,
    refreshSessions: fetchSessions,
  };
};
