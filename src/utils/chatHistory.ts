
import type { Message } from '@/constants/aiAssistant';

const STORAGE_KEY_PREFIX = 'chat_history_';

export const getChatHistory = async (sessionId: string): Promise<Message[] | null> => {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${sessionId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert timestamp strings back to Date objects
      return parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }
    return null;
  } catch (error) {
    console.error('Error loading chat history:', error);
    return null;
  }
};

export const saveChatHistory = (sessionId: string, messages: Message[]): void => {
  try {
    // Convert Date objects to strings for storage
    const serializable = messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp.toISOString()
    }));
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${sessionId}`, JSON.stringify(serializable));
  } catch (error) {
    console.error('Error saving chat history:', error);
  }
};

export const clearChatHistory = (sessionId: string): void => {
  try {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${sessionId}`);
  } catch (error) {
    console.error('Error clearing chat history:', error);
  }
};
