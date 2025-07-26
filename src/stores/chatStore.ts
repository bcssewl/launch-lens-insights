/**
 * @file chatStore.ts
 * @description Zustand store for managing chat application state
 */

import { create } from 'zustand';
import { Message } from '@/types/chat';

interface ChatState {
  messages: Message[];
  responding: boolean;
  currentThreadId: string | null;
}

interface ChatActions {
  appendMessage: (message: Message) => void;
  updateMessage: (messageId: string, updatedFields: Partial<Message>) => void;
  setResponding: (isResponding: boolean) => void;
  setCurrentThreadId: (threadId: string | null) => void;
}

type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>((set) => ({
  // Initial state
  messages: [],
  responding: false,
  currentThreadId: null,

  // Actions
  appendMessage: (message: Message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateMessage: (messageId: string, updatedFields: Partial<Message>) =>
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === messageId
          ? { ...message, ...updatedFields }
          : message
      ),
    })),

  setResponding: (isResponding: boolean) =>
    set({ responding: isResponding }),

  setCurrentThreadId: (threadId: string | null) =>
    set({ currentThreadId: threadId }),
}));