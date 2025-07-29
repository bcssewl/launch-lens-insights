import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Headphones, Download, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RainbowText } from './RainbowText';
import { DeerMessage } from '@/stores/deerFlowMessageStore';

interface PodcastCardProps {
  message: DeerMessage;
}

export const PodcastCard: React.FC<PodcastCardProps> = ({ message }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const data = useMemo(() => {
    try {
      return JSON.parse(message.content ?? "{}");
    } catch {
      return {};
    }
  }, [message.content]);
  
  const title = data?.title || "Research Podcast";
  const audioUrl = data?.audioUrl;
  const isGenerating = message.isStreaming;
  const hasError = data?.error !== undefined;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full max-w-[508px] mx-auto"
    >
      <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <AnimatePresence mode="wait">
                {isGenerating ? (
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
                    transition={{ duration: 0.2 }}
                  >
                    <Headphones size={16} />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {!hasError ? (
                <RainbowText animated={isGenerating}>
                  {isGenerating
                    ? "Generating podcast..."
                    : isPlaying
                      ? "Now playing podcast..."
                      : "Podcast"}
                </RainbowText>
              ) : (
                <motion.div 
                  className="text-destructive"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  Error when generating podcast. Please try again.
                </motion.div>
              )}
            </div>
            
            {!hasError && !isGenerating && audioUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="flex"
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        asChild
                      >
                        <a
                          href={audioUrl}
                          download={`${title.replaceAll(" ", "-")}.mp3`}
                          className="flex items-center gap-2"
                        >
                          <Download size={16} />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download podcast</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.div>
            )}
          </div>
          
          <CardTitle>
            <motion.div 
              className="text-lg font-medium"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <RainbowText animated={isGenerating}>{title}</RainbowText>
            </motion.div>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <AnimatePresence mode="wait">
            {audioUrl ? (
              <motion.div
                key="audio"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <audio
                  className="w-full rounded-md"
                  src={audioUrl}
                  controls
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  style={{
                    accentColor: 'hsl(var(--primary))',
                  }}
                />
              </motion.div>
            ) : isGenerating ? (
              <motion.div
                key="generating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-12 bg-muted/50 rounded-md flex items-center justify-center border border-border/50"
              >
                <RainbowText animated>Preparing audio...</RainbowText>
              </motion.div>
            ) : hasError ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-12 bg-destructive/10 border border-destructive/20 rounded-md flex items-center justify-center"
              >
                <span className="text-destructive text-sm">
                  Failed to generate podcast
                </span>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};