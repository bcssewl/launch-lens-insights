
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const StreamingChat: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    setResponse('');

    try {
      // Mock streaming response for testing
      const mockResponse = "This is a test streaming response for the WebSocket functionality.";
      
      // Simulate streaming by showing characters one by one
      for (let i = 0; i <= mockResponse.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50));
        setResponse(mockResponse.substring(0, i));
      }
    } catch (error) {
      console.error('Streaming error:', error);
      setResponse('Error occurred during streaming');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Streaming Chat Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your test message..."
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !message.trim()}>
              {isLoading ? 'Streaming...' : 'Send'}
            </Button>
          </form>
          
          {response && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Response:</h3>
              <p className="whitespace-pre-wrap">{response}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StreamingChat;
