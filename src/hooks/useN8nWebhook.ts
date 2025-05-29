
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

  const sendToN8n = useCallback(async (message: ChatMessage) => {
    if (!webhookUrl) return;

    try {
      console.log('Sending message to n8n webhook:', webhookUrl);
      
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify({
          type: 'chat_message',
          message: {
            id: message.id,
            text: message.text,
            sender: message.sender,
            timestamp: message.timestamp.toISOString(),
          },
          metadata: {
            source: 'ai_assistant',
            user_agent: navigator.userAgent,
            page_url: window.location.href,
          },
        }),
      });

      console.log('Message sent to n8n successfully');
    } catch (error) {
      console.error('Failed to send message to n8n:', error);
      toast({
        title: "n8n Integration Error",
        description: "Failed to send message to n8n webhook.",
        variant: "destructive",
      });
    }
  }, [webhookUrl, toast]);

  return {
    webhookUrl,
    updateWebhookUrl,
    sendToN8n,
    isConfigured: !!webhookUrl,
  };
};
