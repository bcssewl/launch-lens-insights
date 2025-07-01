
import React, { useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Search } from 'lucide-react';
import SoundWaveVisualization from './SoundWaveVisualization';
import AttachmentsList from './AttachmentsList';
import { AttachedFile } from '@/hooks/useFileAttachments';

interface ChatInputCoreProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSendMessage: () => void;
  isTyping: boolean;
  isRecording: boolean;
  audioLevel: number;
  isCompact: boolean;
  attachedFiles: AttachedFile[];
  onRemoveFile: (fileId: string) => void;
  children: React.ReactNode;
}

const ChatInputCore: React.FC<ChatInputCoreProps> = ({
  inputValue,
  setInputValue,
  onKeyDown,
  onSendMessage,
  isTyping,
  isRecording,
  audioLevel,
  isCompact,
  attachedFiles,
  onRemoveFile,
  children,
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isCompact && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCompact]);

  // Reset textarea height after sending
  useEffect(() => {
    if (inputValue === '' && inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  }, [inputValue]);

  const placeholder = isRecording 
    ? "Listening..." 
    : isCompact 
      ? "Ask a follow-up question..." 
      : "Ask me anything about your startup ideas...";

  const inputClassName = isCompact
    ? `w-full min-h-[48px] max-h-[216px] px-4 pr-32 rounded-2xl border border-border bg-background/80 backdrop-blur-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground resize-none overflow-y-auto py-3 ${
        isRecording ? 'bg-primary/5 border-primary/50 pl-12' : ''
      }`
    : `w-full min-h-[56px] max-h-[216px] pl-12 pr-32 text-lg rounded-2xl border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground resize-none overflow-y-auto py-4 ${
        isRecording ? 'bg-primary/5 border-primary/50' : ''
      }`;

  return (
    <>
      <AttachmentsList 
        attachedFiles={attachedFiles} 
        onRemoveFile={onRemoveFile} 
      />
      
      <div className="relative">
        {!isCompact && (
          <div className="absolute top-4 left-4 flex items-start pointer-events-none z-10">
            <Search className="h-5 w-5 text-muted-foreground mt-0.5" />
          </div>
        )}
        
        <SoundWaveVisualization audioLevel={audioLevel} isRecording={isRecording} />
        
        <Textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          autoExpand={true}
          className={inputClassName}
          style={{ lineHeight: '1.5rem' }}
          disabled={isTyping || isRecording}
        />
        
        <div className={`absolute ${isCompact ? 'bottom-2 right-2' : 'top-2 right-2'} flex items-${isCompact ? 'end' : 'start'} space-x-1`}>
          {children}
        </div>
      </div>
    </>
  );
};

export default ChatInputCore;
