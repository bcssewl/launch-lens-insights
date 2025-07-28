/**
 * @file ResearchActivitiesDisplay.tsx
 * @description Display for search queries and visited URLs from DeerFlow events
 */

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Search, 
  Globe, 
  ExternalLink, 
  ChevronDown, 
  ChevronRight,
  Clock
} from 'lucide-react';

interface SearchActivity {
  query: string;
  results?: any[];
}

interface VisitActivity {
  url: string;
  title?: string;
  content?: string;
}

interface ResearchActivitiesDisplayProps {
  searchActivities?: SearchActivity[];
  visitedUrls?: VisitActivity[];
  isStreaming?: boolean;
}

export const ResearchActivitiesDisplay: React.FC<ResearchActivitiesDisplayProps> = ({
  searchActivities = [],
  visitedUrls = [],
  isStreaming = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const totalActivities = searchActivities.length + visitedUrls.length;

  if (totalActivities === 0) {
    return null;
  }

  return (
    <div className="mb-4 border border-border rounded-lg bg-muted/30">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-3 h-auto hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Research Activities</span>
              <Badge variant="secondary" className="text-xs">
                {totalActivities} activit{totalActivities !== 1 ? 'ies' : 'y'}
              </Badge>
            </div>
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-3 pb-3">
          <div className="space-y-3">
            {/* Search Activities */}
            {searchActivities.map((search, index) => (
              <Card key={`search-${index}`} className="p-3 bg-background/50">
                <div className="flex items-start gap-3">
                  <Search className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">Search</Badge>
                      <Clock className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div className="text-sm font-medium text-foreground mb-1">
                      "{search.query}"
                    </div>
                    {search.results && search.results.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {search.results.length} result{search.results.length !== 1 ? 's' : ''} found
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {/* Visited URLs */}
            {visitedUrls.map((visit, index) => (
              <Card key={`visit-${index}`} className="p-3 bg-background/50">
                <div className="flex items-start gap-3">
                  <Globe className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">Visit</Badge>
                      <Clock className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div className="text-sm font-medium text-foreground mb-1">
                      {visit.title || 'Untitled Page'}
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={visit.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline truncate max-w-[200px]"
                      >
                        {visit.url}
                      </a>
                      <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    </div>
                    {visit.content && (
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {visit.content.substring(0, 100)}...
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {/* Streaming indicator */}
            {isStreaming && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                <span>Researching...</span>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};