
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface FollowUpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  onSubmit: (question: string) => void;
}

const FollowUpDialog: React.FC<FollowUpDialogProps> = ({
  isOpen,
  onClose,
  selectedText,
  onSubmit
}) => {
  const [question, setQuestion] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuestion('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (question.trim()) {
      onSubmit(question.trim());
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ask a follow-up question</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Selected text preview */}
          <div className="bg-muted/50 p-3 rounded-lg border-l-4 border-primary">
            <p className="text-sm text-muted-foreground mb-1">Selected text:</p>
            <p className="text-sm italic">"{selectedText}"</p>
          </div>

          {/* Question input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Your question:</label>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to know about this text?"
              className="min-h-[100px] resize-none"
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!question.trim()}>
              <Send className="w-4 h-4 mr-2" />
              Ask Question
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FollowUpDialog;
