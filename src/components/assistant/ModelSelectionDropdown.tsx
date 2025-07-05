
import React, { useState } from 'react';
import { Check, Lightbulb, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface AIModel {
  id: string;
  name: string;
  description: string;
  isDefault?: boolean;
}

const AI_MODELS: AIModel[] = [
  {
    id: 'best',
    name: 'Best',
    description: 'Selects the best model for each query',
    isDefault: true
  },
  {
    id: 'nexus',
    name: 'Nexus',
    description: 'Best at collecting and analyzing data'
  },
  {
    id: 'algeon',
    name: 'Algeon',
    description: 'Excels at math & strategy'
  },
  {
    id: 'stratix',
    name: 'Stratix',
    description: 'Excels at business planning'
  }
];

interface ModelSelectionDropdownProps {
  selectedModel?: string;
  onModelSelect: (model: AIModel) => void;
}

const ModelSelectionDropdown: React.FC<ModelSelectionDropdownProps> = ({
  selectedModel = 'best',
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
          size="icon" 
          className="h-10 w-10 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground relative"
        >
          <Lightbulb className="h-5 w-5" />
          {selectedModel !== 'best' && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background" />
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="center" 
        side="bottom"
        className="w-80 p-2 bg-background border border-border shadow-lg z-50"
        sideOffset={12}
        avoidCollisions={false}
        collisionPadding={10}
      >
        <div className="mb-2 px-2 py-1">
          <h3 className="text-sm font-medium text-foreground">Choose AI Model</h3>
          <p className="text-xs text-muted-foreground">Select the best model for your task</p>
        </div>
        
        {AI_MODELS.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => handleModelSelect(model)}
            className="flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/50 rounded-md"
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
                  <span className="px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModelSelectionDropdown;
