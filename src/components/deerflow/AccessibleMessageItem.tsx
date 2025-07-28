/**
 * @file AccessibleMessageItem.tsx
 * @description Accessibility-enhanced message item with screen reader support
 */

import React from 'react';
import { DeerMessage } from '@/stores/deerFlowMessageStore';
import { MessageItem } from './MessageItem';

interface AccessibleMessageItemProps {
  message: DeerMessage;
  'aria-posinset'?: number;
  'aria-setsize'?: number;
  className?: string;
}

const getMessageTypeDescription = (message: DeerMessage): string => {
  const agent = message.metadata?.agent;
  
  if (message.role === 'user') {
    return 'User message';
  }
  
  if (agent === 'planner') {
    return 'AI Planner response with research plan';
  }
  
  if (agent === 'reporter') {
    return 'AI Reporter response with research findings';
  }
  
  if (message.metadata?.audioUrl) {
    return 'AI generated podcast audio';
  }
  
  return 'AI Assistant response';
};

const getStreamingDescription = (message: DeerMessage): string => {
  if (message.isStreaming) {
    const agent = message.metadata?.agent;
    if (agent === 'planner') return 'Planning in progress';
    if (agent === 'reporter') return 'Generating report';
    return 'Response in progress';
  }
  return '';
};

const getContentSummary = (message: DeerMessage): string => {
  const content = message.content || '';
  const maxLength = 100;
  
  if (content.length <= maxLength) {
    return content;
  }
  
  return content.substring(0, maxLength) + '... (message truncated for accessibility)';
};

const getActivitySummary = (message: DeerMessage): string => {
  const metadata = message.metadata;
  if (!metadata) return '';
  
  const activities = [];
  
  if (metadata.thinkingPhases?.length) {
    activities.push(`${metadata.thinkingPhases.length} thinking phases`);
  }
  
  if (metadata.reasoningSteps?.length) {
    activities.push(`${metadata.reasoningSteps.length} reasoning steps`);
  }
  
  if (metadata.searchActivities?.length) {
    activities.push(`${metadata.searchActivities.length} search queries`);
  }
  
  if (metadata.visitedUrls?.length) {
    activities.push(`${metadata.visitedUrls.length} websites visited`);
  }
  
  if (message.toolCalls?.length) {
    activities.push(`${message.toolCalls.length} tool executions`);
  }
  
  return activities.length > 0 ? `Activities: ${activities.join(', ')}` : '';
};

export const AccessibleMessageItem: React.FC<AccessibleMessageItemProps> = ({
  message,
  'aria-posinset': ariaPosinset,
  'aria-setsize': ariaSetsize,
  className = ''
}) => {
  const messageType = getMessageTypeDescription(message);
  const streamingStatus = getStreamingDescription(message);
  const contentSummary = getContentSummary(message);
  const activitySummary = getActivitySummary(message);
  
  const timestamp = message.timestamp.toLocaleString();
  
  // Combine all accessibility information
  const ariaLabel = [
    messageType,
    streamingStatus,
    `at ${timestamp}`,
    contentSummary,
    activitySummary
  ].filter(Boolean).join('. ');

  const ariaDescribedBy = `message-${message.id}-description`;

  return (
    <article
      className={`focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg ${className}`}
      role="listitem"
      aria-label={ariaLabel}
      aria-posinset={ariaPosinset}
      aria-setsize={ariaSetsize}
      aria-describedby={ariaDescribedBy}
      tabIndex={0}
    >
      {/* Hidden description for screen readers */}
      <div 
        id={ariaDescribedBy}
        className="sr-only"
      >
        {messageType} from {timestamp}. 
        {streamingStatus && `${streamingStatus}. `}
        {activitySummary && `${activitySummary}. `}
        Content: {contentSummary}
      </div>
      
      {/* Live region for streaming updates */}
      {message.isStreaming && (
        <div 
          aria-live="polite" 
          aria-atomic="false"
          className="sr-only"
        >
          {streamingStatus}
        </div>
      )}
      
      {/* Actual message content */}
      <MessageItem message={message} />
      
      {/* Keyboard navigation hints */}
      <div className="sr-only">
        Press Tab to navigate to next message, 
        Shift+Tab to navigate to previous message,
        Enter or Space to interact with message actions
      </div>
    </article>
  );
};