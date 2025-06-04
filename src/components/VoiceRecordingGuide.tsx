
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, HelpCircle, EyeOff } from 'lucide-react';

interface VoiceRecordingGuideProps {
  isVisible: boolean;
  onToggleVisibility: () => void;
  autoShowed?: boolean;
  isRecording?: boolean;
}

const VoiceRecordingGuide: React.FC<VoiceRecordingGuideProps> = ({ 
  isVisible, 
  onToggleVisibility, 
  autoShowed = false,
  isRecording = false 
}) => {
  const [openSections, setOpenSections] = useState<string[]>(['basic']);
  const [showHighlight, setShowHighlight] = useState(false);

  // Show highlight animation when guide auto-appears
  useEffect(() => {
    if (isVisible && autoShowed) {
      setShowHighlight(true);
      const timer = setTimeout(() => setShowHighlight(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoShowed]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const guideItems = [
    {
      id: 'basic',
      title: 'Basic Information',
      items: [
        { field: 'Idea Name', prompt: 'What do you call your idea?' },
        { field: 'One-line Description', prompt: 'Describe your idea in one powerful sentence' },
        { field: 'Problem Statement', prompt: 'What problem does this solve? Who experiences this problem?' },
        { field: 'Solution Description', prompt: 'How does your solution work? What makes it unique?' }
      ]
    },
    {
      id: 'market',
      title: 'Market Details',
      items: [
        { field: 'Target Customer', prompt: 'Are you targeting B2B, B2C, Marketplace, or Platform?' },
        { field: 'Customer Segment', prompt: 'Be specific about your ideal customer (e.g., small business owners, college students)' },
        { field: 'Geographic Focus', prompt: 'Where will you operate? (US, Europe, Asia, Global, etc.)' }
      ]
    },
    {
      id: 'business',
      title: 'Business Model',
      items: [
        { field: 'Revenue Model', prompt: 'How will you make money? (Subscription, One-time, Commission, Advertising, Freemium)' },
        { field: 'Expected Pricing', prompt: 'What do you plan to charge? Give a rough price point' },
        { field: 'Known Competitors', prompt: 'List any competitors you\'re aware of (optional)' }
      ]
    },
    {
      id: 'goals',
      title: 'Validation Goals',
      items: [
        { field: 'Primary Goal', prompt: 'What\'s your main validation goal? (Market demand, competition, sizing, or all)' },
        { field: 'Timeline', prompt: 'When are you building this? (This month, 3 months, 6+ months, just exploring)' },
        { field: 'Additional Context', prompt: 'Any other details or specific questions? (optional)' }
      ]
    }
  ];

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-50 lg:static lg:z-auto transition-all duration-500 ${
      isVisible ? 'animate-fade-in' : ''
    }`}>
      {/* Mobile backdrop */}
      <div 
        className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onToggleVisibility}
      />
      
      <Card className={`
        glass-card w-full max-w-md mx-auto
        fixed bottom-0 left-0 right-0 lg:static
        rounded-t-xl lg:rounded-xl
        max-h-[80vh] lg:max-h-none
        overflow-y-auto
        transform transition-all duration-500 ease-out
        ${isVisible ? 'translate-y-0 lg:translate-x-0' : 'translate-y-full lg:translate-x-0'}
        ${showHighlight ? 'ring-2 ring-primary/50 shadow-lg shadow-primary/25' : ''}
        ${isRecording ? 'border-primary/30 bg-primary/5' : ''}
      `}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className={`text-lg font-semibold flex items-center transition-colors duration-300 ${
              isRecording ? 'text-primary' : 'text-primary'
            }`}>
              <HelpCircle className="h-5 w-5 mr-2" />
              Recording Guide
              {autoShowed && showHighlight && (
                <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full animate-pulse">
                  New!
                </span>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleVisibility}
              className="h-8 w-8 p-0"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Cover these points in your recording for the best analysis results.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {guideItems.map((section) => (
            <Collapsible
              key={section.id}
              open={openSections.includes(section.id)}
              onOpenChange={() => toggleSection(section.id)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-2 h-auto font-medium text-left hover:bg-primary/5"
                >
                  <span className="text-sm">{section.title}</span>
                  {openSections.includes(section.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pl-2 animate-accordion-down">
                {section.items.map((item, index) => (
                  <div key={index} className="text-xs space-y-1">
                    <div className="font-medium text-foreground">{item.field}</div>
                    <div className="text-muted-foreground italic">{item.prompt}</div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
          
          <div className={`mt-4 p-3 rounded-lg border transition-all duration-300 ${
            isRecording 
              ? 'bg-primary/10 border-primary/20' 
              : 'bg-primary/5 border-primary/10'
          }`}>
            <div className="text-xs text-primary font-medium mb-1">💡 Pro Tip</div>
            <div className="text-xs text-muted-foreground">
              Speak naturally! You don't need to answer in order. The AI will extract and organize your information automatically.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceRecordingGuide;
