/**
 * @file deerFlowMessageStore.ts
 * @description Simplified Zustand store for DeerFlow messages with Map-based storage
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


interface DeerFlowMessageState {
  // Core DeerFlow state structure (exact match)
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
  
  // Legacy compatibility fields for existing Launch Lens components
  currentThreadId: string;
  isResponding: boolean;
  currentPrompt: string;
  streamingMessageId: string | null;
  
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
  // Core DeerFlow actions (exact signatures)
  appendMessage: (message: DeerMessage) => void;
  updateMessage: (message: DeerMessage) => void;
  updateMessages: (messages: DeerMessage[]) => void;
  openResearch: (researchId: string | null) => void;
  closeResearch: () => void;
  setOngoingResearch: (researchId: string | null) => void;
  
  // Thread management
  createNewThread: (forceDifferent?: boolean) => string;
  setCurrentThread: (threadId: string) => void;
  
  // Legacy compatibility - message actions
  addMessage: (message: Omit<DeerMessage, 'id' | 'timestamp'>) => void;
  addMessageWithId: (message: DeerMessage) => void;
  existsMessage: (messageId: string) => boolean;
  updateMessageById: (messageId: string, updates: Partial<DeerMessage>) => void;
  getMessage: (messageId: string) => DeerMessage | undefined;
  findMessageByToolCallId: (toolCallId: string) => DeerMessage | undefined;
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
  resetOngoingResearch: () => void;
  
  // Legacy compatibility
  getThreadContext: (threadId: string) => { plannerIndicatedDirectAnswer: boolean; expectingReporterDirectAnswer: boolean };
  setResearchPanel: (isOpen: boolean, messageId?: string, tab?: 'activities' | 'report') => void;
  setReportContent: (content: string) => void;
  setCurrentPrompt: (prompt: string) => void;
  setIsResponding: (responding: boolean) => void;
}

type DeerFlowMessageStore = DeerFlowMessageState & DeerFlowMessageActions;

export const useDeerFlowMessageStore = create<DeerFlowMessageStore>()((set, get) => ({
  // Initial state matching DeerFlow exactly
  responding: false,
  threadId: THREAD_ID,
  messageIds: [],
  messages: new Map<string, DeerMessage>(),
  researchIds: [],
  researchPlanIds: new Map(),
  researchReportIds: new Map(),
  researchActivityIds: new Map(),
  ongoingResearchId: null,
  openResearchId: null,
  
  // Legacy compatibility fields
  currentThreadId: THREAD_ID,
  messageMap: new Map(),
  threadMessageIds: new Map(),
  isResponding: false,
  currentPrompt: '',
  streamingMessageId: null,
  
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
  createNewThread: (forceDifferent = false) => {
    let threadId;
    
    if (forceDifferent) {
      threadId = nanoid(); // Create new thread for fresh conversation
    } else {
      threadId = get().currentThreadId; // Keep current thread for research continuity
    }
    
    set({ 
      currentThreadId: threadId,
      currentPrompt: '',
      isResponding: false,
      // DON'T reset research state for same thread
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
    
    console.log('🔗 Thread management:', forceDifferent ? 'new thread' : 'persistent thread', threadId);
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

    // CRITICAL: Match DeerFlow - handle research auto-start BEFORE setting state
    if (newMessage.agent === 'researcher' || newMessage.agent === 'coder' || newMessage.agent === 'reporter') {
      const { ongoingResearchId } = get();
      if (!ongoingResearchId) {
        // Auto-start research exactly like DeerFlow
        const reversedMessageIds = [...messageIds].reverse();
        let plannerMessage;
        
        for (const messageId of reversedMessageIds) {
          const msg = messageMap.get(messageId);
          if (msg?.agent === 'planner') {
            plannerMessage = msg;
            break;
          }
        }
        
        if (plannerMessage) {
          const researchId = newMessage.id;
          const activityIds = [researchId];
          activityIds.unshift(plannerMessage.id);
          
          set({
            messageIds: [...messageIds, newMessage.id],
            messageMap: newMessageMap,
            threadMessageIds: newThreadMessageIds,
            researchIds: [...get().researchIds, researchId],
            researchPlanIds: new Map(get().researchPlanIds).set(researchId, plannerMessage.id),
            researchActivityIds: new Map(get().researchActivityIds).set(researchId, activityIds),
            ongoingResearchId: researchId,
            openResearchId: researchId,
            researchPanelState: {
              isOpen: true,
              openResearchId: researchId,
              activeTab: 'activities'
            }
          });
          
          console.log('🔬 Auto-started research (DeerFlow style):', researchId, 'Agent:', newMessage.agent);
          return; // Early return, state already set
        }
      } else {
        // Add to existing research activities
        const currentResearchId = ongoingResearchId;
        const currentActivities = get().researchActivityIds.get(currentResearchId) || [];
        if (!currentActivities.includes(newMessage.id)) {
          set({
            messageIds: [...messageIds, newMessage.id],
            messageMap: newMessageMap,
            threadMessageIds: newThreadMessageIds,
            researchActivityIds: new Map(get().researchActivityIds).set(currentResearchId, [...currentActivities, newMessage.id])
          });
          
          // Auto-detect reporter as research report
          if (newMessage.agent === 'reporter') {
            get().setResearchReport(currentResearchId, newMessage.id);
          }
          
          console.log('📝 Added to existing research:', newMessage.id, 'Agent:', newMessage.agent);
          return; // Early return, state already set
        }
      }
    }

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
    
    // UPDATE: Set state first
    set({ 
      messageIds: newMessageIds,
      messageMap: newMessageMap,
      threadMessageIds: newThreadMessageIds
    });
    
    // NEW: Auto-handle research session management
    if (message.agent === 'researcher' || message.agent === 'coder' || message.agent === 'reporter') {
      console.log('🔄 addMessageWithId: Research agent detected, calling autoStartResearchOnFirstActivity');
      const store = get();
      const researchId = store.autoStartResearchOnFirstActivity(message);
      
      // Add this message to the current research activities if research is ongoing
      const currentResearchId = store.getCurrentResearchId();
      if (currentResearchId) {
        store.addResearchActivity(currentResearchId, message.id);
        
        // CRITICAL: Auto-detect reporter messages as research reports (matching DeerFlow)
        if (message.agent === 'reporter') {
          console.log('📄 Auto-detected reporter message as research report:', message.id);
          store.setResearchReport(currentResearchId, message.id);
        }
      }
    }
  },

  existsMessage: (messageId) => {
    return get().messageMap.has(messageId);
  },

  updateMessage: (messageId, updates) => {
    console.log('🔄 updateMessage called:', messageId, updates);
    const { messageMap, ongoingResearchId, researchReportIds } = get();
    const existingMessage = messageMap.get(messageId);
    
    if (existingMessage) {
      const updatedMessage = { ...existingMessage, ...updates };
      const newMessageMap = new Map(messageMap);
      newMessageMap.set(messageId, updatedMessage);
      
      // Critical: End research when reporter finishes streaming (matching DeerFlow logic)
      if (
        ongoingResearchId &&
        updatedMessage.agent === "reporter" &&
        !updatedMessage.isStreaming
      ) {
        console.log('🏁 Research completed - reporter finished streaming');
        
        // IMPORTANT: Ensure this reporter message is set as the research report
        const currentResearchId = ongoingResearchId;
        const currentReportId = researchReportIds.get(currentResearchId);
        
        if (!currentReportId) {
          console.log('📄 Setting reporter message as research report:', messageId);
          set({
            messageMap: newMessageMap,
            ongoingResearchId: null, // Mark research as complete
            researchReportIds: new Map(researchReportIds).set(currentResearchId, messageId)
          });
        } else {
          set({
            messageMap: newMessageMap,
            ongoingResearchId: null // Mark research as complete
          });
        }
      } else {
        // Enhanced Map reference replacement for React reactivity
        set({ 
          messageMap: newMessageMap
        });
      }
      console.log('✅ updateMessage completed, Map reference replaced for reactivity');
    }
  },

  getMessage: (messageId) => {
    return get().messageMap.get(messageId);
  },

  findMessageByToolCallId: (toolCallId) => {
    const { messageMap } = get();
    return Array.from(messageMap.values())
      .reverse()
      .find((message) => {
        if (message.toolCalls) {
          return message.toolCalls.some((toolCall) => toolCall.id === toolCallId);
        }
        return false;
      });
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

  // Research session management - matching DeerFlow exactly
  autoStartResearchOnFirstActivity: (message) => {
    const { ongoingResearchId, researchIds, messageIds, getMessage } = get();
    
    console.log('🔍 autoStartResearchOnFirstActivity called:', {
      messageId: message.id,
      agent: message.agent,
      ongoingResearchId,
      totalMessages: messageIds.length
    });
    
    // Only start research for researcher/coder/reporter agents (matching DeerFlow)
    if (!ongoingResearchId && (message.agent === 'researcher' || message.agent === 'coder' || message.agent === 'reporter')) {
      
      // Find the most recent planner message by searching backwards
      const reversedMessageIds = [...messageIds].reverse();
      let plannerMessage;
      
      console.log('🔍 Searching for planner message in', reversedMessageIds.length, 'messages');
      
      for (const messageId of reversedMessageIds) {
        const msg = getMessage(messageId);
        console.log('🔍 Checking message:', messageId, 'agent:', msg?.agent);
        if (msg?.agent === 'planner') {
          plannerMessage = msg;
          console.log('✅ Found planner message:', plannerMessage.id);
          break;
        }
      }
      
      if (plannerMessage) {
        // Use the research message ID as the research session ID (matching DeerFlow exactly)
        const researchId = message.id;
        
        console.log('🔬 Creating research session:', {
          researchId,
          plannerId: plannerMessage.id,
          triggerId: message.id,
          agent: message.agent
        });
        
        // Match DeerFlow: Start with research message first, then add planner to activities
        const activityIds = [researchId];
        activityIds.unshift(plannerMessage.id); // Add planner at beginning like DeerFlow
        
        set({
          researchIds: [...researchIds, researchId],
          researchPlanIds: new Map(get().researchPlanIds).set(researchId, plannerMessage.id),
          researchActivityIds: new Map(get().researchActivityIds).set(researchId, activityIds),
          ongoingResearchId: researchId,
          // CRITICAL: Auto-open research panel like DeerFlow does
          openResearchId: researchId,
          researchPanelState: {
            isOpen: true,
            openResearchId: researchId,
            activeTab: 'activities'
          }
        });
        
        console.log('🔬 Auto-started research session:', researchId, 'triggered by:', message.agent, '- Panel auto-opened');
        return researchId;
      } else {
        console.log('❌ No planner message found to link research session');
      }
    }
    
    return null;
  },

  // MODIFIED: Manual research start (for UI buttons) - now accepts planner message ID
  startResearch: (plannerMessageId) => {
    const { researchIds, researchPlanIds, researchActivityIds, getMessage } = get();
    
    // Get the planner message
    const plannerMessage = getMessage(plannerMessageId);
    if (!plannerMessage || plannerMessage.agent !== 'planner') {
      console.error('❌ startResearch called with invalid planner message ID:', plannerMessageId);
      return null;
    }
    
    // Create a research session ID (different from planner ID to avoid conflicts)
    const researchId = nanoid();
    
    set({
      researchIds: [...researchIds, researchId],
      researchPlanIds: new Map(researchPlanIds).set(researchId, plannerMessageId),
      researchActivityIds: new Map(researchActivityIds).set(researchId, [plannerMessageId]),
      ongoingResearchId: researchId,
      openResearchId: researchId,
      researchPanelState: {
        isOpen: true,
        openResearchId: researchId,
        activeTab: 'activities'
      }
    });
    
    console.log('🔬 Manual research session started from planner:', plannerMessageId, 'Research ID:', researchId);
    return researchId;
  },

  addResearchActivity: (researchId, messageId) => {
    const { researchActivityIds } = get();
    const newActivityIds = new Map(researchActivityIds);
    const currentActivities = newActivityIds.get(researchId) || [];
    
    // Check for duplicates like DeerFlow does
    if (!currentActivities.includes(messageId)) {
      newActivityIds.set(researchId, [...currentActivities, messageId]);
      set({ researchActivityIds: newActivityIds });
      console.log('🔍 Added research activity:', messageId, 'to research:', researchId);
    } else {
      console.log('⚠️ Skipped duplicate research activity:', messageId, 'for research:', researchId);
    }
  },

  setResearchReport: (researchId, reportMessageId) => {
    const { researchReportIds } = get();
    
    set({
      researchReportIds: new Map(researchReportIds).set(researchId, reportMessageId),
      // Don't auto-open panel - let user choose (matching DeerFlow)
      ongoingResearchId: null // Mark research as complete
    });
    
    console.log('📄 Set research report:', reportMessageId, 'for research:', researchId);
  },

  getResearchStatus: (researchId) => {
    const { researchReportIds, ongoingResearchId, getMessage } = get();
    
    console.log('🔍 getResearchStatus:', {
      researchId,
      ongoingResearchId,
      hasReport: researchReportIds.has(researchId),
      allResearchIds: get().researchIds
    });
    
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
  },

  resetOngoingResearch: () => {
    set({
      ongoingResearchId: null,
      isResponding: false
    });
    console.log('🔄 Reset ongoing research state');
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

/**
 * Hook to get the last interrupt message (for plan confirmation)
 */
export const useLastInterruptMessage = () => {
  return useDeerFlowMessageStore(
    useShallow((state) => {
      if (state.messageIds.length >= 2) {
        const lastMessage = state.messageMap.get(
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
        const lastMessage = state.messageMap.get(
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