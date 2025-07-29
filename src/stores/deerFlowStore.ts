/**
 * @file deerFlowStore.ts
 * @description Compatibility layer combining message and settings stores
 */

import { useDeerFlowMessageStore } from './deerFlowMessageStore';
import { useDeerFlowSettingsStore } from './deerFlowSettingsStore';

// Re-export types for backward compatibility
export type {
  DeerMessage,
  ToolCall,
  FeedbackOption,
  ResearchActivity,
  ResearchSession
} from './deerFlowMessageStore';

export type {
  DeerSettings,
  MCPServer
} from './deerFlowSettingsStore';

/**
 * Combined hook that provides access to both message and settings stores
 * This maintains backward compatibility while using the new split architecture
 */
export const useDeerFlowStore = () => {
  const messageStore = useDeerFlowMessageStore();
  const settingsStore = useDeerFlowSettingsStore();

  return {
    // Message store state
    currentThreadId: messageStore.currentThreadId,
    messages: messageStore.messages,
    isResponding: messageStore.isResponding,
    currentPrompt: messageStore.currentPrompt,
    researchActivities: messageStore.researchActivities,
    researchSessions: messageStore.researchSessions,
    reportContent: messageStore.reportContent,
    
    // Computed properties from new panel state structure
    isResearchPanelOpen: messageStore.researchPanelState.isOpen,
    activeResearchTab: messageStore.researchPanelState.activeTab,
    openResearchId: messageStore.researchPanelState.openResearchId,

    // Settings store state
    settings: settingsStore.settings,
    isSettingsOpen: settingsStore.isSettingsOpen,

    // Message store actions
    createNewThread: messageStore.createNewThread,
    setCurrentThread: messageStore.setCurrentThread,
    addMessage: messageStore.addMessage,
    addMessageWithId: messageStore.addMessageWithId,
    existsMessage: messageStore.existsMessage,
    updateMessage: messageStore.updateMessage,
    clearMessages: messageStore.clearMessages,
    getMessagesByThread: messageStore.getMessagesByThread,
    addResearchActivity: messageStore.addResearchActivity,
    updateResearchActivity: messageStore.updateResearchActivity,
    setReportContent: messageStore.setReportContent,
    createResearchSession: messageStore.createResearchSession,
    getResearchSession: messageStore.getResearchSession,
    setCurrentPrompt: messageStore.setCurrentPrompt,
    setIsResponding: messageStore.setIsResponding,
    
    // Panel management actions using new unified method
    setResearchPanelOpen: (open: boolean, messageId?: string) => 
      messageStore.setResearchPanel(open, messageId),
    setActiveResearchTab: (tab: 'activities' | 'report') => 
      messageStore.setResearchPanel(messageStore.researchPanelState.isOpen, undefined, tab),

    // Settings store actions
    updateSettings: settingsStore.updateSettings,
    resetSettings: settingsStore.resetSettings,
    addMCPServer: settingsStore.addMCPServer,
    updateMCPServer: settingsStore.updateMCPServer,
    removeMCPServer: settingsStore.removeMCPServer,
    toggleMCPServer: settingsStore.toggleMCPServer,
    setSettingsOpen: settingsStore.setSettingsOpen,
  };
};