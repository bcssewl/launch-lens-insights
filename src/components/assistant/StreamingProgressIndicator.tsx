import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface StreamingProgressIndicatorProps {
  isVisible: boolean;
  message?: string;
  className?: string;
}

const StreamingProgressIndicator: React.FC<StreamingProgressIndicatorProps> = ({
  isVisible,
  message = "Connecting to research specialists...",
  className
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className={cn(
      "flex items-center gap-2 text-sm text-muted-foreground animate-pulse",
      className
    )}>
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>{message}</span>
    </div>
  );
};

export default StreamingProgressIndicator;
