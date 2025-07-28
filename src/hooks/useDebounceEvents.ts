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

export const useDebounceEvents = (
  onProcessBatch: (events: StreamEvent[]) => void,
  delay: number = 50
): DebouncedEventHandler => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const batchRef = useRef<EventBatch>({ events: [], timestamp: Date.now() });

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (batchRef.current.events.length > 0) {
      onProcessBatch(batchRef.current.events);
      batchRef.current = { events: [], timestamp: Date.now() };
    }
  }, [onProcessBatch]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    batchRef.current = { events: [], timestamp: Date.now() };
  }, []);

  const processEvent = useCallback((event: StreamEvent) => {
    // Add event to batch
    batchRef.current.events.push(event);
    batchRef.current.timestamp = Date.now();

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(flush, delay);

    // Force immediate processing for critical events
    const isCriticalEvent = 'event' in event && (
      event.event === 'error' ||
      event.event === 'done' ||
      event.event === 'interrupt'
    );

    if (isCriticalEvent) {
      flush();
    }
  }, [flush, delay]);

  return useMemo(() => ({
    processEvent,
    flush,
    cancel
  }), [processEvent, flush, cancel]);
};