/**
 * @file deerFlowMessageStore.ts
 * @description Store matching DeerFlow exactly with Launch Lens compatibility
 */

import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { nanoid } from 'nanoid';

// Match DeerFlow exactly - single persistent thread ID
const THREAD_ID = nanoid();

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
  options?: FeedbackOption[];
  interruptFeedback?: string;
}

export interface DeerFlowMessageStore {
  // Core DeerFlow state (exact match)
  responding: boolean;
  threadId: string | undefined;
  messageIds: string[];
  messages: Map<string, DeerMessage>;
  researchIds: string[];
  researchPlanIds: Map<string, string>;
  researchReportIds: Map<string, string>;
  researchActivityIds: Map<string, string[]>;
  ongoingResearchId: string | null;
  openResearchId: string | null;

  // Core DeerFlow actions (exact signatures)
  appendMessage: (message: DeerMessage) => void;
  updateMessage: (message: DeerMessage) => void;
  updateMessages: (messages: DeerMessage[]) => void;
  openResearch: (researchId: string | null) => void;
  closeResearch: () => void;
  setOngoingResearch: (researchId: string | null) => void;

  // Legacy compatibility fields
  currentThreadId: string;
  isResponding: boolean;
  currentPrompt: string;
  streamingMessageId: string | null;
  researchPanelState: {
    isOpen: boolean;
    openResearchId: string | null;
    activeTab: 'activities' | 'report';
  };
  reportContent: string;
  error: {
    message: string | null;
    type: 'network' | 'stream' | 'validation' | null;
    recoverable: boolean;
  };

  // Legacy compatibility methods
  createNewThread: (forceDifferent?: boolean) => string;
  setCurrentThread: (threadId: string) => void;
  addMessage: (message: Omit<DeerMessage, 'id' | 'timestamp'>) => void;
  addMessageWithId: (message: DeerMessage) => void;
  existsMessage: (messageId: string) => boolean;
  updateMessageById: (messageId: string, updates: Partial<DeerMessage>) => void;
  getMessage: (messageId: string) => DeerMessage | undefined;
  findMessageByToolCallId: (toolCallId: string) => DeerMessage | undefined;
  clearMessages: () => void;
  getMessagesByThread: (threadId: string) => DeerMessage[];
  getAllMessages: () => DeerMessage[];
  autoStartResearchOnFirstActivity: (message: DeerMessage) => string | null;
  startResearch: (plannerMessageId: string) => string | null;
  addResearchActivity: (researchId: string, messageId: string) => void;
  setResearchReport: (researchId: string, reportMessageId: string) => void;
  getResearchStatus: (researchId: string) => 'researching' | 'generating-report' | 'completed' | 'unknown';
  getResearchTitle: (researchId: string) => string;
  getCurrentResearchId: () => string | null;
  openResearchPanel: (researchId: string, tab?: 'activities' | 'report') => void;
  closeResearchPanel: () => void;
  switchResearchTab: (tab: 'activities' | 'report') => void;
  resetOngoingResearch: () => void;
  getThreadContext: (threadId: string) => { plannerIndicatedDirectAnswer: boolean; expectingReporterDirectAnswer: boolean };
  setResearchPanel: (isOpen: boolean, messageId?: string, tab?: 'activities' | 'report') => void;
  setReportContent: (content: string) => void;
  setCurrentPrompt: (prompt: string) => void;
  setIsResponding: (responding: boolean) => void;
}

// Helper functions matching DeerFlow exactly
function existsMessage(messageIds: string[], id: string) {
  return messageIds.includes(id);
}

function getMessage(messages: Map<string, DeerMessage>, id: string) {
  return messages.get(id);
}

function findMessageByToolCallId(messages: Map<string, DeerMessage>, toolCallId: string) {
  return Array.from(messages.values())
    .reverse()
    .find((message) => {
      if (message.toolCalls) {
        return message.toolCalls.some((toolCall) => toolCall.id === toolCallId);
      }
      return false;
    });
}

