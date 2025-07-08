import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Clock, MessageCircle } from 'lucide-react';
import { useChatSearch, ChatSearchResult } from '@/hooks/useChatSearch';

interface ChatSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatSearchModal: React.FC<ChatSearchModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { searchChats, isSearching, searchResults } = useChatSearch();
  const navigate = useNavigate();

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) return;

    const timeoutId = setTimeout(() => {
      searchChats(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchChats]);

  const handleSelectChat = useCallback((result: ChatSearchResult) => {
    navigate(`/dashboard/assistant?session=${result.session_id}`);
    onClose();
    setSearchQuery('');
  }, [navigate, onClose]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      setSearchQuery('');
    }
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={handleOpenChange}>
      <CommandInput
        placeholder="Search your chats..."
        value={searchQuery}
        onValueChange={setSearchQuery}
        className="border-0 focus:ring-0 text-text-primary placeholder:text-text-tertiary"
      />
      <CommandList className="max-h-96">
        {searchQuery.trim() && !isSearching && searchResults.length === 0 && (
          <CommandEmpty className="py-6 text-center text-text-secondary">
            No chats found for "{searchQuery}"
          </CommandEmpty>
        )}
        
        {isSearching && (
          <div className="py-6 text-center text-text-secondary">
            Searching chats...
          </div>
        )}

        {searchResults.length > 0 && (
          <CommandGroup heading="Chat Sessions">
            {searchResults.map((result) => (
              <CommandItem
                key={result.session_id}
                onSelect={() => handleSelectChat(result)}
                className="flex flex-col items-start gap-2 p-4 cursor-pointer hover:bg-surface-elevated"
              >
                <div className="flex items-center gap-2 w-full">
                  <MessageCircle className="h-4 w-4 text-text-tertiary flex-shrink-0" />
                  <span className="font-medium text-text-primary truncate flex-1">
                    {result.session_title}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-text-tertiary">
                    <Clock className="h-3 w-3" />
                    {formatDate(result.session_created_at)}
                  </div>
                </div>
                {result.message_snippet !== result.session_title && (
                  <p className="text-sm text-text-secondary pl-6 truncate w-full">
                    {result.message_snippet}
                  </p>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
};