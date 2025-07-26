// Test script to understand DeerFlow WebSocket behavior
const WebSocket = require('ws');

function testDeerFlowWebSocket() {
  console.log('🧪 Testing DeerFlow WebSocket Connection...');
  
  const ws = new WebSocket('wss://ai-agent-research-optivise-production.up.railway.app/stream');
  
  ws.on('open', function open() {
    console.log('✅ WebSocket Connected');
    
    // Test with a simple research query
    const testPayload = {
      query: "What are the latest trends in artificial intelligence for business applications?",
      context: {
        sessionId: `test_${Date.now()}`
      }
    };
    
    console.log('📤 Sending test query:', testPayload);
    ws.send(JSON.stringify(testPayload));
  });
  
  ws.on('message', function message(data) {
    try {
      const parsed = JSON.parse(data);
      console.log('📨 Received event:', {
        type: parsed.type,
        keys: Object.keys(parsed),
        data: parsed
      });
    } catch (error) {
      console.log('📨 Raw message:', data.toString());
    }
  });
  
  ws.on('error', function error(err) {
    console.error('❌ WebSocket Error:', err);
  });
  
  ws.on('close', function close(code, reason) {
    console.log('🔐 WebSocket Closed:', code, reason.toString());
  });
  
  // Close after 30 seconds to avoid hanging
  setTimeout(() => {
    console.log('⏰ Closing test connection...');
    ws.close();
  }, 30000);
}

testDeerFlowWebSocket();