function appendMessage(message: DeerMessage, set: any, get: any) {
  if (
    message.agent === "coder" ||
    message.agent === "reporter" ||
    message.agent === "researcher"
  ) {
    const { ongoingResearchId } = get();
    if (!ongoingResearchId) {
      const id = message.id;
      appendResearch(id, set, get);
      get().openResearch(id);
    }
    appendResearchActivity(message, set, get);
  }
  
  set((state: DeerFlowMessageStore) => ({
    messageIds: [...state.messageIds, message.id],
    messages: new Map(state.messages).set(message.id, message),
  }));
}

function updateMessage(message: DeerMessage, set: any, get: any) {
  const { ongoingResearchId } = get();
  if (
    ongoingResearchId &&
    message.agent === "reporter" &&
    !message.isStreaming
  ) {
    set({ ongoingResearchId: null });
  }
  
  set((state: DeerFlowMessageStore) => ({
    messages: new Map(state.messages).set(message.id, message),
  }));
}

function appendResearch(researchId: string, set: any, get: any) {
  let planMessage: DeerMessage | undefined;
  const { messageIds, messages } = get();
  const reversedMessageIds = [...messageIds].reverse();
  
  for (const messageId of reversedMessageIds) {
    const message = getMessage(messages, messageId);
    if (message?.agent === "planner") {
      planMessage = message;
      break;
    }
  }
  
  if (planMessage) {
    const messageIds = [researchId];
    messageIds.unshift(planMessage.id);
    
    set((state: DeerFlowMessageStore) => ({
      ongoingResearchId: researchId,
      researchIds: [...state.researchIds, researchId],
      researchPlanIds: new Map(state.researchPlanIds).set(researchId, planMessage!.id),
      researchActivityIds: new Map(state.researchActivityIds).set(researchId, messageIds),
    }));
  }
}

function appendResearchActivity(message: DeerMessage, set: any, get: any) {
  const { ongoingResearchId, researchActivityIds, researchReportIds } = get();
  if (ongoingResearchId) {
    const current = researchActivityIds.get(ongoingResearchId)!;
    if (!current.includes(message.id)) {
      set((state: DeerFlowMessageStore) => ({
        researchActivityIds: new Map(state.researchActivityIds).set(ongoingResearchId, [
          ...current,
          message.id,
        ]),
      }));
    }
    if (message.agent === "reporter") {
      set((state: DeerFlowMessageStore) => ({
        researchReportIds: new Map(state.researchReportIds).set(
          ongoingResearchId,
          message.id,
        ),
      }));
    }
  }
}

