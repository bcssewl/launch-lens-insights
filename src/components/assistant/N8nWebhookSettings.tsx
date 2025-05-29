
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Webhook, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface N8nWebhookSettingsProps {
  webhookUrl: string;
  onWebhookUrlChange: (url: string) => void;
}

const N8nWebhookSettings: React.FC<N8nWebhookSettingsProps> = ({
  webhookUrl,
  onWebhookUrlChange,
}) => {
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      const isValid = url.length > 0 && (url.includes('webhook') || url.includes('n8n') || url.startsWith('http'));
      setIsValidUrl(isValid);
      return isValid;
    } catch {
      setIsValidUrl(false);
      return false;
    }
  };

  const handleUrlChange = (url: string) => {
    onWebhookUrlChange(url);
    validateUrl(url);
  };

  const testWebhook = async () => {
    if (!webhookUrl) return;

    setIsTesting(true);
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'test',
          message: 'Test connection from AI Assistant',
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        toast({
          title: "Connection Successful",
          description: "Successfully connected to your n8n webhook!",
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Webhook test error:', error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to the webhook. Please check the URL and your n8n workflow.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Webhook className="h-4 w-4" />
          n8n Chat Backend
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Webhook URL</label>
          <Input
            placeholder="https://your-n8n.domain/webhook/..."
            value={webhookUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            className="text-xs"
          />
          <div className="flex items-center gap-2">
            {webhookUrl && (
              <Badge variant={isValidUrl ? "default" : "destructive"} className="text-xs">
                {isValidUrl ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Valid URL
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
                    Invalid URL
                  </>
                )}
              </Badge>
            )}
          </div>
        </div>
        
        {isValidUrl && (
          <Button
            size="sm"
            variant="outline"
            onClick={testWebhook}
            disabled={isTesting}
            className="w-full text-xs"
          >
            {isTesting ? 'Testing...' : 'Test Connection'}
          </Button>
        )}
        
        <div className="p-2 bg-blue-50 rounded-md border border-blue-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-700">
              <p className="font-medium mb-1">Setup Instructions:</p>
              <p>Your n8n workflow should return a JSON response with a "response" or "message" field containing the AI's reply.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default N8nWebhookSettings;
