
import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowRight, Mic } from 'lucide-react';
import SuggestedPrompts from '@/components/assistant/SuggestedPrompts';
import SoundWaveVisualization from './SoundWaveVisualization';
import { suggestedPromptsData } from '@/constants/aiAssistant';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isTyping: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isTyping }) => {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isRecording, isProcessing, audioLevel, error, startRecording, stopRecording, clearError } = useVoiceRecording();

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
  };

  const handlePromptClick = (prompt: string) => {
    onSendMessage(prompt);
  };

  const handleVoiceRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 120; // Maximum height before scrolling
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const suggestedPromptsStrings = suggestedPromptsData.map(p => p.text);

  return (
    <TooltipProvider>
      <div className="border-t bg-background p-4 flex-shrink-0 mt-auto">
        <SuggestedPrompts prompts={suggestedPromptsStrings} onPromptClick={handlePromptClick} />
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-end space-x-2 mt-2">
          <div className="flex-1 relative">
            {/* Sound wave visualization overlay */}
            <SoundWaveVisualization audioLevel={audioLevel} isRecording={isRecording} />
            
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? "Listening..." : "Ask me anything about your startup ideas... (Press Shift+Enter for new line)"}
              className={`w-full min-h-[40px] max-h-[120px] resize-none border-muted transition-all duration-200 ${
                isRecording ? 'bg-primary/5 border-primary/50 pl-12' : ''
              }`}
              disabled={isTyping || isRecording}
              rows={1}
            />
            
            {/* Voice recording button */}
            <div className="absolute bottom-2 right-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleVoiceRecording}
                    className={`h-6 w-6 rounded-full hover:bg-muted transition-all duration-200 ${
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
            </div>
          </div>
          
          <Button
            type="submit"
            size="icon"
            disabled={isTyping || inputValue.trim() === '' || isRecording}
            className={`gradient-button flex-shrink-0 transition-all duration-200 ${isTyping ? 'opacity-60 cursor-not-allowed' : ''}`}
            aria-label="Send message"
          >
            {isTyping ? (
              <span className="inline-block w-5 h-5">
                <span className="block w-1 h-1 rounded-full bg-muted-foreground animate-bounce" style={{animationDelay: '0s'}}></span>
                <span className="block w-1 h-1 rounded-full bg-muted-foreground animate-bounce ml-1" style={{animationDelay: '0.15s'}}></span>
                <span className="block w-1 h-1 rounded-full bg-muted-foreground animate-bounce ml-1" style={{animationDelay: '0.3s'}}></span>
              </span>
            ) : (
              <ArrowRight className="h-5 w-5" />
            )}
          </Button>
        </form>
        
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
      </div>
    </TooltipProvider>
  );
};

export default ChatInput;
