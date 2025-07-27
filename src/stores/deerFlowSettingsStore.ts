/**
 * @file deerFlowSettingsStore.ts  
 * @description Zustand store for DeerFlow settings and preferences
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MCPServer {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  metadata?: Record<string, any>;
}

export interface DeerSettings {
  // Core settings
  deepThinking: boolean;
  backgroundInvestigation: boolean;
  reportStyle: 'academic' | 'popular_science' | 'news' | 'social_media';
  
  // Advanced settings from original
  autoAcceptedPlan: boolean;
  maxPlanIterations: number;
  maxStepNum: number;
  maxSearchResults: number;
  
  // MCP server support for multi-agent capability
  mcpServers: MCPServer[];
  
  // UI preferences
  language: 'en' | 'zh';
  theme: 'light' | 'dark' | 'system';
}

interface DeerFlowSettingsState {
  settings: DeerSettings;
  isSettingsOpen: boolean;
}

interface DeerFlowSettingsActions {
  // Settings actions
  updateSettings: (settings: Partial<DeerSettings>) => void;
  resetSettings: () => void;
  
  // MCP server management
  addMCPServer: (server: Omit<MCPServer, 'id'>) => void;
  updateMCPServer: (serverId: string, updates: Partial<MCPServer>) => void;
  removeMCPServer: (serverId: string) => void;
  toggleMCPServer: (serverId: string) => void;
  
  // UI actions
  setSettingsOpen: (open: boolean) => void;
}

type DeerFlowSettingsStore = DeerFlowSettingsState & DeerFlowSettingsActions;

const defaultSettings: DeerSettings = {
  deepThinking: false,
  backgroundInvestigation: false,
  reportStyle: 'academic',
  autoAcceptedPlan: false,
  maxPlanIterations: 3,
  maxStepNum: 10,
  maxSearchResults: 5,
  mcpServers: [],
  language: 'en',
  theme: 'system',
};

export const useDeerFlowSettingsStore = create<DeerFlowSettingsStore>()(
  persist(
    (set, get) => ({
      // Initial state
      settings: defaultSettings,
      isSettingsOpen: false,

      // Settings actions
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      resetSettings: () =>
        set({
          settings: defaultSettings,
        }),

      // MCP server management
      addMCPServer: (server) => {
        const newServer: MCPServer = {
          ...server,
          id: crypto.randomUUID(),
        };
        
        set((state) => ({
          settings: {
            ...state.settings,
            mcpServers: [...state.settings.mcpServers, newServer],
          },
        }));
      },

      updateMCPServer: (serverId, updates) =>
        set((state) => ({
          settings: {
            ...state.settings,
            mcpServers: state.settings.mcpServers.map((server) =>
              server.id === serverId ? { ...server, ...updates } : server
            ),
          },
        })),

      removeMCPServer: (serverId) =>
        set((state) => ({
          settings: {
            ...state.settings,
            mcpServers: state.settings.mcpServers.filter(
              (server) => server.id !== serverId
            ),
          },
        })),

      toggleMCPServer: (serverId) =>
        set((state) => ({
          settings: {
            ...state.settings,
            mcpServers: state.settings.mcpServers.map((server) =>
              server.id === serverId
                ? { ...server, enabled: !server.enabled }
                : server
            ),
          },
        })),

      // UI actions
      setSettingsOpen: (open) => set({ isSettingsOpen: open }),
    }),
    {
      name: 'deer-flow-settings',
      partialize: (state) => ({
        settings: state.settings,
      }),
    }
  )
);