import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface FavIconProps {
  url: string;
  title?: string;
  className?: string;
}

export const FavIcon = ({ url, title, className }: FavIconProps) => {
  const domain = useMemo(() => {
    try {
      return new URL(url).hostname;
    } catch {
      return '';
    }
  }, [url]);

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;

  return (
    <img
      src={faviconUrl}
      alt={title || domain}
      className={cn("w-4 h-4 flex-shrink-0", className)}
      onError={(e) => {
        // Fallback to a generic icon
        (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' viewBox='0 0 16 16'%3E%3Cpath d='M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z'/%3E%3C/svg%3E";
      }}
    />
  );
};
