import { cn } from '@/lib/utils';

interface LoadingAnimationProps {
  className?: string;
}

export const LoadingAnimation = ({ className }: LoadingAnimationProps) => (
  <div className={cn("flex items-center justify-center py-8", className)}>
    <div className="flex space-x-2">
      <div 
        className="w-2 h-2 bg-primary rounded-full animate-bounce" 
        style={{ animationDelay: '0ms', animationDuration: '1.4s' }} 
      />
      <div 
        className="w-2 h-2 bg-primary rounded-full animate-bounce" 
        style={{ animationDelay: '0.2s', animationDuration: '1.4s' }} 
      />
      <div 
        className="w-2 h-2 bg-primary rounded-full animate-bounce" 
        style={{ animationDelay: '0.4s', animationDuration: '1.4s' }} 
      />
    </div>
  </div>
);
