import { useState, useCallback, useRef } from 'react';

interface StreamingMessage {
  type: string;
  message?: string;
  agent?: string;
  agent_name?: string;
  agent_names?: string[];
  agents?: string[];
  progress?: number;
  source_name?: string;
  source_url?: string;
  source_type?: string;
  clickable?: boolean;
  final_answer?: string;
  sources?: string[];
  agents_consulted?: string[];
  confidence?: number;
  methodology?: string;
  status?: string;
  content_preview?: string;
  sources_found?: number;
  [key: string]: any;
}

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  sources?: Array<{ name: string; url: string; clickable: boolean; type?: string }>;
  progress?: number;
  status?: string;
  confidence?: number;
  methodology?: string;
  isComplete?: boolean;
}

export const useStreamingChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentStatus, setCurrentStatus] = useState('');
  const [discoveredSources, setDiscoveredSources] = useState<Array<{ name: string; url: string; clickable: boolean; type?: string }>>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const updateLastMessage = useCallback((updates: Partial<ChatMessage> | ((prev: ChatMessage) => ChatMessage)) => {
    setMessages(prev => {
      const newMessages = [...prev];
      if (newMessages.length > 0) {
        if (typeof updates === 'function') {
          newMessages[newMessages.length - 1] = updates(newMessages[newMessages.length - 1]);
        } else {
          newMessages[newMessages.length - 1] = {
            ...newMessages[newMessages.length - 1],
            ...updates
          };
        }
      }
      return newMessages;
    });
  }, []);

  // Determine if query should use streaming
  const shouldUseStreaming = useCallback((query: string): boolean => {
    const lowerQuery = query.toLowerCase().trim();
    
    // Don't stream casual conversation
    const casualIndicators = [
      'hello', 'hi', 'hey', 'thank you', 'thanks', 'goodbye', 'bye',
      'who are you', 'what are you', 'how are you'
    ];
    
    if (casualIndicators.some(indicator => lowerQuery.includes(indicator))) {
      return false;
    }
    
    // Use streaming for research queries
    const researchIndicators = [
      'analyze', 'research', 'market', 'strategy', 'competitive', 'trends',
      'opportunity', 'recommendation', 'should we', 'how to', 'what is',
      'regulatory', 'compliance', 'fintech', 'industry', 'business'
    ];
    
    return query.length > 10 && researchIndicators.some(indicator => lowerQuery.includes(indicator));
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content,
      isUser: true,
      timestamp: new Date()
    };
    addMessage(userMessage);

    if (shouldUseStreaming(content)) {
      await sendStreamingMessage(content);
    } else {
      await sendRestMessage(content);
    }
  }, [addMessage, shouldUseStreaming]);

  const sendStreamingMessage = useCallback(async (content: string) => {
    setIsLoading(true);
    setCurrentProgress(0);
    setCurrentStatus('Connecting...');
    setDiscoveredSources([]);

    try {
      // Close existing connection
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }

      // Connect to the working WebSocket endpoint
      const ws = new WebSocket('wss://ai-agent-research-optivise-production.up.railway.app/stream');
      wsRef.current = ws;

      // Add placeholder message for streaming updates
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        content: '',
        isUser: false,
        timestamp: new Date(),
        sources: [],
        progress: 0,
        status: 'Connecting...',
        isComplete: false
      };
      addMessage(aiMessage);

      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setCurrentStatus('Connected, sending query...');
        ws.send(JSON.stringify({
          query: content,
          context: {}
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data: StreamingMessage = JSON.parse(event.data);
          console.log('📨 Received:', data.type, data);
          handleStreamingMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setCurrentStatus('Connection error, falling back to standard mode...');
        // Fallback to REST API
        setTimeout(() => sendRestMessage(content), 1000);
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket closed');
        setIsLoading(false);
        setCurrentProgress(0);
        setCurrentStatus('');
      };

      // Timeout fallback
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CONNECTING) {
          console.log('⏰ WebSocket timeout, falling back to REST');
          ws.close();
          sendRestMessage(content);
        }
      }, 10000);

    } catch (error) {
      console.error('❌ Failed to establish WebSocket connection:', error);
      setIsLoading(false);
      // Fallback to REST API
      sendRestMessage(content);
    }
  }, [addMessage]);

  const handleStreamingMessage = useCallback((data: StreamingMessage) => {
    switch (data.type) {
      case 'started':
        setCurrentStatus('Research initiated...');
        setCurrentProgress(10);
        updateLastMessage({ 
          status: 'Research initiated...', 
          progress: 10,
          content: '🔍 Starting research...'
        });
        break;

      case 'agents_selected':
        const agentNames = data.agent_names || data.agents || [];
        setCurrentStatus(`Consulting: ${agentNames.join(', ')}`);
        setCurrentProgress(20);
        updateLastMessage({ 
          status: `Consulting: ${agentNames.join(', ')}`, 
          progress: 20,
          content: `🧠 **Consulting Specialists:** ${agentNames.join(', ')}\n\n`
        });
        break;

      case 'agent_started':
        setCurrentStatus(`${data.agent_name} starting analysis...`);
        setCurrentProgress(data.progress || 30);
        break;

      case 'source_discovery_started':
        setCurrentStatus(`🔍 ${data.agent_name} searching for current data...`);
        setCurrentProgress(data.progress || 40);
        updateLastMessage(prev => ({
          ...prev,
          content: prev.content + `\n📡 **${data.agent_name}** searching for latest information...\n`
        }));
        break;

      case 'research_progress':
        if (data.progress) {
          setCurrentProgress(data.progress);
        }
        if (data.status) {
          setCurrentStatus(data.status);
        }
        // Update content preview if available
        if (data.content_preview) {
          updateLastMessage(prev => ({
            ...prev,
            content: prev.content + (data.content_preview || ''),
            progress: data.progress
          }));
        }
        break;

      case 'source_discovered':
        if (data.source_name) {
          const newSource = {
            name: data.source_name,
            url: data.source_url || '',
            clickable: data.clickable || false,
            type: data.source_type || 'Research Source'
          };
          
          setDiscoveredSources(prev => [...prev, newSource]);
          
          updateLastMessage(prev => ({
            ...prev,
            sources: [...(prev.sources || []), newSource],
            content: prev.content + `\n📚 **Found:** ${newSource.name} ${newSource.clickable ? '(clickable)' : ''}`
          }));
        }
        break;

      case 'sources_complete':
        const sourcesCount = data.sources_found || 0;
        setCurrentStatus(`Found ${sourcesCount} sources, analyzing...`);
        setCurrentProgress(70);
        break;

      case 'expert_analysis_started':
        setCurrentStatus(`🧠 ${data.agent_name} analyzing data...`);
        setCurrentProgress(80);
        updateLastMessage(prev => ({
          ...prev,
          content: prev.content + `\n\n🔬 **${data.agent_name}** analyzing current data...\n`
        }));
        break;

      case 'synthesis_started':
        setCurrentStatus('🔗 Synthesizing insights from multiple specialists...');
        setCurrentProgress(90);
        break;

      case 'research_complete':
        setIsLoading(false);
        setCurrentProgress(100);
        setCurrentStatus('Research complete');
        
        updateLastMessage({
          content: data.final_answer || '',
          progress: 100,
          status: 'Complete',
          confidence: data.confidence,
          methodology: data.methodology,
          isComplete: true,
          sources: discoveredSources
        });
        break;

      case 'conversation_complete':
        setIsLoading(false);
        updateLastMessage({
          content: data.final_answer || data.message || '',
          status: 'Complete',
          isComplete: true
        });
        break;

      case 'error':
        setIsLoading(false);
        setCurrentStatus('Error occurred');
        updateLastMessage({
          content: `❌ Error: ${data.message}`,
          status: 'Error',
          isComplete: true
        });
        break;

      default:
        console.log('🔄 Unhandled message type:', data.type, data);
    }
  }, [updateLastMessage, discoveredSources]);

  const sendRestMessage = useCallback(async (content: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('https://ai-agent-research-optivise-production.up.railway.app/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: content,
          context: {}
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          content: result.answer,
          isUser: false,
          timestamp: new Date(),
          sources: result.sources?.map((source: string) => ({
            name: source,
            url: '',
            clickable: false
          })) || [],
          confidence: result.confidence,
          methodology: result.methodology,
          isComplete: true
        };
        
        addMessage(aiMessage);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('❌ REST API error:', error);
      const errorMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        content: 'Sorry, there was an error processing your request. Please try again.',
        isUser: false,
        timestamp: new Date(),
        isComplete: true
      };
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [addMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentProgress(0);
    setCurrentStatus('');
    setDiscoveredSources([]);
  }, []);

  return {
    messages,
    isLoading,
    currentProgress,
    currentStatus,
    discoveredSources,
    sendMessage,
    clearMessages
  };
};
