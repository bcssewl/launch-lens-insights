
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: Date;
}

export const useN8nWebhook = () => {
  const [webhookUrl, setWebhookUrl] = useState(() => {
    return localStorage.getItem('n8n-webhook-url') || '';
  });
  const { toast } = useToast();

  const updateWebhookUrl = useCallback((url: string) => {
    setWebhookUrl(url);
    if (url) {
      localStorage.setItem('n8n-webhook-url', url);
    } else {
      localStorage.removeItem('n8n-webhook-url');
    }
  }, []);

  const sendMessageToN8n = useCallback(async (message: string): Promise<string> => {
    if (!webhookUrl) {
      throw new Error('Webhook URL not configured');
    }

    try {
      console.log('Sending message to n8n webhook:', webhookUrl);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'chat_message',
          message: message,
          timestamp: new Date().toISOString(),
          metadata: {
            source: 'ai_assistant',
            user_agent: navigator.userAgent,
            page_url: window.location.href,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received response from n8n:', data);

      // Extract the AI response from the n8n response
      // Adjust this based on your n8n workflow's response structure
      return data.response || data.message || 'I received your message but couldn\'t generate a response.';
    } catch (error) {
      console.error('Failed to send message to n8n:', error);
      toast({
        title: "n8n Integration Error",
        description: "Failed to communicate with n8n webhook. Using fallback response.",
        variant: "destructive",
      });
      
      // Fallback response when n8n is unavailable
      throw error;
    }
  }, [webhookUrl, toast]);

  return {
    webhookUrl,
    updateWebhookUrl,
    sendMessageToN8n,
    isConfigured: !!webhookUrl,
  };
};
