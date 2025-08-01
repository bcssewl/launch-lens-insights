import { MagicWandIcon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Lightbulb, X, FileText, Users, Newspaper, GraduationCap, Check } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";

import { Detective } from "./icons/Detective";
import { Button } from "@/components/ui/button";
import NovelMessageInput, { type NovelMessageInputRef, type Resource } from './NovelMessageInput';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEnhancedDeerStreaming } from "@/hooks/useEnhancedDeerStreaming";
import { useDeerFlowStore } from "@/stores/deerFlowStore";
import { enhancePrompt } from "@/services/promptEnhancerService";
import { cn } from "@/lib/utils";

const REPORT_STYLES = [
  {
    value: "academic" as const,
    label: "Academic",
    description: "Formal, objective, and analytical with precise terminology",
    icon: GraduationCap,
  },
  {
    value: "popular_science" as const,
    label: "Popular Science", 
    description: "Engaging and accessible scientific content for general audience",
    icon: FileText,
  },
  {
    value: "news" as const,
    label: "News",
    description: "Journalistic style with clear facts and structured reporting", 
    icon: Newspaper,
  },
  {
    value: "social_media" as const,
    label: "Social Media",
    description: "Concise, engaging content optimized for social platforms", 
    icon: Users,
  },
];

interface InputBoxProps {
  className?: string;
  size?: "large" | "normal";
  responding?: boolean;
  feedback?: { option: { value: string; text: string } } | null;
  dynamicPlaceholder?: string;
  onSend?: (
    message: string,
    options?: {
      interruptFeedback?: string;
      resources?: Array<any>;
    }
  ) => void;
  onCancel?: () => void;
  onRemoveFeedback?: () => void;
  onUserInput?: () => void;
}

