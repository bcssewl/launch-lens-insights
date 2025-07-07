
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowRight, Send, Mic, Plus, Paperclip } from 'lucide-react';
import AttachmentOptionsDropdown from './AttachmentOptionsDropdown';

interface ChatInputControlsProps {
  isCompact: boolean;
  isTyping: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  inputValue: string;
  onVoiceRecording: () => void;
  onSendMessage: () => void;
  onDatabaseSelect: () => void;
  onLocalFileSelect: () => void;
}

const ChatInputControls: React.FC<ChatInputControlsProps> = ({
  isCompact,
  isTyping,
  isRecording,
  isProcessing,
  inputValue,
  onVoiceRecording,
  onSendMessage,
  onDatabaseSelect,
  onLocalFileSelect,
}) => {
  const iconSize = isCompact ? 'h-3 w-3' : 'h-4 w-4';
  const buttonSize = isCompact ? 'h-8 w-8' : 'h-10 w-10';

  return (
    <>
      <AttachmentOptionsDropdown
        onDatabaseSelect={onDatabaseSelect}
        onLocalFileSelect={onLocalFileSelect}
      >
        <Button
          variant="ghost"
          size="icon"
          className={`${buttonSize} rounded-full hover:bg-muted transition-all duration-200`}
          disabled={isTyping || isRecording}
        >
          <Paperclip className={iconSize} />
        </Button>
      </AttachmentOptionsDropdown>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onVoiceRecording}
            className={`${buttonSize} rounded-full hover:bg-muted transition-all duration-200 ${
              isRecording ? 'bg-red-100 hover:bg-red-200 text-red-600' : ''
            } ${isProcessing ? 'opacity-50' : ''}`}
            disabled={isTyping || isProcessing}
          >
            <Mic className={`${iconSize} ${isRecording ? 'animate-pulse' : ''}`} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isRecording ? 'Stop recording' : 'Dictate'}</p>
        </TooltipContent>
      </Tooltip>
      
      {!isCompact && (
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full hover:bg-muted"
          disabled={isTyping || isRecording}
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}
      
      {isCompact ? (
        <Button
          onClick={onSendMessage}
          size="icon"
          disabled={isTyping || inputValue.trim() === '' || isRecording}
          className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50"
        >
          {isTyping ? (
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-white rounded-full animate-bounce" />
              <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
        </Button>
      ) : (
        inputValue.trim() && !isRecording && (
          <Button
            onClick={onSendMessage}
            size="icon"
            className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90"
            disabled={isTyping}
          >
            <Send className="h-4 w-4" />
          </Button>
        )
      )}
    </>
  );
};

export default ChatInputControls;
