
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SuggestedPromptsProps {
  prompts: string[];
  onPromptClick: (prompt: string) => void;
}

const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({ prompts, onPromptClick }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!prompts || prompts.length === 0) return null;

  const handlePromptClick = (prompt: string) => {
    onPromptClick(prompt);
    setIsOpen(false); // Collapse after use
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="py-2">
      <div className="flex items-center justify-between px-1 mb-2">
        <p className="text-xs text-muted-foreground">Suggested Prompts:</p>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="h-auto p-1">
            {isOpen ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="animate-accordion-down data-[state=closed]:animate-accordion-up">
        <div className="flex flex-wrap gap-2 px-1">
          {prompts.map((prompt, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="text-xs h-auto py-1 px-2 whitespace-nowrap shrink-0"
              onClick={() => handlePromptClick(prompt)}
            >
              {prompt}
            </Button>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default SuggestedPrompts;
