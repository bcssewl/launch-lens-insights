/**
 * Test Stratix API endpoints
 * This script tests the REST API endpoints for non-streaming queries
 */

const testStratixAPI = async () => {
  console.log('🧪 Testing Stratix API endpoints...');
  
  const baseUrl = 'https://ai-agent-research-optivise-production.up.railway.app';
  const testPayload = {
    query: "hello",
    sessionId: "test-session-" + Date.now(),
    streaming: false
  };
  
  const endpoints = ['/api/chat', '/chat', '/api/query', '/query'];
  
  for (const endpoint of endpoints) {
    const url = baseUrl + endpoint;
    console.log(`\n📡 Testing ${url}...`);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload)
      });
      
      console.log(`Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Success! Response:', data);
        break;
      } else {
        const errorText = await response.text();
        console.log('❌ Error response:', errorText);
      }
    } catch (error) {
      console.log('❌ Request failed:', error.message);
    }
  }
};

// Run the test
testStratixAPI().catch(console.error);
