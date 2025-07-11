import React from 'react';
import StreamingChat from '@/components/StreamingChat';
import '@/components/StreamingChat.css';

const StreamingTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-4">
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Streaming Chat Test Page
          </h1>
          <p className="text-gray-600">
            Test the WebSocket streaming functionality with Perplexity-style overlays
          </p>
        </div>
        <StreamingChat />
      </div>
    </div>
  );
};

export default StreamingTestPage;
