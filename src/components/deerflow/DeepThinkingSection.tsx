/**
 * @file DeepThinkingSection.tsx
 * @description Collapsible "Deep thinking" section for planner messages
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Brain, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';

interface ThinkingPhase {
  phase: string;
  content: string;
}

interface ReasoningStep {
  step: string;
  content: string;
}

interface DeepThinkingSectionProps {
  thinkingPhases?: ThinkingPhase[];
  reasoningSteps?: ReasoningStep[];
  isStreaming?: boolean;
}

export const DeepThinkingSection: React.FC<DeepThinkingSectionProps> = ({
  thinkingPhases = [],
  reasoningSteps = [],
  isStreaming = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (thinkingPhases.length === 0 && reasoningSteps.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 border border-border rounded-lg bg-muted/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-3 h-auto hover:bg-muted/80"
          >
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Deep thinking</span>
              <Badge variant="secondary" className="text-xs">
                {thinkingPhases.length + reasoningSteps.length} phases
              </Badge>
            </div>
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-3 pb-3">
          <div className="space-y-3">
            {/* Thinking Phases */}
            {thinkingPhases.map((phase, index) => (
              <div key={`thinking-${index}`} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {phase.phase}
                  </span>
                </div>
                <div className="ml-4 text-sm text-foreground/90 leading-relaxed">
                  {phase.content}
                </div>
              </div>
            ))}

            {/* Reasoning Steps */}
            {reasoningSteps.map((step, index) => (
              <div key={`reasoning-${index}`} className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Step {index + 1}: {step.step}
                  </span>
                </div>
                <div className="ml-5 text-sm text-foreground/90 leading-relaxed">
                  {step.content}
                </div>
              </div>
            ))}

            {/* Streaming indicator */}
            {isStreaming && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                <span>Thinking...</span>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};