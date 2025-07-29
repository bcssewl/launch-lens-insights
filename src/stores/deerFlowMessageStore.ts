/**
 * @file deerFlowMessageStore.ts
 * @description Simplified Zustand store for DeerFlow messages with Map-based storage
 */

import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
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
  
  // Research session tracking
  researchIds: string[];
  researchActivityIds: Map<string, string[]>; // researchId -> messageIds
  researchReportIds: Map<string, string>; // researchId -> reportMessageId
  researchPlanIds: Map<string, string>; // researchId -> planMessageId
  
  // Active research management
  ongoingResearchId: string | null;
  openResearchId: string | null;
  
  // Research panel state (legacy compatibility)
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
  
  // Research session management
  autoStartResearchOnFirstActivity: (message: DeerMessage) => string | null;
  startResearch: (plannerMessageId: string) => string | null;
  addResearchActivity: (researchId: string, messageId: string) => void;
  setResearchReport: (researchId: string, reportMessageId: string) => void;
  getResearchStatus: (researchId: string) => 'researching' | 'generating-report' | 'completed' | 'unknown';
  getResearchTitle: (researchId: string) => string;
  getCurrentResearchId: () => string | null;
  
  // Research panel management
  openResearchPanel: (researchId: string, tab?: 'activities' | 'report') => void;
  closeResearchPanel: () => void;
  switchResearchTab: (tab: 'activities' | 'report') => void;
  
  // Legacy compatibility - computed properties
  messages: DeerMessage[];
  
  // Legacy compatibility - no-op methods  
  getThreadContext: (threadId: string) => { plannerIndicatedDirectAnswer: boolean; expectingReporterDirectAnswer: boolean };
  
  // Simplified React panel management (legacy)
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
  
  // Research session tracking
  researchIds: [],
  researchActivityIds: new Map(),
  researchReportIds: new Map(),
  researchPlanIds: new Map(),
  
  // Active research management
  ongoingResearchId: null,
  openResearchId: null,
  
  // Research panel state (legacy compatibility)
  researchPanelState: {
    isOpen: false,
    openResearchId: null,
    activeTab: 'activities'
  },
  reportContent: '',
  
  // Error state
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

  // Message actions with immediate Map updates and cache invalidation
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

    console.log('📝 addMessage created:', newMessage.id, 'Thread:', currentThreadId);
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

    console.log('📝 addMessageWithId created:', message.id, 'Thread:', threadId, 'Agent:', message.agent);
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
    console.log('🔄 updateMessage called:', messageId, updates);
    const { messageMap } = get();
    const existingMessage = messageMap.get(messageId);
    
    if (existingMessage) {
      const newMessageMap = new Map(messageMap);
      newMessageMap.set(messageId, { ...existingMessage, ...updates });
      
      // Enhanced Map reference replacement for React reactivity
      set({ 
        messageMap: newMessageMap
      });
      console.log('✅ updateMessage completed, Map reference replaced for reactivity');
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
    console.log('🧹 Messages cleared');
  },

  getMessagesByThread: (threadId) => {
    console.log('🔍 getMessagesByThread called:', threadId);
    const { messageMap, threadMessageIds } = get();
    
    // Always return fresh data - no caching for immediate reactivity
    const threadMessages = threadMessageIds.get(threadId) || [];
    const result = threadMessages
      .map(id => messageMap.get(id))
      .filter((msg): msg is DeerMessage => msg !== undefined)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    console.log('📋 Returning fresh messages:', result.length);
    return result;
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
  
  setReportContent: (content) => set({ reportContent: content }),

  // Research session management
  // NEW: Auto-detect and start research on first researcher message
  autoStartResearchOnFirstActivity: (message) => {
    const { ongoingResearchId, researchIds, messageIds, getMessage } = get();
    
    // Only start research if we don't have an ongoing session
    if (!ongoingResearchId && (message.agent === 'researcher' || message.agent === 'coder' || message.agent === 'reporter')) {
      
      // Find the most recent planner message by searching backwards
      const reversedMessageIds = [...messageIds].reverse();
      let plannerMessage;
      
      for (const messageId of reversedMessageIds) {
        const msg = getMessage(messageId);
        if (msg?.agent === 'planner') {
          plannerMessage = msg;
          break;
        }
      }
      
      if (plannerMessage) {
        // Use the researcher message ID as the research session ID (matching original)
        const researchId = message.id;
        
        set({
          researchIds: [...researchIds, researchId],
          researchPlanIds: new Map(get().researchPlanIds).set(researchId, plannerMessage.id),
          researchActivityIds: new Map(get().researchActivityIds).set(researchId, [plannerMessage.id, message.id]),
          ongoingResearchId: researchId,
          openResearchId: researchId,
          researchPanelState: {
            isOpen: true,
            openResearchId: researchId,
            activeTab: 'activities'
          }
        });
        
        console.log('🔬 Auto-started research session:', researchId, 'triggered by:', message.agent);
        return researchId;
      }
    }
    
    return null;
  },

  // MODIFIED: Manual research start (for UI buttons)
  startResearch: (researcherMessageId) => {
    // Use provided researcher message ID as research session ID
    const { researchIds, researchPlanIds, researchActivityIds, messageIds, getMessage } = get();
    
    // Find associated planner message
    const reversedMessageIds = [...messageIds].reverse();
    let plannerMessage;
    
    for (const messageId of reversedMessageIds) {
      const msg = getMessage(messageId);
      if (msg?.agent === 'planner') {
        plannerMessage = msg;
        break;
      }
    }
    
    if (plannerMessage) {
      set({
        researchIds: [...researchIds, researcherMessageId],
        researchPlanIds: new Map(researchPlanIds).set(researcherMessageId, plannerMessage.id),
        researchActivityIds: new Map(researchActivityIds).set(researcherMessageId, [plannerMessage.id, researcherMessageId]),
        ongoingResearchId: researcherMessageId,
        openResearchId: researcherMessageId,
        researchPanelState: {
          isOpen: true,
          openResearchId: researcherMessageId,
          activeTab: 'activities'
        }
      });
      
      console.log('🔬 Manual research session started:', researcherMessageId);
      return researcherMessageId;
    }
    
    return null;
  },

  addResearchActivity: (researchId, messageId) => {
    const { researchActivityIds } = get();
    const newActivityIds = new Map(researchActivityIds);
    const currentActivities = newActivityIds.get(researchId) || [];
    newActivityIds.set(researchId, [...currentActivities, messageId]);
    
    set({ researchActivityIds: newActivityIds });
    console.log('🔍 Added research activity:', messageId, 'to research:', researchId);
  },

  setResearchReport: (researchId, reportMessageId) => {
    const { researchReportIds } = get();
    
    set({
      researchReportIds: new Map(researchReportIds).set(researchId, reportMessageId),
      researchPanelState: {
        isOpen: true,
        openResearchId: researchId,
        activeTab: 'report'
      },
      ongoingResearchId: null // Mark research as complete
    });
    
    console.log('📄 Set research report:', reportMessageId, 'for research:', researchId);
  },

  getResearchStatus: (researchId) => {
    const { researchReportIds, ongoingResearchId, getMessage } = get();
    const reportId = researchReportIds.get(researchId);
    const isOngoing = ongoingResearchId === researchId;
    
    if (reportId) {
      const reportMessage = getMessage(reportId);
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
    const { researchPlanIds, getMessage } = get();
    const planId = researchPlanIds.get(researchId);
    
    if (planId) {
      const planMessage = getMessage(planId);
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

  // Research panel management
  openResearchPanel: (researchId, tab = 'activities') => {
    set({
      openResearchId: researchId,
      researchPanelState: {
        isOpen: true,
        openResearchId: researchId,
        activeTab: tab
      }
    });
    console.log('🔗 Opened research panel:', researchId, 'tab:', tab);
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
    console.log('❌ Closed research panel');
  },

  switchResearchTab: (tab) => {
    const { researchPanelState } = get();
    set({
      researchPanelState: {
        ...researchPanelState,
        activeTab: tab
      }
    });
    console.log('🔄 Switched research tab to:', tab);
  }
}));

/**
 * Individual message hook with useShallow for efficient updates
 * This follows the original DeerFlow pattern for individual message subscriptions
 */
export const useMessage = (messageId: string | null | undefined) => {
  return useDeerFlowMessageStore(
    useShallow((state) => 
      messageId ? state.messageMap.get(messageId) : undefined
    )
  );
};