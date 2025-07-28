/**
 * @file deerFlowMessageStore.ts
 * @description Zustand store for DeerFlow messages and research state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
    agent?: string; // Store the agent type (planner, coordinator, etc.)
    title?: string;
    thought?: string;
    steps?: string[];
    audioUrl?: string;
    reasoningContent?: string;
    researchState?: 'researching' | 'generating_report' | 'report_generated';
    threadId?: string;
    
    // New DeerFlow event fields
    thinkingPhases?: Array<{ phase: string; content: string }>;
    reasoningSteps?: Array<{ step: string; content: string }>;
    searchActivities?: Array<{ query: string; results?: any[] }>;
    visitedUrls?: Array<{ url: string; title?: string; content?: string }>;
    reportContent?: string;
    citations?: any[];
    planSteps?: any[]; // Parsed plan steps for research activities
  };
}

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
  activities: string[]; // Activity IDs
  createdAt: Date;
  updatedAt: Date;
}

interface DeerFlowMessageState {
  // Current session
  currentThreadId: string;
  
  // Messages state
  messages: DeerMessage[];
  isResponding: boolean;
  currentPrompt: string;
  
  // Research state
  researchActivities: ResearchActivity[];
  researchSessions: ResearchSession[];
  reportContent: string;
  isResearchPanelOpen: boolean;
  activeResearchTab: 'activities' | 'report';
}

interface DeerFlowMessageActions {
  // Thread management
  createNewThread: () => string;
  setCurrentThread: (threadId: string) => void;
  
  // Message actions
  addMessage: (message: Omit<DeerMessage, 'id' | 'timestamp'>) => void;
  addMessageWithId: (message: DeerMessage) => void;
  existsMessage: (messageId: string) => boolean;
  updateMessage: (messageId: string, updates: Partial<DeerMessage>) => void;
  clearMessages: () => void;
  getMessagesByThread: (threadId: string) => DeerMessage[];
  
  // Research actions
  addResearchActivity: (activity: Omit<ResearchActivity, 'id' | 'timestamp'>) => void;
  updateResearchActivity: (activityId: string, updates: Partial<ResearchActivity>) => void;
  setReportContent: (content: string) => void;
  createResearchSession: (threadId: string) => ResearchSession;
  getResearchSession: (threadId: string) => ResearchSession | undefined;
  
  // UI actions
  setCurrentPrompt: (prompt: string) => void;
  setIsResponding: (responding: boolean) => void;
  setResearchPanelOpen: (open: boolean) => void;
  setActiveResearchTab: (tab: 'activities' | 'report') => void;
}

type DeerFlowMessageStore = DeerFlowMessageState & DeerFlowMessageActions;

export const useDeerFlowMessageStore = create<DeerFlowMessageStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentThreadId: nanoid(),
      messages: [],
      isResponding: false,
      currentPrompt: '',
      researchActivities: [],
      researchSessions: [],
      reportContent: '',
      isResearchPanelOpen: false,
      activeResearchTab: 'activities',

      // Thread management
      createNewThread: () => {
        const threadId = nanoid();
        set({ 
          currentThreadId: threadId,
          messages: [],
          researchActivities: [],
          reportContent: '',
          currentPrompt: ''
        });
        return threadId;
      },

      setCurrentThread: (threadId) => {
        const state = get();
        const threadMessages = state.messages.filter(msg => 
          msg.metadata?.threadId === threadId
        );
        const threadActivities = state.researchActivities.filter(activity => 
          activity.threadId === threadId
        );
        
        set({
          currentThreadId: threadId,
          messages: threadMessages,
          researchActivities: threadActivities,
          currentPrompt: ''
        });
      },

      // Message actions
      addMessage: (message) => {
        const state = get();
        const newMessage: DeerMessage = {
          ...message,
          id: nanoid(),
          timestamp: new Date(),
          metadata: {
            ...message.metadata,
            threadId: state.currentThreadId
          }
        };

        // Auto-create research session for planner/reporter messages
        if (message.metadata?.agent === 'planner' || message.metadata?.agent === 'reporter') {
          const existingSession = state.researchSessions.find(s => s.threadId === state.currentThreadId);
          if (!existingSession) {
            get().createResearchSession(state.currentThreadId);
          }
        }

        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      },

      addMessageWithId: (message) => {
        const state = get();
        const messageWithThread = {
          ...message,
          metadata: {
            ...message.metadata,
            threadId: message.metadata?.threadId || state.currentThreadId
          }
        };

        set((state) => ({
          messages: [...state.messages, messageWithThread],
        }));
      },

      existsMessage: (messageId) => {
        const state = get();
        return state.messages.some(msg => msg.id === messageId);
      },

      updateMessage: (messageId, updates) =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === messageId ? { ...msg, ...updates } : msg
          ),
        })),

      clearMessages: () =>
        set({
          messages: [],
          researchActivities: [],
          reportContent: '',
        }),

      getMessagesByThread: (threadId) => {
        const state = get();
        return state.messages.filter(msg => msg.metadata?.threadId === threadId);
      },

      // Research actions
      addResearchActivity: (activity) => {
        const state = get();
        const newActivity: ResearchActivity = {
          ...activity,
          id: nanoid(),
          timestamp: new Date(),
          threadId: state.currentThreadId
        };

        // Add to current session
        const session = state.researchSessions.find(s => s.threadId === state.currentThreadId);
        if (session) {
          session.activities.push(newActivity.id);
          session.updatedAt = new Date();
        }

        set((state) => ({
          researchActivities: [...state.researchActivities, newActivity],
        }));
      },

      updateResearchActivity: (activityId, updates) =>
        set((state) => ({
          researchActivities: state.researchActivities.map((activity) =>
            activity.id === activityId ? { ...activity, ...updates } : activity
          ),
        })),

      setReportContent: (content) => set({ reportContent: content }),

      createResearchSession: (threadId) => {
        const session: ResearchSession = {
          id: nanoid(),
          threadId,
          activities: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };

        set((state) => ({
          researchSessions: [...state.researchSessions, session]
        }));

        return session;
      },

      getResearchSession: (threadId) => {
        const state = get();
        return state.researchSessions.find(s => s.threadId === threadId);
      },

      // UI actions
      setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),
      setIsResponding: (responding) => set({ isResponding: responding }),
      setResearchPanelOpen: (open) => set({ isResearchPanelOpen: open }),
      setActiveResearchTab: (tab) => set({ activeResearchTab: tab }),
    }),
    {
      name: 'deer-flow-messages',
      partialize: (state) => ({
        messages: state.messages,
        researchActivities: state.researchActivities,
        researchSessions: state.researchSessions,
        currentThreadId: state.currentThreadId
      }),
    }
  )
);