# Perplexity-Style Streaming Overlays Implementation

## 🎯 Overview
This implementation adds real-time streaming overlays to AI chat messages during research queries, providing users with live feedback about the research process while preserving the existing UI theme.

## ✨ Features Implemented

### 1. Smart Streaming Detection
- **Hybrid Approach**: Simple queries use instant REST responses, complex research queries use WebSocket streaming
- **Auto-Detection**: Based on query content and length (`detectStreamingNeed` function)
- **Progressive Enhancement**: Works seamlessly with existing chat functionality

### 2. Real-Time Streaming Overlays
- **Visual Progress**: Shows research progress, agent activity, and source discovery in real-time
- **Subtle Design**: Overlays appear only on streaming AI messages without disrupting the UI
- **Animated Indicators**: Progress dots, pulsing icons, and smooth transitions

### 3. Streaming Update Types
- `started`: Research initiation
- `agents_selected`: AI specialists consultation
- `source_discovery_started`: Source searching
- `source_discovered`: Sources found
- `research_progress`: Analysis progress percentage
- `expert_analysis_started`: Expert insights application
- `synthesis_started`: Final synthesis
- `research_complete`: Final results

## 📁 Files Created/Modified

### New Components
- `src/components/assistant/StreamingOverlay.tsx`: Main overlay component with animated progress indicators
- `src/components/assistant/StreamingProgressIndicator.tsx`: Simple loading indicator for initial connection
- `src/hooks/useStreamingOverlay.ts`: Hook to manage streaming state and updates

### Modified Components
- `src/hooks/useMessages.ts`: Enhanced with streaming overlay integration
- `src/components/assistant/ChatMessage.tsx`: Added streaming overlay props and rendering
- `src/components/assistant/ChatArea.tsx`: Pass streaming props to messages
- `src/pages/AIAssistantPage.tsx`: Connect streaming state to UI components
- `src/components/assistant/FullscreenChatLayout.tsx`: Support streaming in fullscreen mode

## 🔄 How It Works

### Streaming Flow
1. **Message Creation**: AI message is created first with a unique ID in the UI
2. **Query Detection**: `detectStreamingNeed()` determines if query should use streaming
3. **WebSocket Connection**: Opens connection to backend streaming endpoint with message ID
4. **Real-Time Updates**: Receives streaming events and updates overlay on the correct message
5. **Progress Visualization**: Shows animated progress with icons and messages
6. **Final Response**: Updates message content and stops streaming overlay

### Message ID Tracking Fix
- **Issue Fixed**: Previously, streaming overlays were tracking a different ID than the UI message
- **Solution**: `handleStreamingRequest` now accepts and uses the message ID from the AI message in the UI
- **Result**: Overlays now properly appear on the correct message bubble during streaming

### UI Integration
```tsx
// Streaming overlay appears above AI message bubble
<div className="message-bubble">
  <StreamingOverlay 
    isVisible={isStreaming}
    updates={streamingUpdates}
  />
  <div className="message-content">
    {/* Existing message content */}
  </div>
</div>
```

### Backend Integration
- Uses existing WebSocket endpoint: `wss://ai-agent-research-optivise-production.up.railway.app/stream`
- Handles all streaming event types from backend
- Graceful fallback to REST API on timeout or error

## 🎨 Design Philosophy

### Preserving Existing Theme
- **No Breaking Changes**: All existing UI elements remain unchanged
- **Additive Enhancement**: Streaming overlays appear only when beneficial
- **Consistent Styling**: Uses existing color scheme and typography
- **Smooth Animations**: Gentle transitions that don't distract from content

### Visual Hierarchy
- Overlays use subtle gradients and backdrop blur
- Icons change color based on update type (blue for sources, purple for agents, etc.)
- Progress dots show advancement through research stages
- "Research Mode" badge indicates active streaming

## 🚀 Usage Examples

### Simple Query (Instant Response)
```
User: "hello"
→ POST /research (instant response)
→ No streaming overlay
```

### Research Query (Streaming)
```
User: "analyze the fintech market in 2024"
→ WebSocket /stream connection
→ Real-time overlay with progress:
  🎯 Research initiated - Analyzing query...
  🧠 Consulting: Market Research, Financial Analysis
  🔍 Agent searching for sources...
  📚 Found: Industry Report 2024 (12 sources)
  📊 Analyzing data... 60%
  🔗 Synthesizing findings from all specialists...
→ Final detailed response with sources
```

## 📊 State Management

### Streaming State
```typescript
interface StreamingState {
  isStreaming: boolean;
  updates: StreamingUpdate[];
  currentMessageId: string | null;
}
```

### Update Structure
```typescript
interface StreamingUpdate {
  type: string;
  message: string;
  timestamp: number;
  agentName?: string;
  sourceName?: string;
  progress?: number;
}
```

## 🔧 Configuration

### Timeouts & Fallbacks
- **Streaming Timeout**: 30 seconds before fallback to REST
- **Update Display**: Each update shows for 2 seconds
- **Graceful Degradation**: Falls back to instant response on WebSocket errors

### Customization Options
- Overlay appearance can be customized via CSS classes
- Update messages can be modified in streaming handlers
- Animation timing adjustable via component props

## ✅ Benefits

1. **Enhanced UX**: Users see real-time progress during research queries
2. **Transparency**: Shows which AI agents and sources are being consulted
3. **Engagement**: Keeps users informed during longer processing times
4. **Professional Feel**: Matches modern AI research tools like Perplexity
5. **Non-Intrusive**: Only appears when beneficial, preserves existing experience

