
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Upload, FileText } from 'lucide-react';

interface InputMethodSelectorProps {
  onMethodSelect: (method: 'form' | 'voice' | 'pitch_deck') => void;
}

const InputMethodSelector: React.FC<InputMethodSelectorProps> = ({ onMethodSelect }) => {
  return (
    <div className="w-full max-w-none overflow-x-hidden h-full flex flex-col justify-center">
      <div className="text-center mb-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-2">How would you like to share your idea?</h2>
        <p className="text-sm text-muted-foreground">Choose the method that works best for you</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-h-[60vh]">
        <Card className="mobile-gradient-card border-0 hover:shadow-lg transition-shadow cursor-pointer w-full flex flex-col" onClick={() => onMethodSelect('form')}>
          <CardHeader className="text-center pb-2 flex-shrink-0">
            <FileText className="h-8 w-8 mx-auto text-primary mb-1" />
            <CardTitle className="text-lg font-semibold">Fill Form</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 flex-1 flex flex-col justify-between">
            <p className="text-sm text-muted-foreground text-center mb-3 flex-1">
              Answer guided questions about your startup idea step by step
            </p>
            <Button className="w-full apple-button touch-target" variant="outline">
              Use Form
            </Button>
          </CardContent>
        </Card>

        <Card className="mobile-gradient-card border-0 hover:shadow-lg transition-shadow cursor-pointer w-full flex flex-col" onClick={() => onMethodSelect('voice')}>
          <CardHeader className="text-center pb-2 flex-shrink-0">
            <Mic className="h-8 w-8 mx-auto text-primary mb-1" />
            <CardTitle className="text-lg font-semibold">Voice Recording</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 flex-1 flex flex-col justify-between">
            <p className="text-sm text-muted-foreground text-center mb-3 flex-1">
              Record yourself explaining your idea naturally in your own words
            </p>
            <Button className="w-full apple-button touch-target" variant="outline">
              Start Recording
            </Button>
          </CardContent>
        </Card>

        <Card className="mobile-gradient-card border-0 hover:shadow-lg transition-shadow cursor-pointer w-full flex flex-col" onClick={() => onMethodSelect('pitch_deck')}>
          <CardHeader className="text-center pb-2 flex-shrink-0">
            <Upload className="h-8 w-8 mx-auto text-primary mb-1" />
            <CardTitle className="text-lg font-semibold">Upload Pitch Deck</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 flex-1 flex flex-col justify-between">
            <p className="text-sm text-muted-foreground text-center mb-3 flex-1">
              Upload your existing presentation or business plan document
            </p>
            <Button className="w-full apple-button touch-target" variant="outline">
              Upload File
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InputMethodSelector;
