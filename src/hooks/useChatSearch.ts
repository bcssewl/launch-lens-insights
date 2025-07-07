
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';

export interface ChatSearchResult {
  session_id: string;
  title: string;
  snippet: string;
  created_at: string;
}

interface SearchResponse {
  results: ChatSearchResult[];
}

const useChatSearch = (query: string, enabled: boolean = true) => {
  const [searchQuery, setSearchQuery] = useState(query);
  const debouncedQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  const searchChats = async (searchTerm: string): Promise<ChatSearchResult[]> => {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return [];
    }

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.access_token) {
      throw new Error('Authentication required');
    }

    const response = await fetch('https://jtnedstugyvkfthtsumh.supabase.co/functions/v1/search-chats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        query: searchTerm,
        limit: 20,
      }),
    });

    if (!response.ok) {
      throw new Error('Search request failed');
    }

    const data: SearchResponse = await response.json();
    return data.results || [];
  };

  const queryResult = useQuery({
    queryKey: ['chat-search', debouncedQuery],
    queryFn: () => searchChats(debouncedQuery),
    enabled: enabled && debouncedQuery.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  return {
    results: queryResult.data || [],
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    isSearching: debouncedQuery.trim().length > 0,
  };
};

export { useChatSearch };
