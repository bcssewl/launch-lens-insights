import React from 'react';
import { EnhancedMessageInput } from './EnhancedMessageInput';
import { useEnhancedDeerStreaming } from '@/hooks/useEnhancedDeerStreaming';

interface InputBoxProps {
  onSendMessage?: (message: string) => void;
}

export const InputBox = ({ onSendMessage }: InputBoxProps) => {
  const { startDeerFlowStreaming } = useEnhancedDeerStreaming();
  
  const handleSendMessage = (message: string) => {
    if (onSendMessage) {
      onSendMessage(message);
    } else {
      // Use the enhanced DeerFlow streaming
      startDeerFlowStreaming(message);
    }
  };

  return <EnhancedMessageInput onSendMessage={handleSendMessage} />;
};