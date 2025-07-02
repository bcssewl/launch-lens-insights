
import React, { useState } from 'react';
import { Logo } from '@/components/icons';
import { Search, Mic, Plus, Target, Lightbulb, Globe, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { useFileAttachments } from '@/hooks/useFileAttachments';
import SoundWaveVisualization from './SoundWaveVisualization';
import AttachmentOptionsDropdown from './AttachmentOptionsDropdown';
import ProjectSelectionModal from './ProjectSelectionModal';
import LocalFileUploader from './LocalFileUploader';
import AttachmentsList from './AttachmentsList';

interface PerplexityEmptyStateProps {
  onSendMessage: (message: string, attachments?: any[]) => void;
}

const PerplexityEmptyState: React.FC<PerplexityEmptyStateProps> = ({ onSendMessage }) => {
  const { isRecording, isProcessing, audioLevel, error, startRecording, stopRecording, clearError } = useVoiceRecording();
  const { attachedFiles, addDatabaseFile, addLocalFile, removeFile, clearFiles } = useFileAttachments();
  
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showLocalUploader, setShowLocalUploader] = useState(false);

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

  return (
    <TooltipProvider>
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 py-12 text-center max-w-4xl mx-auto bg-white dark:bg-gray-900">
        {/* Logo/Branding Section */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-6">
            <Logo className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-semibold text-gray-900 dark:text-white mb-4 tracking-tight">
            AI Business Assistant
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
            Get instant insights, market analysis, and strategic advice for your startup ideas. 
            Ask anything about business validation, market research, or growth strategies.
          </p>
        </div>

        {/* Perplexity Pro-Style Input Area */}
        <div className="w-full max-w-4xl mb-12">
          {/* Input Field Container */}
          <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-6 py-4 shadow-sm hover:shadow-md transition-all duration-200 mb-3">
            {/* Sound wave visualization overlay */}
            <SoundWaveVisualization audioLevel={audioLevel} isRecording={isRecording} />
            
            <input
              type="text"
              placeholder={isRecording ? "Listening..." : "Ask anything or @ mention a Space"}
              className={`w-full h-12 text-base bg-transparent border-none outline-none focus:outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400 text-gray-900 dark:text-white ${
                isRecording ? 'pl-12' : ''
              }`}
              disabled={isRecording}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Attachments List */}
          <AttachmentsList
            attachedFiles={attachedFiles}
            onRemoveFile={removeFile}
          />

          {/* Icon Buttons Row - Positioned Below Input */}
          <div className="flex items-center justify-between px-2">
            {/* Left Side Button Group */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <Search className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <Target className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <Lightbulb className="h-5 w-5" />
              </Button>
            </div>

            {/* Right Side Button Group */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <Globe className="h-5 w-5" />
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AttachmentOptionsDropdown
                    onDatabaseSelect={() => setShowProjectModal(true)}
                    onLocalFileSelect={() => setShowLocalUploader(true)}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      <Paperclip className="h-5 w-5" />
                    </Button>
                  </AttachmentOptionsDropdown>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add reports, presentations, etc.</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white ${
                      isRecording ? 'bg-red-100 hover:bg-red-200 text-red-600' : ''
                    } ${isProcessing ? 'opacity-50' : ''}`}
                    onClick={handleVoiceRecording}
                    disabled={isProcessing}
                  >
                    <Mic className={`h-5 w-5 ${isRecording ? 'animate-pulse' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Dictate</p>
                </TooltipContent>
              </Tooltip>
              {/* Pro-style Audio Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700"
                  >
                    <div className="flex items-center space-x-0.5">
                      <div className="w-0.5 h-2 bg-current rounded-full animate-pulse" />
                      <div className="w-0.5 h-3 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                      <div className="w-0.5 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Voice mode</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Error and Processing Messages */}
          {error && (
            <div className="mt-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg max-w-3xl mx-auto">
              {error}
            </div>
          )}
          {isProcessing && (
            <div className="mt-4 text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg max-w-3xl mx-auto">
              Processing your voice recording...
            </div>
          )}
        </div>
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

export default PerplexityEmptyState;
