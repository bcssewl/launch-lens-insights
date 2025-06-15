
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Upload, FileText } from 'lucide-react';

interface InputMethodSelectorProps {
  onMethodSelect: (method: 'form' | 'voice' | 'pitch_deck') => void;
}

const InputMethodSelector: React.FC<InputMethodSelectorProps> = ({ onMethodSelect }) => {
  return (
    <div className="w-full max-w-none overflow-x-hidden">
      <div className="text-center mb-6">
        <h2 className="mobile-heading text-primary mb-2">How would you like to share your idea?</h2>
        <p className="text-sm text-muted-foreground">Choose the method that works best for you</p>
      </div>
      
      <div className="flex flex-col space-y-4 w-full">
        <Card className="mobile-gradient-card border-0 hover:shadow-lg transition-shadow cursor-pointer w-full" onClick={() => onMethodSelect('form')}>
          <CardHeader className="text-center pb-3">
            <FileText className="h-10 w-10 mx-auto text-primary mb-2" />
            <CardTitle className="mobile-subheading">Fill Form</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Answer guided questions about your startup idea step by step
            </p>
            <Button className="w-full apple-button touch-target" variant="outline">
              Use Form
            </Button>
          </CardContent>
        </Card>

        <Card className="mobile-gradient-card border-0 hover:shadow-lg transition-shadow cursor-pointer w-full" onClick={() => onMethodSelect('voice')}>
          <CardHeader className="text-center pb-3">
            <Mic className="h-10 w-10 mx-auto text-primary mb-2" />
            <CardTitle className="mobile-subheading">Voice Recording</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Record yourself explaining your idea naturally in your own words
            </p>
            <Button className="w-full apple-button touch-target" variant="outline">
              Start Recording
            </Button>
          </CardContent>
        </Card>

        <Card className="mobile-gradient-card border-0 hover:shadow-lg transition-shadow cursor-pointer w-full" onClick={() => onMethodSelect('pitch_deck')}>
          <CardHeader className="text-center pb-3">
            <Upload className="h-10 w-10 mx-auto text-primary mb-2" />
            <CardTitle className="mobile-subheading">Upload Pitch Deck</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground text-center mb-4">
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
