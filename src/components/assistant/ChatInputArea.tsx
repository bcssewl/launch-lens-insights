
import React from 'react';
import SoundWaveVisualization from './SoundWaveVisualization';
import AttachmentsList from './AttachmentsList';
import { AttachedFile } from '@/hooks/useFileAttachments';

interface ChatInputAreaProps {
  isRecording: boolean;
  audioLevel: number;
  attachedFiles: AttachedFile[];
  onRemoveFile: (fileId: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  children: React.ReactNode;
}

const ChatInputArea: React.FC<ChatInputAreaProps> = ({
  isRecording,
  audioLevel,
  attachedFiles,
  onRemoveFile,
  onKeyDown,
  children
}) => {
  return (
    <div className="w-full max-w-4xl mb-12">
      {/* Input Field Container */}
      <div className="relative bg-background border border-border rounded-xl px-6 py-4 shadow-sm hover:shadow-md transition-all duration-200 mb-3">
        {/* Sound wave visualization overlay */}
        <SoundWaveVisualization audioLevel={audioLevel} isRecording={isRecording} />
        
        <input
          type="text"
          placeholder={isRecording ? "Listening..." : "Ask anything or @ mention a Space"}
          className={`w-full h-12 text-base bg-transparent border-none outline-none focus:outline-none placeholder:text-muted-foreground ${
            isRecording ? 'pl-12' : ''
          }`}
          disabled={isRecording}
          onKeyDown={onKeyDown}
        />
      </div>

      {/* Attachments List */}
      <AttachmentsList
        attachedFiles={attachedFiles}
        onRemoveFile={onRemoveFile}
      />

      {/* Icon Buttons Row */}
      {children}
    </div>
  );
};

export default ChatInputArea;
