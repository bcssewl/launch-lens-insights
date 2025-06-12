
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
        "h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center animate-pulse-glow shrink-0",
        className
      )}
    >
      <Brain className="h-6 w-6" />
    </div>
  );
};

export default AIAvatar;
