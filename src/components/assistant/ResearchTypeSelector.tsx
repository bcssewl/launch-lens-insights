
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 px-3 rounded-full hover:bg-muted transition-all duration-200 text-muted-foreground hover:text-foreground flex items-center gap-2"
        >
          <span className="text-sm font-medium">{selectedOption.label}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 bg-background border border-border shadow-lg z-50 max-h-80 overflow-y-auto">
        {RESEARCH_TYPES.map((type) => (
          <DropdownMenuItem
            key={type.value}
            onClick={() => onTypeChange(type.value)}
            className={`p-2 cursor-pointer hover:bg-muted ${
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
