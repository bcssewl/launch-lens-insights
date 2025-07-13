
import React, { useState, useEffect } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { useFileAttachments } from '@/hooks/useFileAttachments';
import ChatInputCore from './ChatInputCore';
import ChatInputControls from './ChatInputControls';
import ChatInputStatus from './ChatInputStatus';
import ChatInputModals from './ChatInputModals';

interface EnhancedChatInputProps {
  onSendMessage: (message: string, attachments?: any[]) => void;
  isTyping: boolean;
  isCompact?: boolean;
}

const EnhancedChatInput: React.FC<EnhancedChatInputProps> = ({ 
  onSendMessage, 
  isTyping, 
  isCompact = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showFileUploader, setShowFileUploader] = useState(false);
  
  const { isRecording, isProcessing, audioLevel, error, startRecording, stopRecording, clearError } = useVoiceRecording();
  const { attachedFiles, addDatabaseFile, addLocalFile, removeFile, clearFiles } = useFileAttachments();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    onSendMessage(inputValue, attachedFiles);
    setInputValue('');
    clearFiles();
  };

  const handleVoiceRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleDatabaseSelect = () => {
    setShowProjectModal(true);
  };

  const handleLocalFileSelect = () => {
    setShowFileUploader(true);
  };

  const handleAttachProject = (projectId: string, projectName: string) => {
    addDatabaseFile(projectId, projectName);
  };

  const handleAttachFile = (file: File) => {
    addLocalFile(file);
  };

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const containerClassName = isCompact 
    ? "w-full max-w-3xl mx-auto" 
    : "w-full max-w-3xl";

  const innerClassName = isCompact 
    ? "flex items-end justify-center" 
    : "";

  const inputContainerClassName = isCompact 
    ? "w-full relative" 
    : "relative";

  return (
    <TooltipProvider>
      <div className={containerClassName}>
        {isCompact && (
          <div className={innerClassName}>
            <div className={inputContainerClassName}>
              <ChatInputCore
                inputValue={inputValue}
                setInputValue={setInputValue}
                onKeyDown={handleKeyDown}
                onSendMessage={handleSendMessage}
                isTyping={isTyping}
                isRecording={isRecording}
                audioLevel={audioLevel}
                isCompact={isCompact}
                attachedFiles={attachedFiles}
                onRemoveFile={removeFile}
              >
                <ChatInputControls
                  isCompact={isCompact}
                  isTyping={isTyping}
                  isRecording={isRecording}
                  isProcessing={isProcessing}
                  inputValue={inputValue}
                  onVoiceRecording={handleVoiceRecording}
                  onSendMessage={handleSendMessage}
                  onDatabaseSelect={handleDatabaseSelect}
                  onLocalFileSelect={handleLocalFileSelect}
                />
              </ChatInputCore>
            </div>
          </div>
        )}

        {!isCompact && (
          <ChatInputCore
            inputValue={inputValue}
            setInputValue={setInputValue}
            onKeyDown={handleKeyDown}
            onSendMessage={handleSendMessage}
            isTyping={isTyping}
            isRecording={isRecording}
            audioLevel={audioLevel}
            isCompact={isCompact}
            attachedFiles={attachedFiles}
            onRemoveFile={removeFile}
          >
            <ChatInputControls
              isCompact={isCompact}
              isTyping={isTyping}
              isRecording={isRecording}
              isProcessing={isProcessing}
              inputValue={inputValue}
              onVoiceRecording={handleVoiceRecording}
              onSendMessage={handleSendMessage}
              onDatabaseSelect={handleDatabaseSelect}
              onLocalFileSelect={handleLocalFileSelect}
            />
          </ChatInputCore>
        )}
        
        <ChatInputStatus
          error={error}
          isProcessing={isProcessing}
          isCompact={isCompact}
        />
        
        <ChatInputModals
          showProjectModal={showProjectModal}
          showFileUploader={showFileUploader}
          onCloseProjectModal={() => setShowProjectModal(false)}
          onCloseFileUploader={() => setShowFileUploader(false)}
          onAttachProject={handleAttachProject}
          onAttachFile={handleAttachFile}
        />
      </div>
    </TooltipProvider>
  );
};

export default EnhancedChatInput;
