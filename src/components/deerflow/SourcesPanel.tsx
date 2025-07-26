import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Globe, FileText, Video, Image, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Source {
  id: string;
  title: string;
  url: string;
  type: 'web' | 'pdf' | 'video' | 'image' | 'academic' | 'news';
  confidence: number;
  domain?: string;
  snippet?: string;
  dateFound?: string;
}

interface SourcesPanelProps {
  sources: Source[];
  isCollapsible?: boolean;
  maxVisible?: number;
  className?: string;
}

export const SourcesPanel: React.FC<SourcesPanelProps> = ({
  sources,
  isCollapsible = true,
  maxVisible = 5,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const displayedSources = isExpanded ? sources : sources.slice(0, maxVisible);
  const hasMore = sources.length > maxVisible;

  const getSourceIcon = (type: Source['type']) => {
    switch (type) {
      case 'pdf':
        return FileText;
      case 'video':
        return Video;
      case 'image':
        return Image;
      case 'academic':
        return FileText;
      case 'news':
        return Globe;
      default:
        return Globe;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTypeLabel = (type: Source['type']) => {
    const labels = {
      web: 'Web',
      pdf: 'PDF',
      video: 'Video',
      image: 'Image',
      academic: 'Academic',
      news: 'News'
    };
    return labels[type] || 'Web';
  };

  if (sources.length === 0) {
    return null;
  }

  return (
    <Card className={cn("border-primary/20 bg-primary/5", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Sources ({sources.length})
          </div>
          
          {isCollapsible && hasMore && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-auto p-1"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {displayedSources.map((source) => {
          const Icon = getSourceIcon(source.type);
          
          return (
            <div
              key={source.id}
              className="p-3 rounded-lg border border-primary/10 bg-background/50 hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Icon className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-medium text-sm leading-tight line-clamp-2">
                      {source.title}
                    </h4>
                    
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          getConfidenceColor(source.confidence)
                        )}
                        title={`Confidence: ${Math.round(source.confidence * 100)}%`}
                      />
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {getTypeLabel(source.type)}
                      </Badge>
                    </div>
                  </div>
                  
                  {source.domain && (
                    <p className="text-xs text-muted-foreground mb-1">
                      {source.domain}
                    </p>
                  )}
                  
                  {source.snippet && (
                    <p className="text-xs text-foreground/80 line-clamp-2 mb-2">
                      {source.snippet}
                    </p>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-auto p-0 text-xs text-primary hover:text-primary/80"
                  >
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Source
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}

        {hasMore && !isExpanded && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="w-full text-sm"
          >
            Show {sources.length - maxVisible} more sources
          </Button>
        )}
      </CardContent>
    </Card>
  );
};