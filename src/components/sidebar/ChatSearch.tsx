
import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { useChatSearch, ChatSearchResult } from '@/hooks/useChatSearch';
import { useNavigate } from 'react-router-dom';

interface ChatSearchProps {
  onSessionSelect?: (sessionId: string) => void;
  onClose?: () => void;
}

export const ChatSearch: React.FC<ChatSearchProps> = ({ onSessionSelect, onClose }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { results, isLoading, isSearching } = useChatSearch(query, isOpen);

  // Keyboard shortcut to focus search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle arrow key navigation and enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !isSearching) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleSessionSelect(results[selectedIndex]);
          }
          break;
        case 'Escape':
          handleClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSearching, results, selectedIndex]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
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
    setSelectedIndex(-1);
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

      {isOpen && isSearching && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-surface-elevated border border-border-subtle rounded-md shadow-lg max-h-96 overflow-hidden">
          <Command className="sidebar-search__results">
            <CommandList>
              {isLoading ? (
                <div className="p-4 text-center text-text-secondary">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                  Searching...
                </div>
              ) : results.length > 0 ? (
                <CommandGroup>
                  {results.map((result, index) => (
                    <CommandItem
                      key={result.session_id}
                      value={result.session_id}
                      onSelect={() => handleSessionSelect(result)}
                      className={`sidebar-search__result cursor-pointer p-3 ${
                        index === selectedIndex ? 'bg-surface-elevated-2' : 'hover:bg-surface-elevated-2'
                      }`}
                      role="option"
                      aria-selected={index === selectedIndex}
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
                </CommandEmpty>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
};
