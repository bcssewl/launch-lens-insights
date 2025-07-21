
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Initialize session from URL parameter
  useEffect(() => {
    const sessionParam = searchParams.get('session');
    console.log('URL session parameter:', sessionParam);
    console.log('Current session ID:', currentSessionId);
    if (sessionParam && sessionParam !== currentSessionId) {
      console.log('Setting session from URL:', sessionParam);
      setCurrentSessionId(sessionParam);
    }
  }, [searchParams, currentSessionId]);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    console.log('Fetching chat sessions...');
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Fetched sessions:', data);
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
    if (!user) {
      console.error('No user found when creating session');
      return null;
    }

    console.log('Creating session with title:', title);
    setCreating(true);

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

      if (error) {
        console.error('Supabase error creating session:', error);
        throw error;
      }

      console.log('Session created successfully:', data);
      
      // Update sessions list immediately
      setSessions(prev => [data, ...prev]);
      setCurrentSessionId(data.id);
      
      // Navigate to the new session URL
      navigate(`/dashboard/assistant?session=${data.id}`, { replace: true });
      
      return data;
    } catch (error) {
      console.error('Error creating chat session:', error);
      toast({
        title: "Error",
        description: "Failed to create new chat session",
        variant: "destructive",
      });
      return null;
    } finally {
      setCreating(false);
    }
  };

  const updateSessionTitle = async (sessionId: string, title: string) => {
    console.log('Updating session title:', sessionId, title);
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
      
      console.log('Session title updated successfully');
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
    console.log('Deleting session:', sessionId);
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(prev => prev.filter(session => session.id !== sessionId));
      
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        navigate('/dashboard/assistant', { replace: true });
      }
      
      console.log('Session deleted successfully');
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "Failed to delete session",
        variant: "destructive",
      });
    }
  };

  const navigateToSession = (sessionId: string | null) => {
    console.log('Navigating to session:', sessionId);
    setCurrentSessionId(sessionId);
    if (sessionId) {
      navigate(`/dashboard/assistant?session=${sessionId}`, { replace: true });
    } else {
      navigate('/dashboard/assistant', { replace: true });
    }
  };

  return {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    navigateToSession,
    loading,
    creating,
    createSession,
    updateSessionTitle,
    deleteSession,
    refreshSessions: fetchSessions,
  };
};
