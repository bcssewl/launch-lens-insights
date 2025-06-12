
import React from 'react';
import { Button } from '@/components/ui/button';

interface ActionPlanSuggestionsProps {
  onSelectSuggestion: (suggestion: string) => void;
}

const suggestions = [
  "I have under $5,000 to invest",
  "I have $10k-50k available", 
  "I'm well-funded and ready to scale",
  "I prefer to bootstrap without investment",
  "Yes, I have potential users identified",
  "No, I'm starting completely from scratch",
  "I have an existing email list/following",
  "Yes, include customer personas",
  "No, focus on other aspects",
  "What's the lean startup methodology?",
  "How do I validate my assumptions?",
  "What should my MVP include?"
];

const ActionPlanSuggestions: React.FC<ActionPlanSuggestionsProps> = ({ onSelectSuggestion }) => {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground font-medium">Quick responses:</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="text-xs h-8 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={() => onSelectSuggestion(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ActionPlanSuggestions;
