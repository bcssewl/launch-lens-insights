/**
 * @file deerFlowStore.ts
 * @description Zustand store for DeerFlow chat and research state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
  argsChunks?: string[];
  result?: any;
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
  };
}

export interface ResearchActivity {
  id: string;
  toolType: 'web-search' | 'crawl' | 'python' | 'retriever';
  title: string;
  content: any;
  timestamp: Date;
  status: 'running' | 'completed' | 'failed';
}

export interface DeerSettings {
  deepThinking: boolean;
  backgroundInvestigation: boolean;
  reportStyle: 'academic' | 'popular_science' | 'news' | 'social_media';
  maxPlanIterations: number;
  maxStepNumber: number;
  maxSearchResults: number;
}

interface DeerFlowState {
  // Chat state
  messages: DeerMessage[];
  isResponding: boolean;
  currentPrompt: string;
  
  // Research state
  researchActivities: ResearchActivity[];
  reportContent: string;
  isResearchPanelOpen: boolean;
  activeResearchTab: 'activities' | 'report';
  
  // Settings
  settings: DeerSettings;
  
  // UI state
  isSettingsOpen: boolean;
}

interface DeerFlowActions {
  // Message actions
  addMessage: (message: Omit<DeerMessage, 'id' | 'timestamp'>) => void;
  addMessageWithId: (message: DeerMessage) => void;
  existsMessage: (messageId: string) => boolean;
  updateMessage: (messageId: string, updates: Partial<DeerMessage>) => void;
  clearMessages: () => void;
  
  // Research actions
  addResearchActivity: (activity: Omit<ResearchActivity, 'id' | 'timestamp'>) => void;
  updateResearchActivity: (activityId: string, updates: Partial<ResearchActivity>) => void;
  setReportContent: (content: string) => void;
  
  // UI actions
  setCurrentPrompt: (prompt: string) => void;
  setIsResponding: (responding: boolean) => void;
  setResearchPanelOpen: (open: boolean) => void;
  setActiveResearchTab: (tab: 'activities' | 'report') => void;
  setSettingsOpen: (open: boolean) => void;
  
  // Settings actions
  updateSettings: (settings: Partial<DeerSettings>) => void;
}

type DeerFlowStore = DeerFlowState & DeerFlowActions;

const defaultSettings: DeerSettings = {
  deepThinking: false,
  backgroundInvestigation: false,
  reportStyle: 'academic',
  maxPlanIterations: 3,
  maxStepNumber: 10,
  maxSearchResults: 5,
};

export const useDeerFlowStore = create<DeerFlowStore>()(
  persist(
    (set, get) => ({
      // Initial state
      messages: [],
      isResponding: false,
      currentPrompt: '',
      researchActivities: [],
      reportContent: '',
      isResearchPanelOpen: false,
      activeResearchTab: 'activities',
      settings: defaultSettings,
      isSettingsOpen: false,

      // Message actions
      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: crypto.randomUUID(),
              timestamp: new Date(),
            },
          ],
        })),

      addMessageWithId: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

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

      // Research actions
      addResearchActivity: (activity) =>
        set((state) => ({
          researchActivities: [
            ...state.researchActivities,
            {
              ...activity,
              id: crypto.randomUUID(),
              timestamp: new Date(),
            },
          ],
        })),

      updateResearchActivity: (activityId, updates) =>
        set((state) => ({
          researchActivities: state.researchActivities.map((activity) =>
            activity.id === activityId ? { ...activity, ...updates } : activity
          ),
        })),

      setReportContent: (content) => set({ reportContent: content }),

      // UI actions
      setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),
      setIsResponding: (responding) => set({ isResponding: responding }),
      setResearchPanelOpen: (open) => set({ isResearchPanelOpen: open }),
      setActiveResearchTab: (tab) => set({ activeResearchTab: tab }),
      setSettingsOpen: (open) => set({ isSettingsOpen: open }),

      // Settings actions
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
    }),
    {
      name: 'deer-flow-storage',
      partialize: (state) => ({
        settings: state.settings,
      }),
    }
  )
);