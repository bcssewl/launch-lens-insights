
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
  const { user, session } = useAuth();

  const ensureValidSession = useCallback(async () => {
    try {
      console.log('Checking session validity...');
      
      // Check if we have a session and if it's expired
      if (!session) {
        console.log('No session found');
        return null;
      }

      const now = Math.round(Date.now() / 1000);
      const expiresAt = session.expires_at;
      
      // Check if token expires within the next 5 minutes (300 seconds)
      if (expiresAt && (expiresAt - now) < 300) {
        console.log('Session is expired or expiring soon, refreshing...');
        
        const { data, error } = await supabase.auth.refreshSession();
        
        if (error) {
          console.error('Failed to refresh session:', error);
          throw new Error('Session refresh failed');
        }
        
        if (data.session) {
          console.log('Session refreshed successfully');
          return data.session;
        }
      }

      console.log('Session is valid');
      return session;
    } catch (error) {
      console.error('Error ensuring valid session:', error);
      throw error;
    }
  }, [session]);

  const sendMessageToN8n = useCallback(async (message: string): Promise<string> => {
    let retryCount = 0;
    const maxRetries = 2;

    const attemptSend = async (): Promise<string> => {
      try {
        console.log('Sending message to AI service via Supabase Edge Function');
        
        // Ensure we have a valid session before making the request
        const validSession = await ensureValidSession();
        
        if (!validSession) {
          throw new Error('No valid session available');
        }

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
          // Check if it's an authentication error
          if (error.message?.includes('JWT') || error.message?.includes('expired') || error.message?.includes('401')) {
            console.log('Authentication error detected:', error.message);
            throw new Error('AUTH_ERROR');
          }
          throw error;
        }

        if (!data || !data.response) {
          throw new Error('Invalid response from AI service');
        }

        console.log('Received response from AI service:', data);
        return data.response;
      } catch (error: any) {
        console.error(`Attempt ${retryCount + 1} failed:`, error);
        
        // If it's an auth error and we haven't exceeded retries, try again
        if (error.message === 'AUTH_ERROR' && retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying request (attempt ${retryCount + 1}/${maxRetries + 1})...`);
          
          // Force session refresh before retry
          try {
            await supabase.auth.refreshSession();
            // Wait a moment before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
            return attemptSend();
          } catch (refreshError) {
            console.error('Failed to refresh session during retry:', refreshError);
            throw new Error('Authentication failed - please sign in again');
          }
        }
        
        throw error;
      }
    };

    try {
      return await attemptSend();
    } catch (error: any) {
      console.error('Failed to send message to AI service:', error);
      
      let errorMessage = "I'm having trouble connecting to the AI service right now. Please try again in a moment.";
      let errorTitle = "Connection Error";
      
      if (error.message?.includes('Authentication failed')) {
        errorMessage = "Your session has expired. Please refresh the page and sign in again.";
        errorTitle = "Authentication Error";
      } else if (error.message?.includes('No valid session')) {
        errorMessage = "Please sign in to use the AI assistant.";
        errorTitle = "Sign In Required";
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
      
      // Fallback response when AI service is unavailable
      throw error;
    }
  }, [toast, user, ensureValidSession]);

  return {
    sendMessageToN8n,
    isConfigured: true, // Always true since we're using Supabase secrets
  };
};
