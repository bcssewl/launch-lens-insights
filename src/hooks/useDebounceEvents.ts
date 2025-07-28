/**
 * @file useDebounceEvents.ts
 * @description Debounced event handling for rapid streaming updates
 */

import { useCallback, useRef, useMemo } from 'react';
import { StreamEvent } from '@/utils/mergeMessage';

interface DebouncedEventHandler {
  processEvent: (event: StreamEvent) => void;
  flush: () => void;
  cancel: () => void;
}

interface EventBatch {
  events: StreamEvent[];
  timestamp: number;
}

interface DebounceConfig {
  baseDelay: number;
  maxDelay: number;
  throttleThreshold: number;
  maxBatchSize: number;
}

export const useDebounceEvents = (
  onProcessBatch: (events: StreamEvent[]) => void,
  config: DebounceConfig = {
    baseDelay: 50,
    maxDelay: 1000,
    throttleThreshold: 100,
    maxBatchSize: 50
  }
): DebouncedEventHandler => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const batchRef = useRef<EventBatch>({ events: [], timestamp: Date.now() });
  const eventCountRef = useRef<number>(0);
  const lastFlushRef = useRef<number>(Date.now());

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (batchRef.current.events.length > 0) {
      // Filter out redundant events and prioritize critical ones
      const filteredEvents = filterAndPrioritizeEvents(batchRef.current.events);
      onProcessBatch(filteredEvents);
      batchRef.current = { events: [], timestamp: Date.now() };
      lastFlushRef.current = Date.now();
    }
  }, [onProcessBatch]);

  const filterAndPrioritizeEvents = useCallback((events: StreamEvent[]) => {
    // Separate critical events from content chunks
    const criticalEvents: StreamEvent[] = [];
    const contentEvents: StreamEvent[] = [];
    
    events.forEach(event => {
      const isCritical = 'event' in event && (
        event.event === 'error' ||
        event.event === 'done' ||
        event.event === 'interrupt' ||
        event.event === 'tool_call' ||
        event.event === 'tool_calls' ||
        event.event === 'tool_call_result'
      );
      
      if (isCritical) {
        criticalEvents.push(event);
      } else {
        contentEvents.push(event);
      }
    });
    
    // Always include critical events, sample content events if too many
    let sampledContent = contentEvents;
    if (contentEvents.length > config.maxBatchSize) {
      // Keep every nth event to reduce load while maintaining content flow
      const sampleRate = Math.ceil(contentEvents.length / config.maxBatchSize);
      sampledContent = contentEvents.filter((_, index) => index % sampleRate === 0);
    }
    
    return [...criticalEvents, ...sampledContent];
  }, [config.maxBatchSize]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    batchRef.current = { events: [], timestamp: Date.now() };
    eventCountRef.current = 0;
  }, []);

  const processEvent = useCallback((event: StreamEvent) => {
    eventCountRef.current++;
    
    // Implement circuit breaker for overwhelming streams
    if (eventCountRef.current > config.throttleThreshold) {
      const timeSinceLastFlush = Date.now() - lastFlushRef.current;
      if (timeSinceLastFlush < 100) {
        // Skip processing if we're being overwhelmed
        console.warn('🔥 Event stream overwhelming, applying circuit breaker');
        return;
      }
    }

    // Add event to batch
    batchRef.current.events.push(event);
    batchRef.current.timestamp = Date.now();

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Calculate adaptive delay based on event velocity
    const eventVelocity = batchRef.current.events.length;
    const adaptiveDelay = Math.min(
      config.baseDelay + (eventVelocity * 10),
      config.maxDelay
    );

    // Force immediate processing for critical events
    const isCriticalEvent = 'event' in event && (
      event.event === 'error' ||
      event.event === 'done' ||
      event.event === 'interrupt' ||
      event.event === 'tool_call_result'
    );

    if (isCriticalEvent || batchRef.current.events.length >= config.maxBatchSize) {
      flush();
    } else {
      // Set new timeout with adaptive delay
      timeoutRef.current = setTimeout(flush, adaptiveDelay);
    }
  }, [flush, config]);

  return useMemo(() => ({
    processEvent,
    flush,
    cancel
  }), [processEvent, flush, cancel]);
};