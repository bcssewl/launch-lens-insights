
import React from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink } from 'lucide-react';

export interface PopoverResultItem {
  id: string;
  title: string;
  snippet: string;
  icon?: React.ReactNode;
  metadata?: string;
  matchedFragment?: string;
}

interface PopoverResultsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
  results: PopoverResultItem[];
  loading: boolean;
  onSelectResult: (result: PopoverResultItem) => void;
  emptyMessage?: string;
  maxResults?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
  searchQuery?: string;
}

const PopoverResults: React.FC<PopoverResultsProps> = ({
  open,
  onOpenChange,
  trigger,
  results,
  loading,
  onSelectResult,
  emptyMessage = 'No results found',
  maxResults = 5,
  showViewAll = false,
  onViewAll,
  searchQuery = ''
}) => {
  const displayedResults = results.slice(0, maxResults);
  const hasMoreResults = results.length > maxResults;

  const highlightMatch = (text: string, fragment?: string) => {
    if (!fragment || !text) return text;
    
    const regex = new RegExp(`(${fragment})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent 
        className="w-96 p-0" 
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <Command shouldFilter={false}>
          <CommandList className="max-h-80">
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Searching...</span>
              </div>
            ) : (
              <>
                <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                  {searchQuery && (
                    <div className="mt-2 text-xs">
                      Try a different search term or check your spelling.
                    </div>
                  )}
                </CommandEmpty>
                
                {displayedResults.length > 0 && (
                  <CommandGroup>
                    {displayedResults.map((result) => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => onSelectResult(result)}
                        className="flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/50"
                      >
                        {result.icon && (
                          <div className="flex-shrink-0 mt-0.5">
                            {result.icon}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {highlightMatch(result.title, result.matchedFragment)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {highlightMatch(result.snippet, result.matchedFragment)}
                          </div>
                          {result.metadata && (
                            <div className="text-xs text-muted-foreground/60 mt-1">
                              {result.metadata}
                            </div>
                          )}
                        </div>
                        <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-1" />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                
                {(hasMoreResults || showViewAll) && onViewAll && (
                  <div className="border-t p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onViewAll}
                      className="w-full text-xs"
                    >
                      View all results
                      {hasMoreResults && ` (${results.length - maxResults} more)`}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default PopoverResults;
