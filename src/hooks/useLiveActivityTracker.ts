/**
 * @file useLiveActivityTracker.ts
 * @description Hook for tracking and managing real-time streaming activities
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { StreamEvent } from '@/utils/mergeMessage';

interface ActivityItem {
  id: string;
  type: 'search' | 'visit' | 'tool' | 'thinking' | 'reasoning';
  content: string;
  timestamp: Date;
  status: 'active' | 'completed' | 'error';
}

interface ErrorInfo {
  id: string;
  type: 'network' | 'server' | 'timeout' | 'validation' | 'unknown';
  message: string;
  timestamp: Date;
  isRecoverable: boolean;
  retryCount?: number;
  maxRetries?: number;
  context?: {
    operation?: string;
    toolCall?: string;
    lastSuccessfulStep?: string;
  };
}

export const useLiveActivityTracker = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [currentActivity, setCurrentActivity] = useState<string>('');
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  
  const activityCounterRef = useRef(0);
  const errorCounterRef = useRef(0);

  const addActivity = useCallback((
    type: ActivityItem['type'], 
    content: string, 
    status: ActivityItem['status'] = 'active'
  ) => {
    const activity: ActivityItem = {
      id: `activity_${++activityCounterRef.current}`,
      type,
      content,
      status,
      timestamp: new Date()
    };

    setActivities(prev => [...prev, activity]);
    
    if (status === 'active') {
      setCurrentActivity(content);
    }

    return activity.id;
  }, []);

  const updateActivity = useCallback((
    id: string, 
    updates: Partial<Pick<ActivityItem, 'status' | 'content'>>
  ) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === id 
          ? { ...activity, ...updates }
          : activity
      )
    );

    if (updates.status === 'completed' || updates.status === 'error') {
      setCurrentActivity('');
    }
  }, []);

  const addError = useCallback((
    type: ErrorInfo['type'],
    message: string,
    isRecoverable: boolean = true,
    context?: ErrorInfo['context']
  ) => {
    const error: ErrorInfo = {
      id: `error_${++errorCounterRef.current}`,
      type,
      message,
      timestamp: new Date(),
      isRecoverable,
      retryCount: 0,
      maxRetries: 3,
      context
    };

    setErrors(prev => [...prev, error]);
    return error.id;
  }, []);

  const updateError = useCallback((
    id: string,
    updates: Partial<ErrorInfo>
  ) => {
    setErrors(prev =>
      prev.map(error =>
        error.id === id
          ? { ...error, ...updates }
          : error
      )
    );
  }, []);

  const dismissError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const clearActivities = useCallback(() => {
    setActivities([]);
    setCurrentActivity('');
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Process streaming events into activities
  const processStreamingEvent = useCallback((event: StreamEvent) => {
    if ('event' in event && event.event) {
      switch (event.event) {
        case 'search': {
          const searchData = event.data as { query: string; results?: any[] };
          addActivity('search', `Searching: "${searchData.query}"`, 'active');
          break;
        }
        
        case 'visit': {
          const visitData = event.data as { url: string; title?: string };
          addActivity('visit', `Visiting: ${visitData.title || visitData.url}`, 'active');
          break;
        }
        
        case 'tool_call': {
          const toolData = event.data as { name: string; args: any };
          addActivity('tool', `Executing: ${toolData.name}`, 'active');
          break;
        }
        
        case 'tool_call_result': {
          const resultData = event.data as { id: string; result?: any; error?: string };
          // Find the most recent tool activity and update it
          setActivities(prev => {
            const toolActivity = [...prev].reverse().find(a => a.type === 'tool' && a.status === 'active');
            if (toolActivity) {
              return prev.map(a => 
                a.id === toolActivity.id 
                  ? { ...a, status: resultData.error ? 'error' : 'completed' as const }
                  : a
              );
            }
            return prev;
          });
          
          if (resultData.error) {
            addError('validation', `Tool execution failed: ${resultData.error}`, true, {
              operation: 'tool_execution'
            });
          }
          break;
        }
        
        case 'thinking': {
          const thinkingData = event.data as { phase: string; content: string };
          addActivity('thinking', `${thinkingData.phase}: ${thinkingData.content.substring(0, 50)}...`, 'active');
          break;
        }
        
        case 'reasoning': {
          const reasoningData = event.data as { step: string; content: string };
          addActivity('reasoning', `${reasoningData.step}: ${reasoningData.content.substring(0, 50)}...`, 'active');
          break;
        }
        
        case 'done': {
          // Mark all active activities as completed
          setActivities(prev => 
            prev.map(activity => 
              activity.status === 'active' 
                ? { ...activity, status: 'completed' as const }
                : activity
            )
          );
          setCurrentActivity('');
          setIsStreaming(false);
          break;
        }
        
        case 'error': {
          const errorData = event.data as { error: string };
          addError('unknown', errorData.error, true);
          setIsStreaming(false);
          break;
        }
        
        case 'interrupt': {
          setCurrentActivity('');
          setIsStreaming(false);
          break;
        }
      }
    }
  }, [addActivity, addError]);

  const startStreaming = useCallback(() => {
    setIsStreaming(true);
    clearActivities();
    clearErrors();
  }, [clearActivities, clearErrors]);

  const stopStreaming = useCallback(() => {
    setIsStreaming(false);
    setCurrentActivity('');
    // Mark all active activities as completed
    setActivities(prev => 
      prev.map(activity => 
        activity.status === 'active' 
          ? { ...activity, status: 'completed' as const }
          : activity
      )
    );
  }, []);

  // Auto-cleanup old activities (keep last 50)
  useEffect(() => {
    if (activities.length > 50) {
      setActivities(prev => prev.slice(-50));
    }
  }, [activities.length]);

  // Auto-cleanup old errors (keep last 10)
  useEffect(() => {
    if (errors.length > 10) {
      setErrors(prev => prev.slice(-10));
    }
  }, [errors.length]);

  return {
    // State
    activities,
    currentActivity,
    errors,
    isStreaming,
    
    // Activity methods
    addActivity,
    updateActivity,
    clearActivities,
    
    // Error methods
    addError,
    updateError,
    dismissError,
    clearErrors,
    
    // Streaming methods
    processStreamingEvent,
    startStreaming,
    stopStreaming
  };
};
