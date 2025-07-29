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
}

export interface FeedbackOption {
  text: string;
  value: string;
}

export interface DeerMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  finishReason?: 'interrupt' | 'completed' | 'error';
  options?: FeedbackOption[];
  toolCalls?: ToolCall[];
  metadata?: {
    agent?: string;
    threadId?: string;
    title?: string;
    thought?: string;
    steps?: string[];
    audioUrl?: string;
    reasoningContent?: string;
    thinkingPhases?: Array<{ phase: string; content: string }>;
    reasoningSteps?: Array<{ step: string; content: string }>;
    searchActivities?: Array<{ query: string; results?: any[] }>;
    visitedUrls?: Array<{ url: string; title?: string; content?: string }>;
    reportContent?: string;
    citations?: any[];
    planSteps?: any[];
    hasEnoughContext?: boolean;
    isPlannerDirectAnswer?: boolean;
    researchState?: 'researching' | 'generating_report' | 'report_generated';
  };
}

// Legacy compatibility interfaces
export interface ResearchActivity {
  id: string;
  toolType: 'web-search' | 'crawl' | 'python' | 'retriever';
  title: string;
  content: any;
  timestamp: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  threadId?: string;
}

export interface ResearchSession {
  id: string;
  threadId: string;
  planId?: string;
  reportId?: string;
  activities: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface DeerFlowMessageState {
  // Simple state management
  currentThreadId: string;
  messageMap: Map<string, DeerMessage>;
  threadMessages: Map<string, string[]>; // threadId -> messageIds[]
  isResponding: boolean;
  currentPrompt: string;
  
  // Simplified React-based panel state
  researchPanelState: {
    isOpen: boolean;
    openResearchId: string | null;
    activeTab: 'activities' | 'report';
  };
  reportContent: string;
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
  researchActivities: ResearchActivity[];
  researchSessions: ResearchSession[];
  
  // Legacy compatibility - no-op methods
  addResearchActivity: (activity: Omit<ResearchActivity, 'id' | 'timestamp'>) => void;
  updateResearchActivity: (activityId: string, updates: Partial<ResearchActivity>) => void;
  createResearchSession: (threadId: string) => ResearchSession;
  getResearchSession: (threadId: string) => ResearchSession | undefined;
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
  messageMap: new Map(),
  threadMessages: new Map(),
  isResponding: false,
  currentPrompt: '',
  researchPanelState: {
    isOpen: false,
    openResearchId: null,
    activeTab: 'activities'
  },
  reportContent: '',

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
    const { messageMap, threadMessages, currentThreadId } = get();
    const newMessage: DeerMessage = {
      ...message,
      id: nanoid(),
      timestamp: new Date(),
      metadata: {
        ...message.metadata,
        threadId: currentThreadId
      }
    };

    // Update Map-based storage immediately
    const newMessageMap = new Map(messageMap);
    newMessageMap.set(newMessage.id, newMessage);

    const newThreadMessages = new Map(threadMessages);
    const currentMessages = newThreadMessages.get(currentThreadId) || [];
    newThreadMessages.set(currentThreadId, [...currentMessages, newMessage.id]);

    set({ 
      messageMap: newMessageMap,
      threadMessages: newThreadMessages
    });
  },

  addMessageWithId: (message) => {
    const { messageMap, threadMessages, currentThreadId } = get();
    const threadId = message.metadata?.threadId || currentThreadId;

    // Update Map-based storage immediately
    const newMessageMap = new Map(messageMap);
    newMessageMap.set(message.id, message);

    const newThreadMessages = new Map(threadMessages);
    const currentMessages = newThreadMessages.get(threadId) || [];
    if (!currentMessages.includes(message.id)) {
      newThreadMessages.set(threadId, [...currentMessages, message.id]);
    }

    set({ 
      messageMap: newMessageMap,
      threadMessages: newThreadMessages
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
      messageMap: new Map(),
      threadMessages: new Map(),
      reportContent: '',
      researchPanelState: {
        isOpen: false,
        openResearchId: null,
        activeTab: 'activities'
      }
    });
  },

  getMessagesByThread: (threadId) => {
    const { messageMap, threadMessages } = get();
    const messageIds = threadMessages.get(threadId) || [];
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
  
  get researchActivities() {
    return [];
  },
  
  get researchSessions() {
    return [];
  },

  // Legacy compatibility - no-op methods
  addResearchActivity: () => {
    // No-op for compatibility
  },
  
  updateResearchActivity: () => {
    // No-op for compatibility
  },
  
  createResearchSession: (threadId) => {
    return {
      id: nanoid(),
      threadId,
      activities: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  },
  
  getResearchSession: () => {
    return undefined;
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