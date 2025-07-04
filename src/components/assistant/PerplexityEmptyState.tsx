
import React, { useState } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { useFileAttachments } from '@/hooks/useFileAttachments';
import LogoBranding from './LogoBranding';
import ChatInputArea from './ChatInputArea';
import IconButtonsRow from './IconButtonsRow';
import ChatInputStatus from './ChatInputStatus';
import ChatInputModals from './ChatInputModals';

interface PerplexityEmptyStateProps {
  onSendMessage: (message: string, attachments?: any[]) => void;
}

const PerplexityEmptyState: React.FC<PerplexityEmptyStateProps> = ({ onSendMessage }) => {
  const { isRecording, isProcessing, audioLevel, error, startRecording, stopRecording, clearError } = useVoiceRecording();
  const { attachedFiles, addDatabaseFile, addLocalFile, removeFile, clearFiles } = useFileAttachments();
  
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showLocalUploader, setShowLocalUploader] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handlePromptClick = (prompt: string) => {
    onSendMessage(prompt, attachedFiles);
  };

  const handleVoiceRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      handlePromptClick(e.currentTarget.value);
      e.currentTarget.value = '';
    }
  };

  const handleImageError = () => {
    console.error('Failed to load image: /lovable-uploads/97674e5d-e119-49ed-a49c-e9695dab3378.png');
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully: /lovable-uploads/97674e5d-e119-49ed-a49c-e9695dab3378.png');
    setImageError(false);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 py-12 text-center max-w-4xl mx-auto bg-transparent">
        <LogoBranding 
          onImageError={handleImageError}
          onImageLoad={handleImageLoad}
        />

        <ChatInputArea
          isRecording={isRecording}
          audioLevel={audioLevel}
          attachedFiles={attachedFiles}
          onRemoveFile={removeFile}
          onKeyDown={handleKeyDown}
        >
          <IconButtonsRow
            isRecording={isRecording}
            isProcessing={isProcessing}
            isTyping={false}
            onVoiceRecording={handleVoiceRecording}
            onDatabaseSelect={() => setShowProjectModal(true)}
            onLocalFileSelect={() => setShowLocalUploader(true)}
          />
        </ChatInputArea>

        <ChatInputStatus
          error={error}
          isProcessing={isProcessing}
          isCompact={false}
        />
      </div>

      <ChatInputModals
        showProjectModal={showProjectModal}
        showFileUploader={showLocalUploader}
        onCloseProjectModal={() => setShowProjectModal(false)}
        onCloseFileUploader={() => setShowLocalUploader(false)}
        onAttachProject={addDatabaseFile}
        onAttachFile={addLocalFile}
      />
    </TooltipProvider>
  );
};

export default PerplexityEmptyState;
