import React, { useState } from 'react';
import { usePerplexityStreaming } from '@/hooks/usePerplexityStreaming';
import StreamingProgress from '@/components/assistant/StreamingProgress';
import SourceCard from '@/components/assistant/SourceCard';

/**
 * Test Component for Perplexity Streaming
 * This component can be used to test the streaming functionality independently
 * 
 * Usage: Import this component in any page to test streaming
 * Example test queries:
 * - "Analyze the AI market trends"
 * - "Research fintech opportunities"  
 * - "What are Tesla's competitive advantages?"
 */
const StreamingTestComponent: React.FC = () => {
  const [testQuery, setTestQuery] = useState('');
  const { streamingState, startStreaming, stopStreaming } = usePerplexityStreaming();

  const handleTest = async () => {
    if (!testQuery.trim()) return;
    
    try {
      console.log('🧪 Testing streaming with query:', testQuery);
      await startStreaming(testQuery, 'test-session-' + Date.now());
    } catch (error) {
      console.error('Test streaming error:', error);
    }
  };

  const handleStop = () => {
    stopStreaming();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Perplexity Streaming Test</h2>
        
        {/* Test Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Test Query (try research-focused questions):
            </label>
            <textarea
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="e.g., Analyze the competitive landscape of AI chatbots in 2024"
              className="w-full border rounded-lg p-3 min-h-[80px] resize-none"
              disabled={streamingState.isStreaming}
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleTest}
              disabled={streamingState.isStreaming || !testQuery.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
            >
              {streamingState.isStreaming ? 'Streaming...' : 'Test Streaming'}
            </button>
            
            {streamingState.isStreaming && (
              <button
                onClick={handleStop}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Stop
              </button>
            )}
          </div>
        </div>

        {/* Suggested Test Queries */}
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Suggested Test Queries:</h3>
          <div className="grid grid-cols-1 gap-2">
            {[
              "Analyze the fintech market trends in 2024",
              "What are the competitive advantages of Tesla?",
              "Research opportunities in renewable energy sector",
              "Compare different cloud computing platforms",
              "Hello" // This should NOT trigger streaming
            ].map((query) => (
              <button
                key={query}
                onClick={() => setTestQuery(query)}
                className="text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded border-dashed border border-blue-200"
                disabled={streamingState.isStreaming}
              >
                "{query}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Streaming Progress Display */}
      {streamingState.isStreaming && (
        <StreamingProgress
          currentPhase={streamingState.currentPhase}
          progress={streamingState.progress}
          searchQueries={streamingState.searchQueries}
          discoveredSources={streamingState.discoveredSources}
          isVisible={true}
        />
      )}

      {/* Final Response and Sources */}
      {streamingState.finalResponse && !streamingState.isStreaming && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-3">Final Response:</h3>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{streamingState.finalResponse}</p>
          </div>
          
          {streamingState.discoveredSources.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-medium mb-3">Sources:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {streamingState.discoveredSources.map((source, index) => (
                  <SourceCard
                    key={index}
                    name={source.name}
                    url={source.url}
                    type={source.type}
                    confidence={source.confidence}
                    isClickable={true}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Debug Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium mb-2">Debug Information:</h3>
        <pre className="text-xs text-gray-600 overflow-auto">
          {JSON.stringify(streamingState, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default StreamingTestComponent;
