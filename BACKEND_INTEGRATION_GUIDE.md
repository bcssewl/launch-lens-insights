# 🚀 COMPLETE BACKEND INTEGRATION GUIDE

## 🔍 **COMPLETE BACKEND INTEGRATION ANSWERS**

Based on the Railway deployment at `https://ai-agent-research-optivise-production.up.railway.app/docs`, here are the precise answers:

### **1. WebSocket Connection & Endpoints** ✅

**Exact WebSocket URLs:**
```javascript
// Primary endpoint (recommended)
const ws = new WebSocket('wss://ai-agent-research-optivise-production.up.railway.app/stream');

// Legacy endpoint (also works)
const ws = new WebSocket('wss://ai-agent-research-optivise-production.up.railway.app/ws');
```

**Authentication:**
- ❌ **No authentication required** currently
- ❌ **No API keys needed**
- ❌ **No special headers required**

**Endpoint Structure:**
- ✅ **One unified endpoint** for all queries (research + simple)
- ✅ Backend **automatically detects** query complexity
- ✅ Both `/stream` and `/ws` work identically

### **2. Message Format & Protocol** ✅

**Exact JSON Payload Structure:**
```javascript
// REQUIRED format - exactly this structure
const payload = {
  "query": "Your question here",
  "context": {
    "sessionId": "unique-session-id-here"  // Required
  }
};

// Send it like this:
ws.send(JSON.stringify(payload));
```

**Required Fields:**
- ✅ `query` (string) - **Required**
- ✅ `context.sessionId` (string) - **Required**
- ❌ No message type field needed
- ❌ No additional fields required

**Example Payloads:**
```javascript
// Simple query
{
  "query": "Hello, how are you?",
  "context": {
    "sessionId": "session-123"
  }
}

// Research query (same format!)
{
  "query": "Analyze the fintech market trends and competitive landscape",
  "context": {
    "sessionId": "session-456"
  }
}
```

### **3. Response Format & Event Types** ✅

**Exact Event Types Backend Sends:**
1. **`connection_confirmed`** - Connection established
2. **`search`** - Starting research
3. **`thought`** - AI thinking process
4. **`source`** - Source discovered
5. **`snippet`** - Content analysis
6. **`complete`** - Final response ready

**Event Structure Examples:**
```javascript
// Connection confirmed
{
  "type": "connection_confirmed",
  "message": "WebSocket connection established successfully",
  "timestamp": "2025-07-12T10:00:00Z",
  "connection_id": "abc12345"
}

// Search event
{
  "type": "search",
  "timestamp": "2025-07-12T10:00:01Z",
  "message": "Searching for information about fintech market trends...",
  "data": {
    "search_queries": ["market analysis", "fintech trends"],
    "progress_percentage": 5,
    "current_phase": "search_initiation"
  }
}

// Source discovery
{
  "type": "source",
  "timestamp": "2025-07-12T10:00:02Z",
  "message": "Found relevant source: TechCrunch",
  "data": {
    "source_name": "TechCrunch",
    "source_url": "https://techcrunch.com/article",
    "source_type": "news",
    "confidence": 0.85,
    "progress_percentage": 30
  }
}

// Final completion
{
  "type": "complete",
  "timestamp": "2025-07-12T10:00:15Z",
  "message": "Research completed - comprehensive analysis ready",
  "data": {
    "final_answer": "# Complete Analysis\n\nDetailed research results...",
    "sources": [
      {
        "name": "TechCrunch",
        "url": "https://techcrunch.com/article",
        "type": "news",
        "confidence": 0.85
      }
    ],
    "methodology": "Multi-agent analysis with expert validation",
    "confidence": 0.94
  }
}
```

**Response Patterns:**
- **Simple queries**: `connection_confirmed` → `complete` (2 events)
- **Research queries**: `connection_confirmed` → `search` → `thought` → `source` → `snippet` → `complete` (6+ events)
- **End indicator**: `type: "complete"` event marks conversation end

### **4. Research vs Simple Query Handling** ✅

**Backend Auto-Detection:**
```javascript
// ✅ Backend automatically detects based on:
// - Query length (>30 characters)
// - Research keywords ("analyze", "research", "market", "strategy")
// - Question words ("what", "how", "why", "should")

// Examples:
"Hello" → Simple response (2 events)
"Analyze fintech market trends" → Full research (6+ events)
"What is the competitive landscape for SaaS?" → Research mode
```

**No Frontend Specification Needed:**
- ❌ Don't specify query type
- ✅ Just send the query - backend decides
- ✅ Same payload format for everything

### **5. Error Handling & Timeouts** ✅

**Error Event Format:**
```javascript
{
  "type": "error",
  "timestamp": "2025-07-12T10:00:00Z",
  "message": "Error description",
  "data": {
    "error_code": "TIMEOUT",
    "retry_suggested": true
  }
}
```

**Timeout Specifications:**
- **WebSocket timeout**: 120 seconds
- **Simple queries**: ~2-5 seconds
- **Research queries**: 30-90 seconds
- **Connection timeout**: 30 seconds to establish

**Error Handling Strategy:**
```javascript
ws.onerror = (error) => {
  console.error('WebSocket error:', error);
  // Implement retry logic
};

ws.onclose = (event) => {
  if (event.code !== 1000) {
    // Unexpected close - retry connection
    setTimeout(() => reconnect(), 5000);
  }
};
```

