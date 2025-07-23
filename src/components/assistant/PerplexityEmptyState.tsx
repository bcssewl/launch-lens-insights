
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Mic, Target, Globe, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { useFileAttachments } from '@/hooks/useFileAttachments';
import { useGreeting } from '@/hooks/useGreeting';
import SoundWaveVisualization from './SoundWaveVisualization';
import AttachmentOptionsDropdown from './AttachmentOptionsDropdown';
import ProjectSelectionModal from './ProjectSelectionModal';
import LocalFileUploader from './LocalFileUploader';
import AttachmentsList from './AttachmentsList';
import ResearchTypeSelector from './ResearchTypeSelector';
import ModelSelectionDropdown, { AIModel } from './ModelSelectionDropdown';
import { getConsultingPlaceholder } from '@/lib/geolocation';

interface PerplexityEmptyStateProps {
  onSendMessage: (message: string, attachments?: any[], selectedModel?: string) => void;
  selectedModel: string;
  onModelSelect?: (model: AIModel) => void;
}

const PerplexityEmptyState: React.FC<PerplexityEmptyStateProps> = ({
  onSendMessage,
  selectedModel: parentSelectedModel,
  onModelSelect
}) => {
  const { primaryGreeting, assistanceMessage, isLoading: greetingLoading, userCountry } = useGreeting();
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
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showLocalUploader, setShowLocalUploader] = useState(false);
  const [selectedResearchType, setSelectedResearchType] = useState<string>('quick_facts');
  
  // Placeholder rotation state
  const [placeholderText, setPlaceholderText] = useState<string>('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate new placeholder text
  const generatePlaceholder = useCallback(() => {
    return getConsultingPlaceholder(userCountry);
  }, [userCountry]);

  // Clear existing timer
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Start rotation timer
  const startRotationTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      setPlaceholderText(generatePlaceholder());
    }, 12000); // 12 seconds
  }, [clearTimer, generatePlaceholder]);

  // Initialize placeholder and start rotation timer
  useEffect(() => {
    if (userCountry) {
      // Set initial placeholder
      setPlaceholderText(generatePlaceholder());
      
      // Start rotation timer
      startRotationTimer();
    }

    // Cleanup on unmount
    return () => {
      clearTimer();
    };
  }, [userCountry, generatePlaceholder, startRotationTimer, clearTimer]);

  // Handle user input interactions - reset timer
  const handleInputInteraction = useCallback(() => {
    startRotationTimer();
  }, [startRotationTimer]);

  const handlePromptClick = (prompt: string) => {
    onSendMessage(prompt, attachedFiles, parentSelectedModel);
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

  const handleResearchTypeChange = (type: string) => {
    setSelectedResearchType(type);
    console.log('Selected research type:', type);
  };

  return (
    <TooltipProvider>
      {/* Unified Container - combines background and content */}
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-3xl mx-auto px-6 py-12 text-center bg-transparent">
        {/* Dynamic Greeting Section */}
        <div className="mb-12">
          <div className="flex flex-col items-center mb-6">
            <h1 className="text-4xl font-light text-foreground tracking-tight mb-2">
              {greetingLoading ? 'Welcome' : primaryGreeting}
            </h1>
            <h2 className="text-lg font-normal text-muted-foreground mt-2">
              {greetingLoading ? 'How may I assist you today?' : assistanceMessage}
            </h2>
          </div>
        </div>

        {/* Input Area */}
        <div className="w-full mb-12">
          {/* Input Field Container */}
          <div className="relative w-full bg-background border border-border rounded-2xl px-6 py-3 shadow-md hover:shadow-lg transition-all duration-200 mb-3">
            {/* Sound wave visualization overlay */}
            <SoundWaveVisualization audioLevel={audioLevel} isRecording={isRecording} />
            
            <input 
              type="text" 
              placeholder={isRecording ? "Listening..." : placeholderText} 
              className={`w-full h-12 text-base bg-transparent border-none outline-none focus:outline-none placeholder:text-muted-foreground ${isRecording ? 'pl-12' : ''}`} 
              disabled={isRecording} 
              onKeyDown={handleKeyDown}
              onChange={handleInputInteraction}
              onFocus={handleInputInteraction}
              onInput={handleInputInteraction}
            />
          </div>

          {/* Attachments List */}
          <AttachmentsList attachedFiles={attachedFiles} onRemoveFile={removeFile} />

          {/* Icon Buttons Row - Positioned Below Input */}
          <div className="flex items-center justify-between px-2">
            {/* Left Side Button Group */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground">
                <Target className="h-5 w-5" />
              </Button>
              {parentSelectedModel === 'algeon' && (
                <ResearchTypeSelector 
                  selectedType={selectedResearchType} 
                  onTypeChange={handleResearchTypeChange} 
                />
              )}
            </div>

            {/* Right Side Button Group */}
            <div className="flex items-center space-x-2">
              {onModelSelect && (
                <ModelSelectionDropdown
                  selectedModel={parentSelectedModel}
                  onModelSelect={onModelSelect}
                />
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <AttachmentOptionsDropdown onDatabaseSelect={() => setShowProjectModal(true)} onLocalFileSelect={() => setShowLocalUploader(true)}>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground">
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
                    className={`h-10 w-10 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground ${isRecording ? 'bg-red-100 hover:bg-red-200 text-red-600' : ''} ${isProcessing ? 'opacity-50' : ''}`} 
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
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20">
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
            <div className="mt-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}
          {isProcessing && (
            <div className="mt-4 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
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
