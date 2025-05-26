
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface SuggestedPromptsProps {
  prompts: string[];
  onPromptClick: (prompt: string) => void;
}

const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({ prompts, onPromptClick }) => {
  if (!prompts || prompts.length === 0) return null;

  return (
    <div className="py-2">
      <p className="text-xs text-muted-foreground mb-2 px-1">Suggested Prompts:</p>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-2 pb-2 px-1">
          {prompts.map((prompt, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="text-xs h-auto py-1 px-2 whitespace-normal text-left"
              onClick={() => onPromptClick(prompt)}
            >
              {prompt}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default SuggestedPrompts;
