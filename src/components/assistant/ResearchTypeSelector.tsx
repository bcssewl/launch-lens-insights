
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Lightbulb } from 'lucide-react';

const RESEARCH_TYPES = [
  { label: "Quick Facts", value: "quick_facts", description: "Fast answers for simple questions" },
  { label: "Market Sizing", value: "market_sizing", description: "TAM/SAM/SOM analysis with metrics" },
  { label: "Competitive Analysis", value: "competitive_analysis", description: "Detailed competitor comparisons" },
  { label: "Regulatory Scan", value: "regulatory_scan", description: "Legal and compliance research" },
  { label: "Trend Analysis", value: "trend_analysis", description: "In-depth trend identification" },
  { label: "Legal Analysis", value: "legal_analysis", description: "Privacy-conscious legal research" },
  { label: "Deep Analysis", value: "deep_analysis", description: "Comprehensive deep dives" },
  { label: "Industry Reports", value: "industry_reports", description: "Full industry analysis" }
];

interface ResearchTypeSelectorProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
  isCompact?: boolean;
}

const ResearchTypeSelector: React.FC<ResearchTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
  isCompact = false
}) => {
  const selectedOption = RESEARCH_TYPES.find(type => type.value === selectedType) || RESEARCH_TYPES[0];

  if (isCompact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-muted transition-all duration-200"
            title={`Research Type: ${selectedOption.label}`}
          >
            <Lightbulb className="h-3 w-3" />
            <ChevronDown className="h-2 w-2 ml-0.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 bg-background border border-border shadow-lg z-50">
          {RESEARCH_TYPES.map((type) => (
            <DropdownMenuItem
              key={type.value}
              onClick={() => onTypeChange(type.value)}
              className={`p-3 cursor-pointer hover:bg-muted ${
                selectedType === type.value ? 'bg-muted' : ''
              }`}
            >
              <div className="flex flex-col space-y-1">
                <div className="font-medium text-sm">{type.label}</div>
                <div className="text-xs text-muted-foreground">{type.description}</div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-10 px-3 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground flex items-center gap-2"
        >
          <Lightbulb className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium">
            {selectedOption.label}
          </span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="start" 
        side="bottom"
        className="w-80 max-w-[85vw] backdrop-blur-xl bg-white/95 dark:bg-black/95 border border-white/20 dark:border-white/10 shadow-2xl rounded-xl z-50 overflow-visible"
        sideOffset={8}
        avoidCollisions={true}
        collisionPadding={20}
      >
        <div className="mb-1.5 px-2 py-1 backdrop-blur-sm">
          <h3 className="text-sm font-medium text-foreground">Choose Research Mode</h3>
          <p className="text-xs text-muted-foreground">Select the type of research you need</p>
        </div>
        
        <div className="px-1.5 pb-1.5 space-y-1 max-h-[320px] overflow-y-auto">
          {RESEARCH_TYPES.map((type) => (
            <DropdownMenuItem
              key={type.value}
              onClick={() => onTypeChange(type.value)}
              className="flex items-start gap-2.5 p-2.5 cursor-pointer hover:bg-white/10 dark:hover:bg-white/5 rounded-lg transition-colors backdrop-blur-sm"
            >
              <div className="flex-shrink-0 mt-0.5">
                {selectedType === type.value ? (
                  <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {type.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {type.description}
                </p>
              </div>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ResearchTypeSelector;
