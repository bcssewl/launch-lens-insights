
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: Date;
}

export const useN8nWebhook = () => {
  const { toast } = useToast();

  const sendMessageToN8n = useCallback(async (message: string): Promise<string> => {
    try {
      console.log('Sending message to n8n via Supabase Edge Function');
      
      const { data, error } = await supabase.functions.invoke('n8n-webhook', {
        body: { message }
      });

      if (error) {
        throw error;
      }

      if (!data || !data.response) {
        throw new Error('Invalid response from N8N webhook');
      }

      console.log('Received response from n8n:', data);
      return data.response;
    } catch (error) {
      console.error('Failed to send message to n8n:', error);
      toast({
        title: "N8N Integration Error",
        description: "Failed to communicate with N8N webhook. Please check your configuration.",
        variant: "destructive",
      });
      
      // Fallback response when n8n is unavailable
      throw error;
    }
  }, [toast]);

  return {
    sendMessageToN8n,
    isConfigured: true, // Always true since we're using Supabase secrets
  };
};
