
import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowRight, Mic, Paperclip, Target, Globe } from 'lucide-react';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { useFileAttachments } from '@/hooks/useFileAttachments';
import SoundWaveVisualization from './SoundWaveVisualization';
import AttachmentOptionsDropdown from './AttachmentOptionsDropdown';
import ProjectSelectionModal from './ProjectSelectionModal';
import LocalFileUploader from './LocalFileUploader';
import AttachmentsList from './AttachmentsList';
import ModelSelectionDropdown, { AIModel } from './ModelSelectionDropdown';

interface EnhancedChatInputProps {
  onSendMessage: (message: string, attachments?: any[], selectedModel?: string) => void;
  isTyping: boolean;
  isCompact?: boolean;
}

const EnhancedChatInput: React.FC<EnhancedChatInputProps> = ({
  onSendMessage,
  isTyping,
  isCompact = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('best');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showLocalUploader, setShowLocalUploader] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    isRecording,
    isProcessing,
    audioLevel,
    error,
    startRecording,
    stopRecording,
    clearError
  } = useVoiceRecording();

  const {
    attachedFiles,
    addDatabaseFile,
    addLocalFile,
    removeFile,
    clearFiles
  } = useFileAttachments();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    onSendMessage(inputValue, attachedFiles, selectedModel);
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

  const handleModelSelect = (model: AIModel) => {
    console.log('Model selected:', model);
    setSelectedModel(model.id);
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 120;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  return (
    <TooltipProvider>
      <div className={`bg-background/95 backdrop-blur-sm border border-border rounded-xl ${isCompact ? 'mx-4 mb-4' : 'p-4'} transition-all duration-200`}>
        {/* Attachments List */}
        <AttachmentsList attachedFiles={attachedFiles} onRemoveFile={removeFile} />

        {/* Main Input Container */}
        <div className="relative bg-background border border-border rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-all duration-200">
          {/* Sound wave visualization overlay */}
          <SoundWaveVisualization audioLevel={audioLevel} isRecording={isRecording} />
          
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "Listening..." : "Ask anything or @ mention a Space"}
            className={`w-full min-h-[40px] max-h-[120px] resize-none border-none bg-transparent outline-none focus:outline-none placeholder:text-muted-foreground ${
              isRecording ? 'pl-12' : ''
            }`}
            disabled={isTyping || isRecording}
            rows={1}
          />
          
          {/* Send Button */}
          <div className="absolute bottom-3 right-3">
            <Button
              onClick={handleSendMessage}
              size="icon"
              disabled={isTyping || inputValue.trim() === '' || isRecording}
              className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 transition-all duration-200"
              aria-label="Send message"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Control Buttons Row */}
        <div className="flex items-center justify-between mt-3 px-2">
          {/* Left Side Controls */}
          <div className="flex items-center space-x-2">
            <ModelSelectionDropdown 
              selectedModel={selectedModel} 
              onModelSelect={handleModelSelect} 
            />
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted/50">
              <Target className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted/50">
              <Globe className="h-4 w-4" />
            </Button>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <AttachmentOptionsDropdown
                  onDatabaseSelect={() => setShowProjectModal(true)}
                  onLocalFileSelect={() => setShowLocalUploader(true)}
                >
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted/50">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </AttachmentOptionsDropdown>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add attachments</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleVoiceRecording}
                  className={`h-8 w-8 rounded-full hover:bg-muted/50 ${
                    isRecording ? 'bg-red-100 hover:bg-red-200 text-red-600' : ''
                  } ${isProcessing ? 'opacity-50' : ''}`}
                  disabled={isTyping || isProcessing}
                >
                  <Mic className={`h-4 w-4 ${isRecording ? 'animate-pulse' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isRecording ? 'Stop recording' : 'Voice input'}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </div>
        )}
        {isProcessing && (
          <div className="mt-3 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
            Processing your voice recording...
          </div>
        )}
      </div>

      {/* Modals */}
      <ProjectSelectionModal 
        open={showProjectModal} 
        onClose={() => setShowProjectModal(false)} 
        onAttach={addDatabaseFile} 
      />
      
      <LocalFileUploader 
        open={showLocalUploader} 
        onClose={() => setShowLocalUploader(false)} 
        onFileSelect={addLocalFile} 
      />
    </TooltipProvider>
  );
};

export default EnhancedChatInput;
