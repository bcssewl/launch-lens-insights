
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowRight, Search, Mic, Plus, Send, Paperclip } from 'lucide-react';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { useFileAttachments } from '@/hooks/useFileAttachments';
import SoundWaveVisualization from './SoundWaveVisualization';
import AttachmentOptionsDropdown from './AttachmentOptionsDropdown';
import ProjectSelectionModal from './ProjectSelectionModal';
import LocalFileUploader from './LocalFileUploader';
import AttachmentsList from './AttachmentsList';

interface EnhancedChatInputProps {
  onSendMessage: (message: string) => void;
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
  const inputRef = useRef<HTMLTextAreaElement>(null);
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
    onSendMessage(inputValue);
    setInputValue('');
    clearFiles(); // Clear attachments after sending
    // Reset textarea height after sending
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
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

  const adjustInputFocus = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    if (!isCompact) {
      adjustInputFocus();
    }
  }, [isCompact]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  if (!isCompact) {
    // Prominent state - used in empty state
    return (
      <TooltipProvider>
        <div className="w-full max-w-3xl">
          <AttachmentsList 
            attachedFiles={attachedFiles} 
            onRemoveFile={removeFile} 
          />
          
          <div className="relative">
            <div className="absolute top-4 left-4 flex items-start pointer-events-none z-10">
              <Search className="h-5 w-5 text-muted-foreground mt-0.5" />
            </div>
            
            {/* Sound wave visualization overlay */}
            <SoundWaveVisualization audioLevel={audioLevel} isRecording={isRecording} />
            
            <Textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? "Listening..." : "Ask me anything about your startup ideas..."}
              autoExpand={true}
              className={`w-full min-h-[56px] max-h-[216px] pl-12 pr-32 text-lg rounded-2xl border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground resize-none overflow-y-auto py-4 ${
                isRecording ? 'bg-primary/5 border-primary/50' : ''
              }`}
              style={{ lineHeight: '1.5rem' }}
              disabled={isTyping || isRecording}
            />
            <div className="absolute top-2 right-2 flex items-start space-x-1">
              <AttachmentOptionsDropdown
                onDatabaseSelect={handleDatabaseSelect}
                onLocalFileSelect={handleLocalFileSelect}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full hover:bg-muted transition-all duration-200"
                      disabled={isTyping || isRecording}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Attach files</p>
                  </TooltipContent>
                </Tooltip>
              </AttachmentOptionsDropdown>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleVoiceRecording}
                    className={`h-10 w-10 rounded-full hover:bg-muted transition-all duration-200 ${
                      isRecording ? 'bg-red-100 hover:bg-red-200 text-red-600' : ''
                    } ${isProcessing ? 'opacity-50' : ''}`}
                    disabled={isTyping || isProcessing}
                  >
                    <Mic className={`h-4 w-4 ${isRecording ? 'animate-pulse' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isRecording ? 'Stop recording' : 'Dictate'}</p>
                </TooltipContent>
              </Tooltip>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-muted"
                disabled={isTyping || isRecording}
              >
                <Plus className="h-4 w-4" />
              </Button>
              
              {inputValue.trim() && !isRecording && (
                <Button
                  onClick={handleSendMessage}
                  size="icon"
                  className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90"
                  disabled={isTyping}
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          {error && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}
          {isProcessing && (
            <div className="mt-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
              Processing your voice recording...
            </div>
          )}
          
          {/* Modals */}
          <ProjectSelectionModal
            open={showProjectModal}
            onClose={() => setShowProjectModal(false)}
            onAttach={handleAttachProject}
          />
          
          <LocalFileUploader
            open={showFileUploader}
            onClose={() => setShowFileUploader(false)}
            onFileSelect={handleAttachFile}
          />
        </div>
      </TooltipProvider>
    );
  }

  // Compact state - ChatGPT-style centered input without full-width footer
  return (
    <TooltipProvider>
      <div className="py-4 px-6">
        <div className="flex items-end justify-center">
          <div className="w-full max-w-3xl relative">
            <AttachmentsList 
              attachedFiles={attachedFiles} 
              onRemoveFile={removeFile} 
            />
            
            {/* Sound wave visualization overlay */}
            <SoundWaveVisualization audioLevel={audioLevel} isRecording={isRecording} />
            
            <Textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? "Listening..." : "Ask a follow-up question..."}
              autoExpand={true}
              className={`w-full min-h-[48px] max-h-[216px] px-4 pr-32 rounded-2xl border border-border bg-background/80 backdrop-blur-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground resize-none overflow-y-auto py-3 ${
                isRecording ? 'bg-primary/5 border-primary/50 pl-12' : ''
              }`}
              style={{ lineHeight: '1.5rem' }}
              disabled={isTyping || isRecording}
            />
            <div className="absolute bottom-2 right-2 flex items-end space-x-1">
              <AttachmentOptionsDropdown
                onDatabaseSelect={handleDatabaseSelect}
                onLocalFileSelect={handleLocalFileSelect}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-muted transition-all duration-200"
                      disabled={isTyping || isRecording}
                    >
                      <Paperclip className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Attach files</p>
                  </TooltipContent>
                </Tooltip>
              </AttachmentOptionsDropdown>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleVoiceRecording}
                    className={`h-8 w-8 rounded-full hover:bg-muted transition-all duration-200 ${
                      isRecording ? 'bg-red-100 hover:bg-red-200 text-red-600' : ''
                    } ${isProcessing ? 'opacity-50' : ''}`}
                    disabled={isTyping || isProcessing}
                  >
                    <Mic className={`h-3 w-3 ${isRecording ? 'animate-pulse' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isRecording ? 'Stop recording' : 'Dictate'}</p>
                </TooltipContent>
              </Tooltip>
              
              <Button
                onClick={handleSendMessage}
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
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg max-w-3xl mx-auto">
            {error}
          </div>
        )}
        {isProcessing && (
          <div className="mt-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg max-w-3xl mx-auto">
            Processing your voice recording...
          </div>
        )}
        
        {/* Modals */}
        <ProjectSelectionModal
          open={showProjectModal}
          onClose={() => setShowProjectModal(false)}
          onAttach={handleAttachProject}
        />
        
        <LocalFileUploader
          open={showFileUploader}
          onClose={() => setShowFileUploader(false)}
          onFileSelect={handleAttachFile}
        />
      </div>
    </TooltipProvider>
  );
};

export default EnhancedChatInput;
