import React from 'react';
import { EnhancedMessageInput } from './EnhancedMessageInput';

interface InputBoxProps {
  onSendMessage: (message: string) => void;
}

export const InputBox = ({ onSendMessage }: InputBoxProps) => {
  return <EnhancedMessageInput onSendMessage={onSendMessage} />;
};