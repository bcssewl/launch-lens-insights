
import React from 'react';
import { ExternalLink, FileText, Globe, Book } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Citation {
  name: string;
  url: string;
  type?: string;
}

interface CitationsListProps {
  citations: Citation[];
  className?: string;
}

const CitationsList: React.FC<CitationsListProps> = ({ citations, className }) => {
  if (!citations || citations.length === 0) {
    return null;
  }

  const getSourceIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'pdf':
      case 'document':
        return FileText;
      case 'web':
      case 'website':
        return Globe;
      case 'article':
      case 'research':
        return Book;
      default:
        return ExternalLink;
    }
  };

  const formatUrl = (url: string): string => {
    if (!url) return '';
    
    // Ensure URL has protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(formatUrl(url));
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className={cn("mt-3 pt-3 border-t border-border/30", className)}>
      <div className="flex items-center gap-2 mb-2">
        <Globe className="w-3 h-3 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          Sources ({citations.length})
        </span>
      </div>
      
      <div className="space-y-2">
        {citations.map((citation, index) => {
          const IconComponent = getSourceIcon(citation.type);
          const formattedUrl = formatUrl(citation.url);
          const hasValidUrl = citation.url && isValidUrl(citation.url);
          
          return (
            <div
              key={index}
              className="flex items-start gap-2 text-xs"
            >
              <span className="flex-shrink-0 w-4 h-4 bg-primary/10 rounded-full flex items-center justify-center text-[10px] font-medium text-primary mt-0.5">
                {index + 1}
              </span>
              
              <div className="flex-1 min-w-0">
                {hasValidUrl ? (
                  <a
                    href={formattedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-1 text-primary hover:text-primary/80 transition-colors"
                  >
                    <span className="break-words line-clamp-2 leading-relaxed">
                      {citation.name || new URL(formattedUrl).hostname.replace('www.', '')}
                    </span>
                    <IconComponent className="w-3 h-3 flex-shrink-0 mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </a>
                ) : (
                  <span className="text-muted-foreground break-words line-clamp-2 leading-relaxed">
                    {citation.name || 'Unknown Source'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CitationsList;
