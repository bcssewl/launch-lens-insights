
import React from 'react';
import { Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIAvatarProps {
  className?: string;
}

const AIAvatar: React.FC<AIAvatarProps> = ({ className }) => {
  return (
    <div
      className={cn(
        "h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center shadow-lg border-2 border-primary/20 shrink-0",
        className
      )}
    >
      <Brain className="h-5 w-5" />
    </div>
  );
};

export default AIAvatar;
