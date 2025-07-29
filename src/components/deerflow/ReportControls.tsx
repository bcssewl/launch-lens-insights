import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Headphones, 
  Pencil, 
  Undo2, 
  Copy, 
  Check, 
  Download, 
  Loader2,
  Share,
  Bookmark,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface ReportControlsProps {
  reportId?: string;
  editing?: boolean;
  onToggleEdit?: () => void;
  onCopy?: () => void;
  onDownload?: () => void;
  onGeneratePodcast?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  className?: string;
  isGeneratingPodcast?: boolean;
  copied?: boolean;
}

export const ReportControls: React.FC<ReportControlsProps> = ({
  reportId,
  editing = false,
  onToggleEdit,
  onCopy,
  onDownload,
  onGeneratePodcast,
  onShare,
  onBookmark,
  className,
  isGeneratingPodcast = false,
  copied = false
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <motion.div
      className={cn(
        "absolute right-4 top-4 flex items-center gap-1",
        "bg-background/80 backdrop-blur-sm rounded-lg border border-border/50 p-1",
        "shadow-lg",
        className
      )}
      initial={{ opacity: 0, scale: 0.9, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <TooltipProvider>
        {/* Generate Podcast */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground/50 cursor-not-allowed"
              onClick={onGeneratePodcast}
              disabled={true} // Disabled until API key is added
            >
              <AnimatePresence mode="wait">
                {isGeneratingPodcast ? (
                  <motion.div
                    key="loading"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    exit={{ rotate: 0 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="icon"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.8 }}
                  >
                    <Headphones className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Generate Podcast (API key required)
          </TooltipContent>
        </Tooltip>

        {/* Edit Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                "text-muted-foreground hover:text-foreground transition-colors",
                editing && "text-primary bg-primary/10"
              )}
              onClick={onToggleEdit}
            >
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: editing ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {editing ? <Eye className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
              </motion.div>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {editing ? 'Preview Mode' : 'Edit Report'}
          </TooltipContent>
        </Tooltip>

        {/* Copy */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={onCopy}
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Copy className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </TooltipContent>
        </Tooltip>

        {/* Extended controls - only show on hover */}
        <AnimatePresence>
          {isVisible && (
            <>
              {/* Share */}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15, delay: 0.05 }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      onClick={onShare}
                    >
                      <Share className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Share Report</TooltipContent>
                </Tooltip>
              </motion.div>

              {/* Bookmark */}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15, delay: 0.1 }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      onClick={onBookmark}
                    >
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Bookmark Report</TooltipContent>
                </Tooltip>
              </motion.div>

              {/* Download */}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15, delay: 0.15 }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      onClick={onDownload}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download as Markdown</TooltipContent>
                </Tooltip>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </TooltipProvider>
    </motion.div>
  );
};