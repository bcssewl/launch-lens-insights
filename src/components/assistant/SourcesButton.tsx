
import React from 'react';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Citation {
  name: string;
  url: string;
  type?: string;
}

interface SourcesButtonProps {
  citations: Citation[];
  onClick: () => void;
  className?: string;
}

const SourcesButton: React.FC<SourcesButtonProps> = ({
  citations,
  onClick,
  className
}) => {
  console.log('🔘 SourcesButton: Rendering button', {
    citationsCount: citations.length,
    hasOnClick: !!onClick
  });

  if (!citations || citations.length === 0) {
    console.log('🔘 SourcesButton: No citations, not rendering');
    return null;
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 mt-2",
        "text-xs font-medium text-muted-foreground hover:text-foreground",
        "bg-muted/30 hover:bg-muted/50 rounded-md border border-border/50",
        "transition-colors duration-200",
        "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1",
        className
      )}
    >
      <ExternalLink className="w-3 h-3" />
      <span>Sources ({citations.length})</span>
    </button>
  );
};

export default SourcesButton;
