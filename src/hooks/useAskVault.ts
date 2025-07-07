
import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface AskVaultResult {
  id: string;
  title: string;
  snippet: string;
  source: 'content' | 'title' | 'metadata';
  fileType: string;
  relevanceScore: number;
  filePath: string;
  matchedFragment?: string;
  fileSize?: number;
  uploadDate?: string;
}

interface UseAskVaultProps {
  clientId: string;
  onResultSelect?: (result: AskVaultResult) => void;
}

export const useAskVault = ({ clientId, onResultSelect }: UseAskVaultProps) => {
  const [results, setResults] = useState<AskVaultResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Analytics tracking stub
  const trackSearch = useCallback((searchQuery: string, resultCount: number) => {
    // Push to dataLayer for Google Analytics/Segment integration
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'vault_search',
        query: searchQuery,
        resultCount,
        clientId
      });
    }
    
    console.log('Analytics Event:', {
      event: 'vault_search',
      query: searchQuery,
      resultCount,
      clientId
    });
  }, [clientId]);

  const searchVault = useCallback(async (searchQuery: string) => {
    // Minimum 2-character guard
    if (searchQuery.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setQuery(searchQuery);

    try {
      console.log('Calling ask-vault function with:', { query: searchQuery, clientId });
      
      // Call the enhanced ask-vault edge function
      const { data, error } = await supabase.functions.invoke('ask-vault', {
        body: {
          query: searchQuery,
          clientId
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      const searchResults: AskVaultResult[] = data?.results || [];
      
      console.log('Ask Vault API response:', {
        query: searchQuery,
        enhancedQuery: data?.enhancedQuery,
        resultCount: searchResults.length,
        results: searchResults
      });

      setResults(searchResults);
      setIsOpen(searchResults.length > 0);
      
      // Track analytics
      trackSearch(searchQuery, searchResults.length);

      // Show enhanced query info if available
      if (data?.enhancedQuery && data.enhancedQuery !== searchQuery) {
        console.log(`Query enhanced: "${searchQuery}" → "${data.enhancedQuery}"`);
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Request was cancelled, ignore
      }

      console.error('Ask Vault search error:', error);
      
      setResults([]);
      setIsOpen(false);
      
      toast({
        title: "Search Error",
        description: "Unable to search files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [clientId, trackSearch, toast]);

  const handleResultSelect = useCallback((result: AskVaultResult) => {
    setIsOpen(false);
    setQuery('');
    
    // Track result selection
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'vault_search_result_click',
        fileId: result.id,
        fileName: result.title,
        source: result.source,
        relevanceScore: result.relevanceScore,
        clientId
      });
    }
    
    console.log('File selected:', {
      fileId: result.id,
      fileName: result.title,
      relevanceScore: result.relevanceScore
    });
    
    if (onResultSelect) {
      onResultSelect(result);
    }
  }, [clientId, onResultSelect]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    results,
    loading,
    query,
    isOpen,
    setIsOpen,
    searchVault,
    handleResultSelect,
    clearSearch
  };
};

// Extend window interface for TypeScript
declare global {
  interface Window {
    dataLayer?: Array<Record<string, any>>;
  }
}
