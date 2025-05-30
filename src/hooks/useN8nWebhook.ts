
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: Date;
}

export const useN8nWebhook = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const sendMessageToN8n = useCallback(async (message: string): Promise<string> => {
    try {
      console.log('Sending message to AI service via Supabase Edge Function');
      
      const { data, error } = await supabase.functions.invoke('n8n-webhook', {
        body: { 
          message,
          user: user ? {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || null,
            created_at: user.created_at
          } : null
        }
      });

      if (error) {
        throw error;
      }

      if (!data || !data.response) {
        throw new Error('Invalid response from AI service');
      }

      console.log('Received response from AI service:', data);
      return data.response;
    } catch (error) {
      console.error('Failed to send message to AI service:', error);
      toast({
        title: "Connection Error",
        description: "I'm having trouble connecting to the AI service right now. Please try again in a moment.",
        variant: "destructive",
      });
      
      // Fallback response when AI service is unavailable
      throw error;
    }
  }, [toast, user]);

  return {
    sendMessageToN8n,
    isConfigured: true, // Always true since we're using Supabase secrets
  };
};
