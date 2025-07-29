/**
 * @file deerFlowMessageStore.ts
 * @description Simplified Zustand store for DeerFlow messages with Map-based storage
 */

import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { nanoid } from 'nanoid';

// ADD at top of file:
const PERSISTENT_THREAD_ID = nanoid(); // Generate once for the session

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
  createNewThread: (forceDifferent?: boolean) => string;
  setCurrentThread: (threadId: string) => void;
  
  // Message actions with exact DeerFlow behavior
  addMessage: (message: Omit<DeerMessage, 'id' | 'timestamp'>) => void;
  addMessageWithId: (message: DeerMessage) => void;
  appendMessage: (message: DeerMessage) => void; // NEW: Main entry point from original DeerFlow
  existsMessage: (messageId: string) => boolean;
  updateMessage: (messageId: string, updates: Partial<DeerMessage>) => void;
  getMessage: (messageId: string) => DeerMessage | undefined;
  findMessageByToolCallId: (toolCallId: string) => DeerMessage | undefined; // NEW: Tool call lookup
  clearMessages: () => void;
  getMessagesByThread: (threadId: string) => DeerMessage[];
  getAllMessages: () => DeerMessage[];
  
  // Research session management - DeerFlow exact behavior
  appendResearch: (researchId: string) => void; // NEW: Auto-create research session
  appendResearchActivity: (message: DeerMessage) => void; // NEW: Auto-add to research
  openResearch: (researchId: string | null) => void; // NEW: Auto-open research panel
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
  
  // Podcast generation
  listenToPodcast: (researchId: string) => Promise<void>;
  
  // Simplified React panel management (legacy)
  setResearchPanel: (isOpen: boolean, messageId?: string, tab?: 'activities' | 'report') => void;
  setReportContent: (content: string) => void;
  setCurrentPrompt: (prompt: string) => void;
  setIsResponding: (responding: boolean) => void;
}

type DeerFlowMessageStore = DeerFlowMessageState & DeerFlowMessageActions;