export const useDeerFlowMessageStore = create<DeerFlowMessageStore>()((set, get) => ({
  // Core DeerFlow state
  responding: false,
  threadId: THREAD_ID,
  messageIds: [],
  messages: new Map<string, DeerMessage>(),
  researchIds: [],
  researchPlanIds: new Map<string, string>(),
  researchReportIds: new Map<string, string>(),
  researchActivityIds: new Map<string, string[]>(),
  ongoingResearchId: null,
  openResearchId: null,

  // Legacy compatibility fields
  currentThreadId: THREAD_ID,
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

  // Core DeerFlow actions
  appendMessage(message: DeerMessage) {
    appendMessage(message, set, get);
  },
  
  updateMessage(message: DeerMessage) {
    updateMessage(message, set, get);
  },
  
  updateMessages(messages: DeerMessage[]) {
    set((state) => {
      const newMessages = new Map(state.messages);
      messages.forEach((m) => newMessages.set(m.id, m));
      return { messages: newMessages };
    });
  },
  
  openResearch(researchId: string | null) {
    set({ openResearchId: researchId });
  },
  
  closeResearch() {
    set({ openResearchId: null });
  },
  
  setOngoingResearch(researchId: string | null) {
    set({ ongoingResearchId: researchId });
  },

  // Legacy compatibility methods
  createNewThread: (forceDifferent = false) => {
    const threadId = forceDifferent ? nanoid() : THREAD_ID;
    set({ 
      currentThreadId: threadId,
      threadId,
      currentPrompt: '',
      responding: false,
      isResponding: false,
      ...(forceDifferent && {
        researchIds: [],
        researchActivityIds: new Map(),
        researchReportIds: new Map(),
        researchPlanIds: new Map(),
        ongoingResearchId: null,
        openResearchId: null,
      }),
      researchPanelState: {
        isOpen: false,
        openResearchId: null,
        activeTab: 'activities'
      }
    });
    return threadId;
  },

  setCurrentThread: (threadId) => {
    set({ currentThreadId: threadId, threadId });
  },

  addMessage: (message) => {
    const newMessage: DeerMessage = {
      ...message,
      id: nanoid(),
      timestamp: new Date(),
      threadId: message.threadId || get().currentThreadId,
      contentChunks: message.contentChunks || []
    };
    get().appendMessage(newMessage);
  },

  addMessageWithId: (message) => {
    get().appendMessage(message);
  },

  existsMessage: (messageId) => {
    return get().messageIds.includes(messageId);
  },

  updateMessageById: (messageId, updates) => {
    const existingMessage = get().messages.get(messageId);
    if (existingMessage) {
      const updatedMessage = { ...existingMessage, ...updates };
      get().updateMessage(updatedMessage);
    }
  },

  getMessage: (messageId) => {
    return get().messages.get(messageId);
  },

  findMessageByToolCallId: (toolCallId) => {
    return findMessageByToolCallId(get().messages, toolCallId);
  },

  clearMessages: () => {
    set({ 
      messageIds: [],
      messages: new Map(),
      reportContent: '',
      researchPanelState: {
        isOpen: false,
        openResearchId: null,
        activeTab: 'activities'
      }
    });
  },

  getMessagesByThread: (threadId) => {
    const { messages, messageIds } = get();
    return messageIds
      .map(id => messages.get(id))
      .filter((msg): msg is DeerMessage => msg !== undefined && msg.threadId === threadId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  },

  getAllMessages: () => {
    const { messages } = get();
    return Array.from(messages.values())
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  },

  autoStartResearchOnFirstActivity: (message) => {
    const { ongoingResearchId, messageIds, messages } = get();
    
    if (!ongoingResearchId && (message.agent === 'researcher' || message.agent === 'coder' || message.agent === 'reporter')) {
      const reversedMessageIds = [...messageIds].reverse();
      let plannerMessage;
      
      for (const messageId of reversedMessageIds) {
        const msg = messages.get(messageId);
        if (msg?.agent === 'planner') {
          plannerMessage = msg;
          break;
        }
      }
      
      if (plannerMessage) {
        const researchId = message.id;
        appendResearch(researchId, set, get);
        get().openResearch(researchId);
        
        set({
          researchPanelState: {
            isOpen: true,
            openResearchId: researchId,
            activeTab: 'activities'
          }
        });
        
        return researchId;
      }
    }
    
    return null;
  },

  startResearch: (plannerMessageId) => {
    const plannerMessage = get().messages.get(plannerMessageId);
    if (plannerMessage?.agent === 'planner') {
      const researchId = nanoid();
      appendResearch(researchId, set, get);
      get().openResearch(researchId);
      
      set({
        researchPanelState: {
          isOpen: true,
          openResearchId: researchId,
          activeTab: 'activities'
        }
      });
      
      return researchId;
    }
    return null;
  },

  addResearchActivity: (researchId, messageId) => {
    const { researchActivityIds } = get();
    const currentActivities = researchActivityIds.get(researchId) || [];
    
    if (!currentActivities.includes(messageId)) {
      set({
        researchActivityIds: new Map(researchActivityIds).set(researchId, [...currentActivities, messageId])
      });
    }
  },

  setResearchReport: (researchId, reportMessageId) => {
    const { researchReportIds } = get();
    
    set({
      researchReportIds: new Map(researchReportIds).set(researchId, reportMessageId),
      ongoingResearchId: null
    });
  },

  getResearchStatus: (researchId) => {
    const { researchReportIds, ongoingResearchId, messages } = get();
    
    const reportId = researchReportIds.get(researchId);
    const isOngoing = ongoingResearchId === researchId;
    
    if (reportId) {
      const reportMessage = messages.get(reportId);
      if (reportMessage?.isStreaming) {
        return 'generating-report';
      }
      return 'completed';
    }
    
    if (isOngoing) {
      return 'researching';
    }
    
    return 'unknown';
  },

  getResearchTitle: (researchId) => {
    const { researchPlanIds, messages } = get();
    const planId = researchPlanIds.get(researchId);
    
    if (planId) {
      const planMessage = messages.get(planId);
      try {
        const planData = JSON.parse(planMessage?.content || '{}');
        return planData.title || 'Deep Research';
      } catch {
        return planMessage?.content?.slice(0, 50) || 'Deep Research';
      }
    }
    return 'Deep Research';
  },

  getCurrentResearchId: () => {
    return get().ongoingResearchId;
  },

  openResearchPanel: (researchId, tab = 'activities') => {
    set({
      openResearchId: researchId,
      researchPanelState: {
        isOpen: true,
        openResearchId: researchId,
        activeTab: tab
      }
    });
  },

  closeResearchPanel: () => {
    set({
      openResearchId: null,
      researchPanelState: {
        isOpen: false,
        openResearchId: null,
        activeTab: 'activities'
      }
    });
  },

  switchResearchTab: (tab) => {
    const { researchPanelState } = get();
    set({
      researchPanelState: {
        ...researchPanelState,
        activeTab: tab
      }
    });
  },

  resetOngoingResearch: () => {
    set({
      ongoingResearchId: null,
      responding: false,
      isResponding: false
    });
  },

  getThreadContext: () => {
    return { 
      plannerIndicatedDirectAnswer: false, 
      expectingReporterDirectAnswer: false 
    };
  },

  setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),
  
  setIsResponding: (responding) => set({ isResponding: responding, responding }),
  
  setResearchPanel: (isOpen, messageId, tab = 'activities') => {
    set(state => ({
      researchPanelState: {
        isOpen,
        openResearchId: isOpen ? (messageId || state.researchPanelState.openResearchId) : null,
        activeTab: tab
      }
    }));
  },
  
  setReportContent: (content) => set({ reportContent: content }),
}));

/**
 * Individual message hook with useShallow for efficient updates
 */
export const useMessage = (messageId: string | null | undefined) => {
  return useDeerFlowMessageStore(
    useShallow((state) => 
      messageId ? state.messages.get(messageId) : undefined
    )
  );
};

/**
 * Hook to get the last interrupt message (for plan confirmation)
 */
export const useLastInterruptMessage = () => {
  return useDeerFlowMessageStore(
    useShallow((state) => {
      if (state.messageIds.length >= 2) {
        const lastMessage = state.messages.get(
          state.messageIds[state.messageIds.length - 1]!,
        );
        return lastMessage?.finishReason === "interrupt" ? lastMessage : null;
      }
      return null;
    }),
  );
};

/**
 * Hook to get the message ID that is waiting for feedback
 */
export const useLastFeedbackMessageId = () => {
  return useDeerFlowMessageStore(
    useShallow((state) => {
      if (state.messageIds.length >= 2) {
        const lastMessage = state.messages.get(
          state.messageIds[state.messageIds.length - 1]!,
        );
        if (lastMessage && lastMessage.finishReason === "interrupt") {
          return state.messageIds[state.messageIds.length - 2];
        }
      }
      return null;
    }),
  );
};
