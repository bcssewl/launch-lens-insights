
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Search, Target, Lightbulb, Globe, Paperclip, Mic, Plus } from 'lucide-react';
import AttachmentOptionsDropdown from './AttachmentOptionsDropdown';

interface IconButtonsRowProps {
  isRecording: boolean;
  isProcessing: boolean;
  isTyping: boolean;
  onVoiceRecording: () => void;
  onDatabaseSelect: () => void;
  onLocalFileSelect: () => void;
}

const IconButtonsRow: React.FC<IconButtonsRowProps> = ({
  isRecording,
  isProcessing,
  isTyping,
  onVoiceRecording,
  onDatabaseSelect,
  onLocalFileSelect
}) => {
  return (
    <div className="flex items-center justify-between px-2">
      {/* Left Side Button Group */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground"
        >
          <Search className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground"
        >
          <Target className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground"
        >
          <Lightbulb className="h-5 w-5" />
        </Button>
      </div>

      {/* Right Side Button Group */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground"
        >
          <Globe className="h-5 w-5" />
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <AttachmentOptionsDropdown
              onDatabaseSelect={onDatabaseSelect}
              onLocalFileSelect={onLocalFileSelect}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground"
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
              className={`h-10 w-10 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground ${
                isRecording ? 'bg-red-100 hover:bg-red-200 text-red-600' : ''
              } ${isProcessing ? 'opacity-50' : ''}`}
              onClick={onVoiceRecording}
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
              className="h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
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
  );
};

export default IconButtonsRow;
