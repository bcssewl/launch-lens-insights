/**
 * @file deerFlowMessageStore.ts
 * @description Simplified Zustand store for DeerFlow messages with Map-based storage
 */

import { create } from 'zustand';
import { nanoid } from 'nanoid';

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
  argsChunks?: string[];
  result?: any;
  error?: string;
  status?: 'running' | 'completed' | 'error';
  timestamp?: number;
}

export interface FeedbackOption {
  text: string;
  value: string;
}

export interface DeerMessage {
  id: string;
  threadId: string;
  role: 'user' | 'assistant';
  content: string;
  contentChunks: string[];
  timestamp: Date;
  isStreaming?: boolean;
  finishReason?: 'stop' | 'interrupt' | 'tool_calls';
  toolCalls?: ToolCall[];
  reasoningContent?: string;
  reasoningContentChunks?: string[];
  agent?: string;
}


interface DeerFlowMessageState {
  // Optimized Map-based storage
  currentThreadId: string;
  messageIds: string[]; // Ordered array for rendering
  messageMap: Map<string, DeerMessage>; // Fast O(1) lookups
  threadMessageIds: Map<string, string[]>; // threadId -> messageIds
  isResponding: boolean;
  currentPrompt: string;
  streamingMessageId: string | null;
  
  // Research panel state
  researchPanelState: {
    isOpen: boolean;
    openResearchId: string | null;
    activeTab: 'activities' | 'report';
  };
  reportContent: string;
  
  // Error state
  error: {
    message: string | null;
    type: 'network' | 'stream' | 'validation' | null;
    recoverable: boolean;
  };
}

interface DeerFlowMessageActions {
  // Thread management
  createNewThread: () => string;
  setCurrentThread: (threadId: string) => void;
  
  // Message actions with Map-based storage
  addMessage: (message: Omit<DeerMessage, 'id' | 'timestamp'>) => void;
  addMessageWithId: (message: DeerMessage) => void;
  existsMessage: (messageId: string) => boolean;
  updateMessage: (messageId: string, updates: Partial<DeerMessage>) => void;
  getMessage: (messageId: string) => DeerMessage | undefined;
  clearMessages: () => void;
  getMessagesByThread: (threadId: string) => DeerMessage[];
  getAllMessages: () => DeerMessage[];
  
  // Legacy compatibility - computed properties
  messages: DeerMessage[];
  
  // Legacy compatibility - no-op methods  
  getThreadContext: (threadId: string) => { plannerIndicatedDirectAnswer: boolean; expectingReporterDirectAnswer: boolean };
  
  
  // Simplified React panel management
  setResearchPanel: (isOpen: boolean, messageId?: string, tab?: 'activities' | 'report') => void;
  setReportContent: (content: string) => void;
  setCurrentPrompt: (prompt: string) => void;
  setIsResponding: (responding: boolean) => void;
}

type DeerFlowMessageStore = DeerFlowMessageState & DeerFlowMessageActions;

export const useDeerFlowMessageStore = create<DeerFlowMessageStore>()((set, get) => ({
  // Initial state
  currentThreadId: nanoid(),
  messageIds: [],
  messageMap: new Map(),
  threadMessageIds: new Map(),
  isResponding: false,
  currentPrompt: '',
  streamingMessageId: null,
  researchPanelState: {
    isOpen: false,
    openResearchId: null,
    activeTab: 'activities'
  },
  reportContent: '',
  error: {
    message: null,
    type: null,
    recoverable: false
  },

  // Thread management
  createNewThread: () => {
    const threadId = nanoid();
    set({ 
      currentThreadId: threadId,
      currentPrompt: '',
      isResponding: false,
      researchPanelState: {
        isOpen: false,
        openResearchId: null,
        activeTab: 'activities'
      }
    });
    return threadId;
  },

  setCurrentThread: (threadId) => {
    set({ currentThreadId: threadId });
  },

  // Message actions with immediate Map updates
  addMessage: (message) => {
    const { messageMap, threadMessageIds, messageIds, currentThreadId } = get();
    const newMessage: DeerMessage = {
      ...message,
      id: nanoid(),
      timestamp: new Date(),
      threadId: message.threadId || currentThreadId,
      contentChunks: message.contentChunks || []
    };

    // Update Map-based storage immediately
    const newMessageMap = new Map(messageMap);
    newMessageMap.set(newMessage.id, newMessage);

    const newThreadMessageIds = new Map(threadMessageIds);
    const currentMessages = newThreadMessageIds.get(currentThreadId) || [];
    newThreadMessageIds.set(currentThreadId, [...currentMessages, newMessage.id]);

    set({ 
      messageIds: [...messageIds, newMessage.id],
      messageMap: newMessageMap,
      threadMessageIds: newThreadMessageIds
    });
  },

  addMessageWithId: (message) => {
    const { messageMap, threadMessageIds, messageIds, currentThreadId } = get();
    const threadId = message.threadId || currentThreadId;

    // Update Map-based storage immediately
    const newMessageMap = new Map(messageMap);
    newMessageMap.set(message.id, message);

    const newThreadMessageIds = new Map(threadMessageIds);
    const currentMessages = newThreadMessageIds.get(threadId) || [];
    if (!currentMessages.includes(message.id)) {
      newThreadMessageIds.set(threadId, [...currentMessages, message.id]);
    }

    // Add to global message list if not present
    const newMessageIds = messageIds.includes(message.id) 
      ? messageIds 
      : [...messageIds, message.id];

    set({ 
      messageIds: newMessageIds,
      messageMap: newMessageMap,
      threadMessageIds: newThreadMessageIds
    });
  },

  existsMessage: (messageId) => {
    return get().messageMap.has(messageId);
  },

  updateMessage: (messageId, updates) => {
    const { messageMap } = get();
    const existingMessage = messageMap.get(messageId);
    
    if (existingMessage) {
      const newMessageMap = new Map(messageMap);
      newMessageMap.set(messageId, { ...existingMessage, ...updates });
      set({ messageMap: newMessageMap });
    }
  },

  getMessage: (messageId) => {
    return get().messageMap.get(messageId);
  },

  clearMessages: () => {
    set({ 
      messageIds: [],
      messageMap: new Map(),
      threadMessageIds: new Map(),
      reportContent: '',
      researchPanelState: {
        isOpen: false,
        openResearchId: null,
        activeTab: 'activities'
      }
    });
  },

  getMessagesByThread: (threadId) => {
    const { messageMap, threadMessageIds } = get();
    const messageIds = threadMessageIds.get(threadId) || [];
    return messageIds
      .map(id => messageMap.get(id))
      .filter((msg): msg is DeerMessage => msg !== undefined)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  },

  getAllMessages: () => {
    const { messageMap } = get();
    return Array.from(messageMap.values())
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  },

  // Legacy compatibility - computed properties
  get messages() {
    return get().getAllMessages();
  },
  
  getThreadContext: () => {
    return { 
      plannerIndicatedDirectAnswer: false, 
      expectingReporterDirectAnswer: false 
    };
  },

  // Simplified React-based panel management with immediate updates
  setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),
  
  setIsResponding: (responding) => set({ isResponding: responding }),
  
  setResearchPanel: (isOpen, messageId, tab = 'activities') => {
    set(state => ({
      researchPanelState: {
        isOpen,
        openResearchId: isOpen ? (messageId || state.researchPanelState.openResearchId) : null,
        activeTab: tab
      }
    }));
  },
  
  setReportContent: (content) => set({ reportContent: content })
}));