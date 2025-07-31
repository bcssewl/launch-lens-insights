import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageProps {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  imageTransition?: boolean;
  fallback?: string;
}

export const Image = ({ 
  src, 
  alt, 
  className, 
  imageClassName, 
  imageTransition = false,
  fallback
}: ImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  if (hasError && fallback) {
    return (
      <div className={cn("bg-muted flex items-center justify-center", className)}>
        <span className="text-muted-foreground text-sm">{fallback}</span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={cn("bg-muted flex items-center justify-center", className)}>
        <span className="text-muted-foreground text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden", className)}>
      <img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "w-full h-full object-cover",
          imageTransition && "transition-transform duration-300",
          imageClassName
        )}
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
      {!isLoaded && (
        <div className={cn("absolute inset-0 bg-muted animate-pulse", className)} />
      )}
    </div>
  );
};
