// Test the actual DeerFlow WebSocket to understand real output format
console.log('🧪 Testing Real DeerFlow WebSocket...');

const ws = new WebSocket('wss://ai-agent-research-optivise-production.up.railway.app/stream');

ws.onopen = function() {
  console.log('✅ WebSocket Connected to DeerFlow');
  
  // Test with exact format from documentation
  const payload = {
    "query": "What are the latest AI trends?",
    "context": {
      "sessionId": `test_${Date.now()}`
    }
  };
  
  console.log('📤 Sending:', JSON.stringify(payload, null, 2));
  ws.send(JSON.stringify(payload));
};

ws.onmessage = function(event) {
  try {
    const data = JSON.parse(event.data);
    console.log('📨 REAL EVENT RECEIVED:');
    console.log('  Type:', data.type);
    console.log('  Full Object:', JSON.stringify(data, null, 2));
    console.log('  Keys:', Object.keys(data));
    console.log('---');
  } catch (error) {
    console.log('📨 RAW MESSAGE:', event.data);
  }
};

ws.onerror = function(error) {
  console.error('❌ WebSocket Error:', error);
};

ws.onclose = function(event) {
  console.log('🔐 WebSocket Closed:', event.code, event.reason);
};

// Auto close after 30 seconds
setTimeout(() => {
  console.log('⏰ Closing test connection');
  ws.close();
}, 30000);