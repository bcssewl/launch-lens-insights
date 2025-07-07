import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ChatSearchResult {
  session_id: string;
  session_title: string;
  session_created_at: string;
  message_snippet: string;
  rank: number;
}

export interface ChatSearchResponse {
  results: ChatSearchResult[];
  query: string;
}

export const useChatSearch = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ChatSearchResult[]>([]);
  const { toast } = useToast();

  const searchChats = useCallback(async (query: string, limit = 10): Promise<ChatSearchResult[]> => {
    if (!query.trim()) {
      setSearchResults([]);
      return [];
    }

    setIsSearching(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('search-chats', {
        body: { query: query.trim(), limit }
      });

      if (error) {
        console.error('Search error:', error);
        toast({
          title: "Search Error",
          description: "Failed to search chats. Please try again.",
          variant: "destructive",
        });
        return [];
      }

      const results = data?.results || [];
      setSearchResults(results);
      return results;

    } catch (error) {
      console.error('Unexpected search error:', error);
      toast({
        title: "Search Error", 
        description: "An unexpected error occurred while searching.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsSearching(false);
    }
  }, [toast]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
  }, []);

  return {
    searchChats,
    clearSearch,
    isSearching,
    searchResults,
  };
};