export const useDeerFlowMessageStore = create<DeerFlowMessageStore>()((set, get) => ({
  // Initial state
  currentThreadId: PERSISTENT_THREAD_ID, // Use persistent ID
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

    console.log('📝 addMessage created:', newMessage.id, 'Thread:', currentThreadId);
    set({ 
      messageIds: [...messageIds, newMessage.id],
      messageMap: newMessageMap,
      threadMessageIds: newThreadMessageIds
    });
  },

  // EXACT DeerFlow appendMessage behavior (main entry point)
  appendMessage: (message: DeerMessage) => {
    // STEP 1: Auto-create research session for research agents
    if (
      message.agent === "coder" ||
      message.agent === "reporter" ||
      message.agent === "researcher"
    ) {
      const currentOngoing = get().ongoingResearchId;
      if (!currentOngoing) {
        const id = message.id;
        get().appendResearch(id);
        get().openResearch(id);
      }
      get().appendResearchActivity(message);
    }
    
    // STEP 2: Add message to store
    get().addMessageWithId(message);
  },

  // Helper function: appendResearch (from original lines 220-240)
  appendResearch: (researchId: string) => {
    let planMessage: DeerMessage | undefined;
    const reversedMessageIds = [...get().messageIds].reverse();
    
    for (const messageId of reversedMessageIds) {
      const message = get().getMessage(messageId);
      if (message?.agent === "planner") {
        planMessage = message;
        break;
      }
    }
    
    if (!planMessage) {
      console.warn('No planner message found for research session');
      return;
    }
    
    const messageIds = [researchId];
    messageIds.unshift(planMessage.id);
    
    set({
      ongoingResearchId: researchId,
      researchIds: [...get().researchIds, researchId],
      researchPlanIds: new Map(get().researchPlanIds).set(researchId, planMessage.id),
      researchActivityIds: new Map(get().researchActivityIds).set(researchId, messageIds),
    });
  },

  // Helper function: appendResearchActivity
  appendResearchActivity: (message: DeerMessage) => {
    const researchId = get().ongoingResearchId;
    if (researchId) {
      const researchActivityIds = get().researchActivityIds;
      const current = researchActivityIds.get(researchId) || [];
      if (!current.includes(message.id)) {
        set({
          researchActivityIds: new Map(researchActivityIds).set(researchId, [
            ...current,
            message.id,
          ]),
        });
      }
      if (message.agent === "reporter") {
        set({
          researchReportIds: new Map(get().researchReportIds).set(researchId, message.id),
        });
      }
    }
  },

  // Tool Call ID Lookup (Lines 170-180 from original)
  findMessageByToolCallId: (toolCallId: string) => {
    return Array.from(get().messageMap.values())
      .reverse()
      .find((message) => {
        if (message.toolCalls) {
          return message.toolCalls.some((toolCall) => toolCall.id === toolCallId);
        }
        return false;
      });
  },

  // Auto-Open Research Panel (Lines 250-270 from original)
  openResearch: (researchId: string | null) => {
    set({ 
      openResearchId: researchId,
      researchPanelState: {
        isOpen: researchId !== null,
        openResearchId: researchId,
        activeTab: 'activities'
      }
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
    
    // Set state first
    set({ 
      messageIds: newMessageIds,
      messageMap: newMessageMap,
      threadMessageIds: newThreadMessageIds
    });
    
    // Automated research session management
    if (message.agent === 'researcher' || message.agent === 'coder' || message.agent === 'reporter') {
      console.log('🔬 Auto-research trigger:', message.id, 'Agent:', message.agent);
      const store = get();
      const researchId = store.autoStartResearchOnFirstActivity(message);
      
      // Add to existing research session if auto-start didn't create one
      if (!researchId && store.ongoingResearchId) {
        console.log('🔬 Adding to ongoing research:', store.ongoingResearchId);
        store.addResearchActivity(store.ongoingResearchId, message.id);
      }
      
      // Handle reporter completion - auto-close research and switch to report tab
      if (message.agent === 'reporter' && !message.isStreaming) {
        console.log('📄 Reporter finished, completing research session');
        const activeResearchId = store.ongoingResearchId || researchId;
        if (activeResearchId) {
          store.setResearchReport(activeResearchId, message.id);
        }
      }
    }
  },

  existsMessage: (messageId) => {
    return get().messageMap.has(messageId);
  },

  updateMessage: (messageId, updates) => {
    const { messageMap, ongoingResearchId } = get();
    const existingMessage = messageMap.get(messageId);
    
    if (existingMessage) {
      const updatedMessage = { ...existingMessage, ...updates };
      
      // Auto-close research session when reporter finishes
      if (
        ongoingResearchId &&
        updatedMessage.agent === "reporter" &&
        !updatedMessage.isStreaming
      ) {
        set({ ongoingResearchId: null });
      }
      
      const newMessageMap = new Map(messageMap);
      newMessageMap.set(messageId, updatedMessage);
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
  
  // Podcast generation workflow
  listenToPodcast: async (researchId: string) => {
    const { researchPlanIds, researchReportIds, getMessage, addMessageWithId, updateMessage, currentThreadId } = get();
    
    const planMessageId = researchPlanIds.get(researchId);
    const reportMessageId = researchReportIds.get(researchId);
    
    if (planMessageId && reportMessageId) {
      const planMessage = getMessage(planMessageId);
      const reportMessage = getMessage(reportMessageId);
      
      if (planMessage && reportMessage?.content) {
        let title = "Research Podcast";
        try {
          const planData = JSON.parse(planMessage.content);
          title = planData.title || title;
        } catch {
          // Use default title if parsing fails
        }
        
        // 1. Create user request message
        addMessageWithId({
          id: nanoid(),
          role: "user",
          content: "Please generate a podcast for the above research.",
          contentChunks: ["Please generate a podcast for the above research."],
          threadId: currentThreadId,
          timestamp: new Date(),
        });
        
        // 2. Create streaming podcast message
        const podcastMessageId = nanoid();
        const podcastObject = { title, researchId };
        
        addMessageWithId({
          id: podcastMessageId,
          role: "assistant",
          agent: "podcast",
          content: JSON.stringify(podcastObject),
          contentChunks: [],
          isStreaming: true,
          threadId: currentThreadId,
          timestamp: new Date(),
        });
        
        // 3. Mock podcast generation (replace with real API later)
        try {
          // Simulate generation time
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Create mock audio URL - will be replaced with real generation
          const mockAudioUrl = `data:audio/mp3;base64,mock-audio-data-${researchId}`;
          
          updateMessage(podcastMessageId, {
            content: JSON.stringify({ 
              ...podcastObject, 
              audioUrl: mockAudioUrl 
            }),
            isStreaming: false,
          });
        } catch (error) {
          updateMessage(podcastMessageId, {
            content: JSON.stringify({ 
              ...podcastObject, 
              error: error instanceof Error ? error.message : "Unknown error"
            }),
            isStreaming: false,
          });
        }
      }
    }
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
    const { ongoingResearchId, researchIds, messageIds, getMessage, researchPlanIds, researchActivityIds } = get();
    
    console.log('🔬 DEBUG autoStartResearchOnFirstActivity:', {
      messageId: message.id,
      agent: message.agent,
      ongoingResearchId,
      currentResearchIds: researchIds,
      messageContent: message.content?.slice(0, 100)
    });
    
    // Only start research if we don't have an ongoing session
    if (!ongoingResearchId && (message.agent === 'researcher' || message.agent === 'coder' || message.agent === 'reporter')) {
      
      // Find the most recent planner message by searching backwards
      const reversedMessageIds = [...messageIds].reverse();
      let plannerMessage;
      
      for (const messageId of reversedMessageIds) {
        const msg = getMessage(messageId);
        if (msg?.agent === 'planner') {
          plannerMessage = msg;
          console.log('🔬 DEBUG found planner message:', plannerMessage.id);
          break;
        }
      }
      
      if (plannerMessage) {
        // Use the researcher message ID as the research session ID (matching original)
        const researchId = message.id;
        
        const newState = {
          researchIds: [...researchIds, researchId],
          researchPlanIds: new Map(researchPlanIds).set(researchId, plannerMessage.id),
          researchActivityIds: new Map(researchActivityIds).set(researchId, [plannerMessage.id, message.id]),
          ongoingResearchId: researchId,
          openResearchId: researchId,
          researchPanelState: {
            isOpen: true,
            openResearchId: researchId,
            activeTab: 'activities' as const
          }
        };
        
        set(newState);
        
        console.log('🔬 Auto-started research session:', researchId, 'triggered by:', message.agent, 'with state:', {
          researchIds: newState.researchIds,
          planId: plannerMessage.id,
          activities: newState.researchActivityIds.get(researchId)
        });
        return researchId;
      } else {
        console.log('🔬 DEBUG: No planner message found for research activity');
      }
    } else if (ongoingResearchId) {
      console.log('🔬 DEBUG: Research session already ongoing:', ongoingResearchId);
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