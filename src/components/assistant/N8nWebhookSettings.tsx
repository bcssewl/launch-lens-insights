
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Webhook, CheckCircle, XCircle } from 'lucide-react';
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
      const isN8nUrl = url.includes('webhook') || url.includes('n8n');
      setIsValidUrl(url.length > 0 && isN8nUrl);
      return url.length > 0 && isN8nUrl;
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
        mode: 'no-cors',
        body: JSON.stringify({
          type: 'test',
          message: 'Test connection from AI Assistant',
          timestamp: new Date().toISOString(),
        }),
      });

      toast({
        title: "Test Sent",
        description: "Test message sent to n8n webhook. Check your workflow for confirmation.",
      });
    } catch (error) {
      console.error('Webhook test error:', error);
      toast({
        title: "Test Failed",
        description: "Failed to send test message to webhook.",
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
          n8n Integration
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
                    Valid
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
                    Invalid
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
        
        <p className="text-xs text-muted-foreground">
          Messages will be sent to this webhook when you chat with the AI.
        </p>
      </CardContent>
    </Card>
  );
};

export default N8nWebhookSettings;
