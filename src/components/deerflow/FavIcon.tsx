import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FavIconProps {
  url: string;
  className?: string;
  size?: number;
}

export const FavIcon: React.FC<FavIconProps> = ({ 
  url, 
  className,
  size = 16 
}) => {
  const [imageError, setImageError] = useState(false);
  
  const getFaviconUrl = (websiteUrl: string) => {
    try {
      const urlObject = new URL(websiteUrl);
      return `https://www.google.com/s2/favicons?domain=${urlObject.hostname}&sz=${size}`;
    } catch {
      return null;
    }
  };

  const faviconUrl = getFaviconUrl(url);

  if (!faviconUrl || imageError) {
    return (
      <Globe 
        className={cn("text-muted-foreground", className)} 
        size={size} 
      />
    );
  }

  return (
    <img
      src={faviconUrl}
      alt="Site favicon"
      className={cn("rounded-sm", className)}
      style={{ width: size, height: size }}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
};