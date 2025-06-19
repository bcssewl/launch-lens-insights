
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TutorialVideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TutorialVideoDialog: React.FC<TutorialVideoDialogProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-semibold">
            How to Use the Business Idea Validator
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 pt-4">
          <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
            <iframe
              src="https://www.loom.com/embed/c638d83179fc41b5b70ebb08a64142fb?sid=1f4583e2-2bc7-4af8-b1dd-ddfda77716ae"
              frameBorder="0"
              webkitAllowFullScreen
              mozAllowFullScreen
              allowFullScreen
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: '8px'
              }}
              title="Business Idea Validator Tutorial"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TutorialVideoDialog;
