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
  const agent = message.agent;
  
  if (message.role === 'user') {
    return 'User message';
  }
  
  if (agent === 'planner') {
    return 'AI Planner response with research plan';
  }
  
  if (agent === 'researcher') {
    return 'AI Reporter response with research findings';
  }
  
  return 'AI Assistant response';
};

const getStreamingDescription = (message: DeerMessage): string => {
  if (message.isStreaming) {
    const agent = message.agent;
    if (agent === 'planner') return 'Planning in progress';
    if (agent === 'researcher') return 'Generating report';
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
  const activities = [];
  
  if (message.toolCalls?.length) {
    activities.push(`${message.toolCalls.length} tool calls`);
  }
  
  if (message.reasoningContent) {
    activities.push('reasoning content available');
  }
  
  return activities.length > 0 ? activities.join(', ') : '';
};

/**
 * Accessible wrapper around MessageItem with enhanced screen reader support
 */
export const AccessibleMessageItem: React.FC<AccessibleMessageItemProps> = ({
  message,
  'aria-posinset': ariaPosinset,
  'aria-setsize': ariaSetsize,
  className
}) => {
  const messageTypeDescription = getMessageTypeDescription(message);
  const streamingDescription = getStreamingDescription(message);
  const contentSummary = getContentSummary(message);
  const activitySummary = getActivitySummary(message);
  
  const ariaLabel = [
    messageTypeDescription,
    streamingDescription,
    contentSummary,
    activitySummary
  ].filter(Boolean).join('. ');

  return (
    <div
      role="listitem"
      aria-posinset={ariaPosinset}
      aria-setsize={ariaSetsize}
      aria-label={ariaLabel}
      className={className}
    >
      <MessageItem messageId={message.id} />
    </div>
  );
};