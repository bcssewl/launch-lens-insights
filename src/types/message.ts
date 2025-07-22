
export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isLoading?: boolean;
  isError?: boolean;
  sources?: any[];
}

export interface LegacyMessage {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: Date;
  clientMessageId?: string;
  metadata?: {
    isCompleted?: boolean;
    messageType?: 'progress_update' | 'completed_report' | 'standard' | 'stratix_conversation';
  };
}

// Adapter function to convert between message types
export const adaptMessageToLegacy = (message: Message): LegacyMessage => ({
  id: message.id,
  text: message.content,
  sender: message.sender === 'user' ? 'user' : 'ai',
  timestamp: new Date(message.timestamp),
  metadata: {
    isCompleted: !message.isLoading,
    messageType: 'standard'
  }
});

export const adaptLegacyToMessage = (legacyMessage: LegacyMessage): Message => ({
  id: legacyMessage.id,
  sender: legacyMessage.sender === 'user' ? 'user' : 'assistant',
  content: legacyMessage.text,
  timestamp: legacyMessage.timestamp.toISOString(),
  sources: []
});
