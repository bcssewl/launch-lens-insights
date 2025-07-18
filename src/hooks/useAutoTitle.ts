import { useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAutoTitle = () => {
  const processedSessionsRef = useRef<Set<string>>(new Set());

  const generateAndSetTitle = async (
    sessionId: string,
    userMessage: string,
    aiResponse: string,
    updateSessionTitle: (sessionId: string, title: string) => Promise<void>
  ) => {
    // Skip if we've already processed this session
    if (processedSessionsRef.current.has(sessionId)) {
      return;
    }

    // Mark as processed to prevent multiple calls
    processedSessionsRef.current.add(sessionId);

    try {
      console.log('🏷️ Generating title for session:', sessionId);

      const { data, error } = await supabase.functions.invoke('generate-chat-title', {
        body: {
          userMessage: userMessage.trim(),
          aiResponse: aiResponse.trim()
        }
      });

      if (error) {
        console.error('Error generating title:', error);
        return;
      }

      if (data?.title) {
        console.log('✅ Generated title:', data.title);
        await updateSessionTitle(sessionId, data.title);
      }
    } catch (error) {
      console.error('Failed to generate chat title:', error);
    }
  };

  const shouldGenerateTitle = (messageCount: number, sessionTitle: string): boolean => {
    // Generate title only after first exchange (2 messages) and if title is still default
    return messageCount === 2 && sessionTitle === 'New Chat';
  };

  const resetProcessedSessions = () => {
    processedSessionsRef.current.clear();
  };

  return {
    generateAndSetTitle,
    shouldGenerateTitle,
    resetProcessedSessions
  };
};