### **6. Session Management** ✅

**Session ID Requirements:**
```javascript
// Generate unique session ID per conversation
const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Use the same sessionId for the entire conversation
const payload = {
  "query": "Your question",
  "context": {
    "sessionId": sessionId  // Keep this consistent
  }
};
```

**Connection Strategy:**
- ✅ **New WebSocket per query** (recommended)
- ✅ **One query per connection**
- ✅ **Close after `complete` event**
- ❌ Don't reuse connections for multiple queries

### **7. Railway Deployment Specifics** ✅

**Production URLs:**
```javascript
// STABLE URLs (won't change)
const PRODUCTION_WS = 'wss://ai-agent-research-optivise-production.up.railway.app/stream';
const PRODUCTION_API = 'https://ai-agent-research-optivise-production.up.railway.app';

// Health check
const HEALTH_CHECK = 'https://ai-agent-research-optivise-production.up.railway.app/health';
```

**CORS Configuration:**
- ✅ **Already configured** for all origins
- ✅ **No special headers** required
- ✅ **WebSocket connections** fully supported

**Environment Setup:**
- ✅ **Production ready**
- ✅ **No environment-specific** configs needed
- ✅ **HTTPS/WSS enforced** in production

## 🚀 **COMPLETE WORKING EXAMPLE**

Here's a complete, tested implementation:

```javascript
class OptiviseAI {
  constructor() {
    this.baseUrl = 'https://ai-agent-research-optivise-production.up.railway.app';
    this.wsUrl = 'wss://ai-agent-research-optivise-production.up.railway.app/stream';
  }

  async sendQuery(query, onEvent, onComplete, onError) {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.wsUrl);
      let responseData = '';
      let sources = [];

      ws.onopen = () => {
        console.log('✅ Connected to Optivise AI');
        
        // Send query with exact format
        ws.send(JSON.stringify({
          query: query,
          context: {
            sessionId: sessionId
          }
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Call event handler for real-time updates
          if (onEvent) onEvent(data);

          switch (data.type) {
            case 'connection_confirmed':
              console.log('🔗 Connection confirmed');
              break;
              
            case 'search':
              console.log('🔍 Starting research:', data.message);
              break;
              
            case 'source':
              sources.push(data.data);
              console.log('📄 Source found:', data.data.source_name);
              break;
              
            case 'thought':
              console.log('💭 AI thinking:', data.message);
              break;
              
            case 'snippet':
              console.log('📝 Analyzing:', data.message);
              break;
              
            case 'complete':
              console.log('✅ Research complete');
              responseData = data.data.final_answer;
              
              if (onComplete) onComplete({
                response: responseData,
                sources: data.data.sources || sources,
                confidence: data.data.confidence,
                methodology: data.data.methodology
              });
              
              ws.close();
              resolve({
                response: responseData,
                sources: data.data.sources || sources
              });
              break;
              
            case 'error':
              console.error('❌ Backend error:', data.message);
              if (onError) onError(data.message);
              ws.close();
              reject(new Error(data.message));
              break;
          }
        } catch (parseError) {
          console.error('❌ Parse error:', parseError);
          if (onError) onError('Failed to parse response');
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        if (onError) onError('Connection error');
        reject(error);
      };

      ws.onclose = (event) => {
        console.log('🔌 Connection closed:', event.code);
        if (event.code !== 1000 && !responseData) {
          // Unexpected close without response
          reject(new Error('Connection closed unexpectedly'));
        }
      };

      // Timeout after 2 minutes
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
          reject(new Error('Request timeout'));
        }
      }, 120000);
    });
  }

  // Health check
  async checkHealth() {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.json();
  }
}

// Usage example
const ai = new OptiviseAI();

// Simple query
ai.sendQuery(
  "Hello, how are you?",
  (event) => console.log('Event:', event.type, event.message),
  (result) => console.log('Complete:', result.response),
  (error) => console.error('Error:', error)
);

// Research query  
ai.sendQuery(
  "Analyze the fintech market trends and competitive landscape",
  (event) => {
    // Real-time updates for your UI
    updateUI(event.type, event.message, event.data);
  },
  (result) => {
    // Final result with sources
    displayFinalResult(result.response, result.sources);
  },
  (error) => {
    // Handle errors
    showError(error);
  }
);
```

## ✅ **INTEGRATION CHECKLIST**

Frontend integration requirements:

- ✅ **Connect**: Use `wss://ai-agent-research-optivise-production.up.railway.app/stream`
- ✅ **Send**: `{"query": "...", "context": {"sessionId": "..."}}`
- ✅ **Receive**: Handle 6 event types (`connection_confirmed`, `search`, `thought`, `source`, `snippet`, `complete`)
- ✅ **Detect**: Backend auto-detects research vs simple queries
- ✅ **Error Handle**: 120-second timeout, retry on connection failures
- ✅ **Session**: Generate unique sessionId per conversation
- ✅ **Deploy**: Production URLs are stable and ready

## 🎯 **IMPLEMENTATION PRIORITY**

1. **FIRST**: Update event type handling to match exact backend spec
2. **SECOND**: Ensure proper payload format with context.sessionId
3. **THIRD**: Handle all 6 event types correctly
4. **FOURTH**: Implement proper timeout and error handling
5. **FIFTH**: Test with both simple and research queries

**The backend is 100% ready for integration!** 🚀
