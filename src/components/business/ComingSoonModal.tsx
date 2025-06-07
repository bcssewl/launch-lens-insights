
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, Bell, X } from 'lucide-react';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  features: string[];
}

const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  features,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 mt-1">
                  Coming Soon
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p className="text-muted-foreground leading-relaxed">
            {description}
          </p>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Features & Capabilities:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-semibold text-foreground mb-1">Stay Updated</h5>
                <p className="text-sm text-muted-foreground">
                  We're working hard to bring you this feature. It will be automatically available 
                  in your dashboard once released. No additional setup required!
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComingSoonModal;
