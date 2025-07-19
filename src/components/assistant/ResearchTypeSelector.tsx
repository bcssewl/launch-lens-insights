
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Microscope } from 'lucide-react';

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
  const buttonSize = isCompact ? 'h-8 w-8' : 'h-10 w-10';
  const iconSize = isCompact ? 'h-3 w-3' : 'h-4 w-4';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`${buttonSize} rounded-full hover:bg-muted transition-all duration-200`}
          title={`Research Type: ${selectedOption.label}`}
        >
          <Microscope className={iconSize} />
          <ChevronDown className="h-2 w-2 ml-0.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-background border border-border shadow-lg">
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
};

export default ResearchTypeSelector;
