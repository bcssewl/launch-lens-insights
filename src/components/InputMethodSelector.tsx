
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Upload, FileText } from 'lucide-react';

interface InputMethodSelectorProps {
  onMethodSelect: (method: 'form' | 'voice' | 'pitch_deck') => void;
}

const InputMethodSelector: React.FC<InputMethodSelectorProps> = ({ onMethodSelect }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary mb-2">How would you like to share your idea?</h2>
        <p className="text-muted-foreground">Choose the method that works best for you</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onMethodSelect('form')}>
          <CardHeader className="text-center">
            <FileText className="h-12 w-12 mx-auto text-primary mb-2" />
            <CardTitle className="text-lg">Fill Form</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Answer guided questions about your startup idea step by step
            </p>
            <Button className="w-full" variant="outline">
              Use Form
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onMethodSelect('voice')}>
          <CardHeader className="text-center">
            <Mic className="h-12 w-12 mx-auto text-primary mb-2" />
            <CardTitle className="text-lg">Voice Recording</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Record yourself explaining your idea naturally in your own words
            </p>
            <Button className="w-full" variant="outline">
              Start Recording
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onMethodSelect('pitch_deck')}>
          <CardHeader className="text-center">
            <Upload className="h-12 w-12 mx-auto text-primary mb-2" />
            <CardTitle className="text-lg">Upload Pitch Deck</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Upload your existing presentation or business plan document
            </p>
            <Button className="w-full" variant="outline">
              Upload File
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InputMethodSelector;
