
import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { useChatSearch, ChatSearchResult } from '@/hooks/useChatSearch';
import { useNavigate } from 'react-router-dom';
import { useSidebarHotkeys } from '@/hooks/useSidebarHotkeys';
import { useToast } from '@/hooks/use-toast';
import './sidebar-search.css';

interface ChatSearchProps {
  onSessionSelect?: (sessionId: string) => void;
  onClose?: () => void;
}

// Simple local search fallback when API fails
const filterResultsLocally = (results: ChatSearchResult[], query: string): ChatSearchResult[] => {
  if (!query.trim()) return results;
  
  const searchTerm = query.toLowerCase();
  return results.filter(result => 
    result.title.toLowerCase().includes(searchTerm) ||
    result.snippet.toLowerCase().includes(searchTerm)
  );
};

export const ChatSearch: React.FC<ChatSearchProps> = ({ onSessionSelect, onClose }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { results, isLoading, error, searchChats } = useChatSearch(query, isOpen);

  // Use our dedicated keyboard hook
  useSidebarHotkeys({ inputRef, setIsOpen });

  // Local fallback when API fails
  const displayResults = error ? filterResultsLocally(results, query) : results;

  // Show error toast once when API fails
  useEffect(() => {
    if (error) {
      toast({
        title: 'Search temporarily unavailable',
        description: 'Falling back to local search - results may be limited.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length > 0);
  };

  const handleInputFocus = () => {
    if (query.length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    // Delay closing to allow for click events on results
    setTimeout(() => setIsOpen(false), 150);
  };

  const handleSessionSelect = (result: ChatSearchResult) => {
    const sessionId = result.session_id;
    navigate(`/dashboard/assistant?session=${sessionId}`);
    
    if (onSessionSelect) {
      onSessionSelect(sessionId);
    }
    
    handleClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
    inputRef.current?.blur();
    
    if (onClose) {
      onClose();
    }
  };

  const formatSnippet = (snippet: string) => {
    // The snippet comes pre-highlighted from ts_headline
    return { __html: snippet };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="sidebar-search relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-tertiary" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search chats... (⌘K)"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="pl-10 pr-10 sidebar-search__input"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-text-tertiary" />
        )}
      </div>

      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-surface-elevated border border-border-subtle rounded-md shadow-lg max-h-96 overflow-hidden">
          <Command className="sidebar-search__results">
            <CommandList>
              {isLoading ? (
                <div className="p-4 text-center text-text-secondary">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                  Searching...
                </div>
              ) : displayResults.length > 0 ? (
                <CommandGroup>
                  {displayResults.map((result) => (
                    <CommandItem
                      key={result.session_id}
                      value={result.session_id}
                      onSelect={() => handleSessionSelect(result)}
                      className="sidebar-search__result cursor-pointer p-3 hover:bg-surface-elevated-2"
                    >
                      <div className="flex flex-col space-y-1 w-full">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-text-primary truncate">
                            {result.title}
                          </span>
                          <span className="text-xs text-text-tertiary flex-shrink-0 ml-2">
                            {formatDate(result.created_at)}
                          </span>
                        </div>
                        <div 
                          className="text-sm text-text-secondary line-clamp-2"
                          dangerouslySetInnerHTML={formatSnippet(result.snippet)}
                        />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : (
                <CommandEmpty className="sidebar-search__empty p-4 text-center text-text-secondary">
                  No chats found for "{query}"
                  {error && (
                    <div className="text-xs text-text-tertiary mt-1">
                      (Local search only)
                    </div>
                  )}
                </CommandEmpty>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
};
