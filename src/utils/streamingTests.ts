export const testWebSocketConnection = () => {
  console.log('🧪 Testing WebSocket connection...');
  
  const ws = new WebSocket('wss://ai-agent-research-optivise-production.up.railway.app/stream');
  
  ws.onopen = () => {
    console.log('✅ WebSocket connected successfully');
    
    // Test query
    const testQuery = {
      query: "analyze the fintech market trends",
      context: {}
    };
    
    console.log('📤 Sending test query:', testQuery);
    ws.send(JSON.stringify(testQuery));
  };
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('📨 Received message:', data.type, data);
      
      // Log all streaming events
      switch (data.type) {
        case 'started':
          console.log('🎯 Research started');
          break;
        case 'agents_selected':
          console.log('🧠 Agents selected:', data.agent_names || data.agents);
          break;
        case 'source_discovery_started':
          console.log('🔍 Source discovery started by:', data.agent_name);
          break;
        case 'source_discovered':
          console.log('📚 Source found:', data.source_name);
          break;
        case 'research_progress':
          console.log('📊 Progress:', data.progress + '%');
          break;
        case 'expert_analysis_started':
          console.log('🔬 Expert analysis started by:', data.agent_name);
          break;
        case 'synthesis_started':
          console.log('🔗 Synthesizing results...');
          break;
        case 'research_complete':
          console.log('✅ Research complete!');
          console.log('📄 Final answer:', data.final_answer?.substring(0, 100) + '...');
          ws.close();
          break;
        case 'conversation_complete':
          console.log('💬 Conversation complete!');
          console.log('📄 Final answer:', data.final_answer?.substring(0, 100) + '...');
          ws.close();
          break;
        default:
          console.log('🔄 Other event:', data.type);
      }
    } catch (error) {
      console.error('❌ Failed to parse message:', error);
    }
  };
  
  ws.onerror = (error) => {
    console.error('❌ WebSocket error:', error);
  };
  
  ws.onclose = () => {
    console.log('🔌 WebSocket closed');
  };
  
  // Return cleanup function
  return () => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  };
};

// Test REST API as well
export const testRestAPI = async () => {
  console.log('🧪 Testing REST API...');
  
  try {
    const response = await fetch('https://ai-agent-research-optivise-production.up.railway.app/research', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: "hello",
        context: {}
      }),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ REST API working:', result);
      return result;
    } else {
      console.error('❌ REST API error:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ REST API request failed:', error);
  }
};

// Utility to run both tests
export const runAllTests = () => {
  console.log('🚀 Running all connectivity tests...');
  
  // Test REST API first
  testRestAPI();
  
  // Test WebSocket after a delay
  setTimeout(() => {
    const cleanup = testWebSocketConnection();
    
    // Auto cleanup after 30 seconds
    setTimeout(cleanup, 30000);
  }, 2000);
};
