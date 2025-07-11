/**
 * WebSocket API Test - Direct Connection
 * This script tests the WebSocket connection directly to see what data is being sent
 */

const testWebSocketConnection = () => {
  console.log('🧪 Testing direct WebSocket connection...');
  
  const ws = new WebSocket('wss://ai-agent-research-optivise-production.up.railway.app/stream');
  
  ws.onopen = () => {
    console.log('✅ WebSocket connected');
    
    // Send a test query
    const testPayload = {
      query: "What are the latest trends in AI technology?",
      context: { sessionId: "test-session-" + Date.now() }
    };
    
    console.log('📤 Sending test payload:', testPayload);
    ws.send(JSON.stringify(testPayload));
  };
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('📨 Raw WebSocket message:', data);
      
      // Specifically log source events
      if (data.type === 'source') {
        console.log('🔍 SOURCE EVENT DETAILS:');
        console.log('  - Name:', data.data?.source_name);
        console.log('  - URL:', data.data?.source_url);
        console.log('  - Type:', data.data?.source_type);
        console.log('  - Confidence:', data.data?.confidence);
        console.log('  - Full data object:', data.data);
      }
      
    } catch (error) {
      console.error('❌ Failed to parse WebSocket message:', error);
      console.log('Raw message:', event.data);
    }
  };
  
  ws.onerror = (error) => {
    console.error('❌ WebSocket error:', error);
  };
  
  ws.onclose = (event) => {
    console.log('🔌 WebSocket closed:', event.code, event.reason);
  };
  
  // Close after 60 seconds
  setTimeout(() => {
    console.log('⏰ Closing test connection after 60 seconds');
    ws.close();
  }, 60000);
};

// Run the test
testWebSocketConnection();
