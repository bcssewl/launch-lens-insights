
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Lightbulb } from 'lucide-react';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  description: string;
  estimatedRelease?: string;
}

const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  isOpen,
  onClose,
  featureName,
  description,
  estimatedRelease
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">{featureName}</DialogTitle>
              <Badge variant="secondary" className="mt-1">
                <Clock className="w-3 h-3 mr-1" />
                Coming Soon
              </Badge>
            </div>
          </div>
        </DialogHeader>
        <DialogDescription className="text-sm text-muted-foreground leading-relaxed mb-4">
          {description}
        </DialogDescription>
        {estimatedRelease && (
          <div className="bg-muted/50 rounded-lg p-3 mb-4">
            <p className="text-xs text-muted-foreground">
              <strong>Estimated Release:</strong> {estimatedRelease}
            </p>
          </div>
        )}
        <div className="flex gap-2">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Got it
          </Button>
          <Button onClick={onClose} className="flex-1">
            Notify me when ready
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComingSoonModal;
