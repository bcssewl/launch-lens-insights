import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const SimpleStreamingChat: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingStatus, setStreamingStatus] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (content: string, isUser: boolean) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      content,
      isUser,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const testWebSocketConnection = async () => {
    setIsLoading(true);
    setStreamingStatus('Connecting to WebSocket...');
    
    try {
      const ws = new WebSocket('wss://ai-agent-research-optivise-production.up.railway.app/stream');
      
      ws.onopen = () => {
        setStreamingStatus('✅ Connected! Sending query...');
        ws.send(JSON.stringify({
          query: input,
          context: {}
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setStreamingStatus(`📡 Received: ${data.type}`);
          
          if (data.type === 'research_complete' || data.type === 'conversation_complete') {
            addMessage(data.final_answer || 'Research completed!', false);
            setIsLoading(false);
            setStreamingStatus('');
            ws.close();
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      ws.onerror = (error) => {
        setStreamingStatus('❌ WebSocket error');
        setIsLoading(false);
      };

      ws.onclose = () => {
        setStreamingStatus('🔌 Connection closed');
        setIsLoading(false);
      };

    } catch (error) {
      setStreamingStatus('❌ Failed to connect');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    addMessage(input, true);
    await testWebSocketConnection();
    setInput('');
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
        🧪 WebSocket Streaming Test
      </h1>
      
      {/* Messages */}
      <div style={{ 
        height: '400px', 
        overflowY: 'auto', 
        border: '1px solid #ccc', 
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px',
        backgroundColor: '#f9f9f9'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              marginBottom: '15px',
              padding: '10px',
              borderRadius: '8px',
              backgroundColor: message.isUser ? '#007bff' : '#e9ecef',
              color: message.isUser ? 'white' : 'black',
              alignSelf: message.isUser ? 'flex-end' : 'flex-start'
            }}
          >
            <strong>{message.isUser ? 'You' : 'AI'}:</strong> {message.content}
          </div>
        ))}
        
        {/* Streaming Status */}
        {isLoading && (
          <div style={{
            padding: '10px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            color: '#856404'
          }}>
            <div>🔄 {streamingStatus}</div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Test WebSocket streaming (try: 'analyze fintech market')"
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontSize: '16px'
          }}
        />
        <button 
          type="submit" 
          disabled={isLoading || !input.trim()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? '⏳' : 'Send'}
        </button>
      </form>

      {/* Test Instructions */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#e7f3ff', 
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <h3>🧪 Test Instructions:</h3>
        <ul>
          <li><strong>Simple query:</strong> "hello" (should work quickly)</li>
          <li><strong>Research query:</strong> "analyze fintech market trends" (should show streaming)</li>
          <li><strong>Watch console:</strong> Open browser DevTools to see WebSocket messages</li>
        </ul>
      </div>
    </div>
  );
};

export default SimpleStreamingChat;