## 🎯 Next Steps

The implementation is complete and ready for testing. The streaming overlays will automatically appear when users submit research queries while maintaining the existing instant response behavior for simple conversations.

## 🧪 Testing & Verification

### To Test Streaming Overlays:
1. **Start the development server**: `npm run dev` or `bun dev`
2. **Navigate to AI Assistant**: Use the Stratix model
3. **Send a research query**: Try "analyze the market trends for electric vehicles"
4. **Observe overlays**: You should see real-time progress updates on the AI message
5. **Test simple queries**: Try "hello" - should get instant response without overlays

### Alternative: Test New Implementation
1. **Navigate to** `/dashboard/streaming-test` (if route added)
2. **Use the standalone StreamingChat component** for isolated testing
3. **Test WebSocket directly** in browser console:
   ```javascript
   // Import and run tests
   import { runAllTests } from '/src/utils/streamingTests.ts';
   runAllTests();
   ```

### Expected Behavior:
- **Research queries**: Show streaming overlays with progress updates
- **Simple conversations**: Get instant responses without streaming
- **Fallback**: If WebSocket fails, falls back to REST API
- **Message tracking**: Overlays appear on the correct AI message bubble

### Console Test (Direct WebSocket Verification):
```javascript
const ws = new WebSocket('wss://ai-agent-research-optivise-production.up.railway.app/stream');
ws.onopen = () => {
  console.log('✅ Connected');
  ws.send(JSON.stringify({
    query: "analyze fintech market trends",
    context: {}
  }));
};
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('📨', data.type, data);
};
```

### Recent Fixes (2025-01-11):
- **Message ID Mismatch**: Fixed issue where overlays weren't appearing because they tracked wrong message ID
- **Streaming Function**: Updated `handleStreamingRequest` to accept and use the correct message ID
- **UI Alignment**: Ensured streaming overlays attach to the actual AI message shown in the UI
- **Alternative Implementation**: Created standalone `StreamingChat` component for isolated testing

## 🔧 Troubleshooting Guide

### Issue: Streaming overlays still not appearing
**Possible Causes & Solutions:**

1. **WebSocket Connection Issues**
   ```javascript
   // Test in browser console:
   const ws = new WebSocket('wss://ai-agent-research-optivise-production.up.railway.app/stream');
   ws.onopen = () => console.log('✅ Connected');
   ws.onerror = (e) => console.error('❌ Error:', e);
   ```

2. **Message ID Tracking**
   - Check if `streamingState` in `useStreamingOverlay` is being updated
   - Verify `isStreamingForMessage(messageId)` returns true for the correct message
   - Console log the message IDs in both streaming handler and UI components

3. **Component Rendering**
   - Ensure `StreamingOverlay` component is properly imported in `ChatMessage.tsx`
   - Check if overlay props are being passed correctly
   - Verify CSS classes for overlays are not being overridden

4. **Backend Message Types**
   - Backend might be sending different message types than expected
   - Check console for unhandled message types
   - Update `handleStreamingMessage` switch statement for new types

### Issue: Getting only final report without streaming
**Debugging Steps:**

1. **Check Query Detection**
   ```typescript
   // In useMessages.ts, add logging:
   console.log('Should stream?', shouldUseStreaming, 'Query:', prompt);
   ```

2. **Verify Model Selection**
   ```typescript
   // Ensure selectedModel === 'stratix':
   console.log('Selected model:', selectedModel);
   ```

3. **WebSocket vs REST Routing**
   ```typescript
   // In handleStratixRequest, add logging:
   console.log('Using streaming?', shouldUseStreaming && messageId);
   ```

### Issue: Overlays appear but don't update
**Check These:**

1. **Overlay State Management**
   ```typescript
   // In useStreamingOverlay.ts:
   console.log('Streaming state:', streamingState);
   console.log('Updates for message:', getUpdatesForMessage(messageId));
   ```

2. **Message Updates**
   ```typescript
   // In streaming handler:
   console.log('Adding update:', messageId, type, message);
   ```

3. **Component Re-renders**
   - Check if React components are re-rendering when streaming state changes
   - Use React DevTools to monitor state changes

### Issue: WebSocket connection fails
**Solutions:**

1. **Network/Firewall Issues**
   - Try from different network
   - Check if corporate firewall blocks WebSocket connections
   - Test with mobile hotspot

2. **SSL Certificate Issues**
   - Ensure using `wss://` not `ws://`
   - Check browser console for SSL errors

3. **Backend Availability**
   - Test REST endpoint first: `https://ai-agent-research-optivise-production.up.railway.app/research`
   - Check Railway app status

### Issue: Performance or Memory Leaks
**Optimization:**

1. **WebSocket Cleanup**
   ```typescript
   // Ensure proper cleanup:
   useEffect(() => {
     return () => {
       if (wsRef.current) {
         wsRef.current.close();
       }
     };
   }, []);
   ```

2. **State Management**
   - Clear streaming state when component unmounts
   - Limit number of stored streaming updates

### Emergency Fallback
If streaming continues to fail, you can temporarily modify the detection logic:

```typescript
// In useMessages.ts, force REST API for all queries:
const shouldUseStreaming = false; // Disable streaming

// Or force streaming for all queries:
const shouldUseStreaming = true; // Force streaming
```
