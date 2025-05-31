
import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: Date;
}

export const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const initialMessages: Message[] = [
  {
    id: uuidv4(),
    text: "Hi! I'm your AI startup advisor. I can help you refine ideas, suggest validation methods, or answer questions about your analyses. What would you like to discuss?",
    sender: 'ai',
    timestamp: new Date(Date.now() - 120000),
  },
];
