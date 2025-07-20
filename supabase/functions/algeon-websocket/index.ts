import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";
  
  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  let railwaySocket: WebSocket | null = null;
  let heartbeatInterval: number | null = null;
  
  const cleanup = () => {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    if (railwaySocket && railwaySocket.readyState === WebSocket.OPEN) {
      railwaySocket.close();
    }
  };

  socket.onopen = () => {
    console.log('✅ Client WebSocket connected');
  };

  socket.onmessage = async (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log('📨 Received message from client:', message);
      
      if (message.type === 'ping') {
        socket.send(JSON.stringify({ type: 'pong' }));
        return;
      }
      
      // Handle research query
      if (message.query) {
        console.log('🔬 Starting research query:', message.query);
        
        // Connect to Railway WebSocket
        const railwayUrl = 'wss://opti-agent3-wrappers.up.railway.app/api/research/stream';
        railwaySocket = new WebSocket(railwayUrl);
        
        railwaySocket.onopen = () => {
          console.log('🔗 Connected to Railway agent');
          
          // Set up heartbeat
          heartbeatInterval = setInterval(() => {
            if (railwaySocket && railwaySocket.readyState === WebSocket.OPEN) {
              railwaySocket.send(JSON.stringify({ type: 'ping' }));
            }
          }, 30000);
          
          // Forward the query to Railway
          railwaySocket.send(JSON.stringify({
            query: message.query,
            research_type: message.research_type || 'competitive_analysis',
            client_message_id: message.client_message_id,
            scope: message.scope || 'global',
            depth: message.depth || 'comprehensive',
            context: {
              platform: "optivise",
              session_id: message.client_message_id,
              user_context: "business_research"
            }
          }));
        };
        
        railwaySocket.onmessage = (railwayEvent) => {
          console.log('📡 Received from Railway:', railwayEvent.data);
          // Forward Railway messages to client
          socket.send(railwayEvent.data);
        };
        
        railwaySocket.onerror = (error) => {
          console.error('❌ Railway WebSocket error:', error);
          socket.send(JSON.stringify({
            client_message_id: message.client_message_id,
            type: 'error',
            error: 'Connection to research service failed'
          }));
        };
        
        railwaySocket.onclose = (closeEvent) => {
          console.log('🔌 Railway WebSocket closed:', closeEvent.code, closeEvent.reason);
          cleanup();
        };
      }
    } catch (error) {
      console.error('❌ Error processing message:', error);
      socket.send(JSON.stringify({
        type: 'error',
        error: 'Invalid message format'
      }));
    }
  };

  socket.onerror = (error) => {
    console.error('❌ Client WebSocket error:', error);
    cleanup();
  };

  socket.onclose = () => {
    console.log('🔌 Client WebSocket closed');
    cleanup();
  };

  return response;
});