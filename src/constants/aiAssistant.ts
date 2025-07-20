
import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: Date;
  clientMessageId?: string; // Frontend-generated UUID for request-response correlation
  metadata?: {
    isCompleted?: boolean;
    messageType?: 'progress_update' | 'completed_report' | 'standard' | 'stratix_conversation';
  };
}

export const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const initialMessages: Message[] = [];

export const suggestedPromptsData = [
  { id: "sp1", text: "What's a good name for my startup?" },
  { id: "sp2", text: "How do I validate B2B demand?" },
  { id: "sp3", text: "What would investors ask about my idea?" },
  { id: "sp4", text: "Help me design a landing page test" },
  { id: "sp5", text: "What are similar successful startups?" },
  { id: "sp6", text: "How can I reduce customer acquisition cost?" },
];