export function InputBox({
  className,
  responding,
  feedback,
  dynamicPlaceholder,
  onSend,
  onCancel,
  onRemoveFeedback,
  onUserInput,
}: InputBoxProps) {
  const { settings, updateSettings } = useDeerFlowStore();
  const { startDeerFlowStreaming, stopStreaming, isStreaming } = useEnhancedDeerStreaming();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<NovelMessageInputRef>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);

  // Enhancement state
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isEnhanceAnimating, setIsEnhanceAnimating] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");

  const handleSendMessage = useCallback(
    async (message: string, resources: Array<any> = []) => {
      if (responding || isStreaming) {
        if (onCancel) {
          onCancel();
        } else {
          stopStreaming();
        }
      } else {
        if (message.trim() === "") {
          return;
        }
        
        if (onSend) {
          onSend(message, {
            interruptFeedback: feedback?.option.value,
            resources,
          });
          onRemoveFeedback?.();
          // Clear enhancement animation after sending
          setIsEnhanceAnimating(false);
        } else {
          // Use streaming hook with current settings
          await startDeerFlowStreaming(message, {
            interruptFeedback: feedback?.option.value,
            enableDeepThinking: settings.deepThinking,
            enableBackgroundInvestigation: settings.backgroundInvestigation,
            reportStyle: settings.reportStyle as "academic" | "popular_science" | "news" | "social_media",
            maxPlanIterations: settings.maxPlanIterations,
            maxStepNum: settings.maxStepNum,
            maxSearchResults: settings.maxSearchResults,
            autoAcceptedPlan: settings.autoAcceptedPlan,
          });
        }
      }
    },
    [responding, isStreaming, onCancel, stopStreaming, onSend, feedback, onRemoveFeedback, startDeerFlowStreaming, settings],
  );

  const handleEnhancePrompt = useCallback(async () => {
    if (currentPrompt.trim() === "" || isEnhancing) {
      return;
    }

    setIsEnhancing(true);
    setIsEnhanceAnimating(true);

    try {
      // Call the real enhancement API with Railway backend
      const enhancedPrompt = await enhancePrompt(currentPrompt);

      // Add a small delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update the input with the enhanced prompt with animation
      if (inputRef.current) {
        inputRef.current.setContent(enhancedPrompt);
        setCurrentPrompt(enhancedPrompt);
      }

      // Keep animation for a bit longer to show the effect
      setTimeout(() => {
        setIsEnhanceAnimating(false);
      }, 1000);
    } catch (error) {
      console.error("Failed to enhance prompt:", error);
      setIsEnhanceAnimating(false);
      // Falls back gracefully - no notification needed as the original prompt is preserved
    } finally {
      setIsEnhancing(false);
    }
  }, [currentPrompt, isEnhancing]);

  const handleSubmit = useCallback(async () => {
    if (!currentPrompt.trim() || isStreaming) return;
    
    const message = currentPrompt.trim();
    setCurrentPrompt('');
    
    // Reset novel editor content
    if (inputRef.current) {
      inputRef.current.setContent('');
    }
    
    try {
      await handleSendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [currentPrompt, isStreaming, handleSendMessage]);

  const handleNovelEnter = useCallback((message: string, resources: Resource[]) => {
    console.log('Novel editor message:', message);
    if (resources.length > 0) {
      console.log('With resources:', resources);
    }
    handleSendMessage(message);
  }, [handleSendMessage]);

  const handleNovelChange = useCallback((markdown: string) => {
    setCurrentPrompt(markdown);
  }, []);

  const currentStyleConfig = useMemo(() => 
    REPORT_STYLES.find(style => style.value === settings.reportStyle) || REPORT_STYLES[0]!,
    [settings.reportStyle]
  );

  const CurrentStyleIcon = currentStyleConfig.icon;

  const handleReportStyleChange = useCallback((style: "academic" | "popular_science" | "news" | "social_media") => {
    updateSettings({ reportStyle: style });
  }, [updateSettings]);

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col rounded-[24px]",
        // Transparent background with glass effect border
        "backdrop-blur-xl",
        "border border-white/20 dark:border-white/10",
        "shadow-2xl shadow-black/5",
        className,
      )}
      ref={containerRef}
    >
      <div className="w-full">
        <AnimatePresence>
          {feedback && (
            <motion.div
              ref={feedbackRef}
              className="bg-background border-brand absolute top-0 left-0 mt-2 ml-4 flex items-center justify-center gap-1 rounded-2xl border px-2 py-0.5"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <div className="text-brand flex h-full w-full items-center justify-center text-sm opacity-90">
                {feedback.option.text}
              </div>
              <X
                className="cursor-pointer opacity-60"
                size={16}
                onClick={onRemoveFeedback}
              />
            </motion.div>
          )}
          {isEnhanceAnimating && (
            <motion.div
              className="pointer-events-none absolute inset-0 z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative h-full w-full">
                {/* Sparkle effect overlay */}
                <motion.div
                  className="absolute inset-0 rounded-[24px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10"
                  animate={{
                    background: [
                      "linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1), rgba(59, 130, 246, 0.1))",
                      "linear-gradient(225deg, rgba(147, 51, 234, 0.1), rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))",
                      "linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1), rgba(59, 130, 246, 0.1))",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                {/* Floating sparkles */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute h-2 w-2 rounded-full bg-purple-400"
                    style={{
                      left: `${20 + i * 12}%`,
                      top: `${30 + (i % 2) * 40}%`,
                    }}
                    animate={{
                      y: [-10, -20, -10],
                      opacity: [0, 1, 0],
                      scale: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <NovelMessageInput
          ref={inputRef}
          className={cn(
            "border-0 bg-transparent focus-visible:ring-0",
            "min-h-[3rem] max-h-[12rem] px-4 py-3",
            feedback && "pt-9",
            isEnhanceAnimating && "transition-all duration-500",
          )}
          loading={isStreaming}
          onEnter={handleNovelEnter}
          onChange={handleNovelChange}
          onUserInput={onUserInput}
          placeholder={isStreaming ? "DeerFlow is thinking..." : (dynamicPlaceholder !== undefined ? dynamicPlaceholder : "What can I do for you?")}
        />
      </div>
      <div className="flex items-center px-4 py-2">
        <div className="flex grow gap-2">
          {/* Deep Thinking Toggle */}
          <Button
            className={cn(
              "rounded-2xl h-8 px-3 text-xs",
              settings.deepThinking && "!border-purple-500 !text-purple-600",
            )}
            variant="outline"
            size="sm"
            onClick={() => {
              updateSettings({ deepThinking: !settings.deepThinking });
            }}
          >
            <Lightbulb className="w-3 h-3" /> Deep Thinking
          </Button>

          {/* Investigation Toggle */}
          <Button
            className={cn(
              "rounded-2xl h-8 px-3 text-xs",
              settings.backgroundInvestigation && "!border-purple-500 !text-purple-600",
            )}
            variant="outline"
            size="sm"
            onClick={() =>
              updateSettings({ backgroundInvestigation: !settings.backgroundInvestigation })
            }
          >
            <Detective className="w-3 h-3" /> Investigation
          </Button>

          {/* Report Style Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="!border-purple-500 !text-purple-600 rounded-2xl h-8 px-3 text-xs"
                variant="outline"
                size="sm"
              >
                <CurrentStyleIcon className="w-3 h-3" /> {currentStyleConfig.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-1">
              {REPORT_STYLES.map((style) => {
                const Icon = style.icon;
                const isSelected = settings.reportStyle === style.value;

                return (
                  <DropdownMenuItem
                    key={style.value}
                    className={cn(
                      "flex items-start gap-3 rounded-lg p-3 cursor-pointer min-h-[60px]",
                      isSelected && "bg-purple-50 dark:bg-purple-950/20"
                    )}
                    onClick={() => handleReportStyleChange(style.value)}
                  >
                    <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{style.label}</p>
                        {isSelected && <Check className="h-3 w-3 text-purple-600" />}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {style.description}
                      </p>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {/* Enhance Prompt Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "hover:bg-accent h-10 w-10",
              isEnhancing && "animate-pulse",
            )}
            onClick={handleEnhancePrompt}
            disabled={isEnhancing || currentPrompt.trim() === ""}
          >
            {isEnhancing ? (
              <div className="flex h-10 w-10 items-center justify-center">
                <div className="bg-foreground h-3 w-3 animate-bounce rounded-full opacity-70" />
              </div>
            ) : (
              <MagicWandIcon className="text-purple-600" />
            )}
          </Button>
          {/* Send/Stop Button */}
          <Button
            variant="outline"
            size="icon"
            className={cn("h-10 w-10 rounded-full")}
            onClick={() => inputRef.current?.submit()}
            disabled={!currentPrompt.trim() && !isStreaming}
          >
            {responding || isStreaming ? (
              <div className="flex h-10 w-10 items-center justify-center">
                <div className="bg-foreground h-4 w-4 rounded-sm opacity-70" />
              </div>
            ) : (
              <ArrowUp />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
