
import React, { useState } from 'react';
import { Check, Lightbulb, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface AIModel {
  id: string;
  name: string;
  description: string;
  isDefault?: boolean;
}

const AI_MODELS: AIModel[] = [
  {
    id: 'algeon',
    name: 'Algeon',
    description: 'Excels at math & strategy with research capabilities',
    isDefault: true
  },
  {
    id: 'ii-research',
    name: 'ii-Research',
    description: 'Advanced research and analysis model'
  },
  {
    id: 'deer',
    name: 'Deer',
    description: 'Creative and conversational AI model'
  }
];

interface ModelSelectionDropdownProps {
  selectedModel?: string;
  onModelSelect: (model: AIModel) => void;
}

const ModelSelectionDropdown: React.FC<ModelSelectionDropdownProps> = ({
  selectedModel = 'algeon',
  onModelSelect
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentModel = AI_MODELS.find(model => model.id === selectedModel) || AI_MODELS[0];

  const handleModelSelect = (model: AIModel) => {
    onModelSelect(model);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-10 px-3 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground flex items-center gap-2"
        >
          <Lightbulb className="h-4 w-4" />
          <span className="text-sm font-medium">
            {currentModel.name}
          </span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="start" 
        side="bottom"
        className="w-64 max-w-[85vw] backdrop-blur-xl bg-white/95 dark:bg-black/95 border border-white/20 dark:border-white/10 shadow-2xl rounded-xl z-50 overflow-visible"
        sideOffset={8}
        avoidCollisions={true}
        collisionPadding={20}
      >
        <div className="mb-1.5 px-2 py-1 backdrop-blur-sm">
          <h3 className="text-sm font-medium text-foreground">Choose AI Model</h3>
          <p className="text-xs text-muted-foreground">Select the best model for your task</p>
        </div>
        
        <ScrollArea className="h-[160px]" type="always">
          <div className="px-1.5 pb-1.5 space-y-1">
            {AI_MODELS.map((model) => (
              <DropdownMenuItem
                key={model.id}
                onClick={() => handleModelSelect(model)}
                className="flex items-start gap-2.5 p-2.5 cursor-pointer hover:bg-white/10 dark:hover:bg-white/5 rounded-lg transition-colors backdrop-blur-sm"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {selectedModel === model.id ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <div className="h-4 w-4" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {model.name}
                    </span>
                    {model.isDefault && (
                      <span className="px-1 py-0.5 text-xs bg-primary/20 text-primary rounded backdrop-blur-sm">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {model.description}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModelSelectionDropdown;
