/**
 * @file useMemoryOptimization.ts
 * @description Memory management for long DeerFlow sessions
 */

import { useEffect, useCallback, useRef } from 'react';
import { DeerMessage } from '@/stores/deerFlowMessageStore';

interface MemoryOptimizationConfig {
  maxMessages: number;
  maxActivities: number;
  cleanupInterval: number; // in milliseconds
  preserveLastN: number; // Always preserve the last N messages
}

const DEFAULT_CONFIG: MemoryOptimizationConfig = {
  maxMessages: 100,
  maxActivities: 50,
  cleanupInterval: 30000, // 30 seconds
  preserveLastN: 20
};

interface MemoryStats {
  messagesCount: number;
  activitiesCount: number;
  lastCleanup: Date | null;
  totalCleanups: number;
}

export const useMemoryOptimization = (
  messages: DeerMessage[],
  onMessagesCleanup: (preservedMessages: DeerMessage[]) => void,
  config: Partial<MemoryOptimizationConfig> = {}
) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const statsRef = useRef<MemoryStats>({
    messagesCount: 0,
    activitiesCount: 0,
    lastCleanup: null,
    totalCleanups: 0
  });

  const performCleanup = useCallback(() => {
    const now = new Date();
    
    // Only cleanup if we exceed the maximum number of messages
    if (messages.length > finalConfig.maxMessages) {
      // Calculate how many messages to remove
      const excessCount = messages.length - finalConfig.maxMessages;
      const removeCount = Math.max(excessCount, messages.length - finalConfig.preserveLastN);
      
      // Always preserve the last N messages
      const preservedMessages = messages.slice(-finalConfig.preserveLastN);
      
      // Also preserve any messages that are currently streaming
      const streamingMessages = messages.filter(msg => msg.isStreaming);
      
      // Combine preserved and streaming messages (remove duplicates)
      const allPreservedMessages = [
        ...preservedMessages,
        ...streamingMessages.filter(msg => 
          !preservedMessages.some(preserved => preserved.id === msg.id)
        )
      ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      onMessagesCleanup(allPreservedMessages);

      // Update stats
      statsRef.current = {
        messagesCount: allPreservedMessages.length,
        activitiesCount: statsRef.current.activitiesCount,
        lastCleanup: now,
        totalCleanups: statsRef.current.totalCleanups + 1
      };

      console.log(`Memory cleanup: Removed ${removeCount} messages, preserved ${allPreservedMessages.length}`);
    }
  }, [messages, onMessagesCleanup, finalConfig]);

  // Automatic cleanup interval
  useEffect(() => {
    const interval = setInterval(() => {
      performCleanup();
    }, finalConfig.cleanupInterval);

    return () => clearInterval(interval);
  }, [performCleanup, finalConfig.cleanupInterval]);

  // Update stats when messages change
  useEffect(() => {
    statsRef.current.messagesCount = messages.length;
  }, [messages.length]);

  // Force cleanup when memory pressure is detected
  const forceCleanup = useCallback(() => {
    performCleanup();
  }, [performCleanup]);

  // Get current memory usage stats
  const getStats = useCallback((): MemoryStats => {
    return { ...statsRef.current };
  }, []);

  // Memory pressure detection
  useEffect(() => {
    // Check for memory pressure indicators
    const checkMemoryPressure = () => {
      const messageCount = messages.length;
      const estimatedMemoryUsage = messageCount * 0.5; // Rough estimate in KB per message
      
      // Force cleanup if we detect high memory usage
      if (estimatedMemoryUsage > 1000 || messageCount > finalConfig.maxMessages * 1.5) {
        console.warn('High memory usage detected, forcing cleanup');
        forceCleanup();
      }
    };

    // Run memory pressure check every minute
    const pressureCheckInterval = setInterval(checkMemoryPressure, 60000);
    return () => clearInterval(pressureCheckInterval);
  }, [messages.length, finalConfig.maxMessages, forceCleanup]);

  return {
    forceCleanup,
    getStats,
    performCleanup
  };
};