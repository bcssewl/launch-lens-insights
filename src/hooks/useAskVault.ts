
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
  enableStreaming?: boolean;
}

export const useAskVault = ({ clientId, onResultSelect, enableStreaming = false }: UseAskVaultProps) => {
  const [results, setResults] = useState<AskVaultResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [answer, setAnswer] = useState('');
  const [streaming, setStreaming] = useState(false);
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

  const askVault = useCallback(async (searchQuery: string, useStreaming = enableStreaming) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setAnswer('');
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
    setAnswer('');

    try {
      console.log('Calling ask-vault function with:', { query: searchQuery, clientId, streaming: useStreaming });
      
      if (useStreaming) {
        setStreaming(true);
        
        // Streaming request
        const response = await fetch(`${supabase.supabaseUrl}/functions/v1/ask-vault?stream=true`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabase.supabaseKey}`,
            'Content-Type': 'application/json',
            'Accept': 'text/stream',
          },
          body: JSON.stringify({
            query: searchQuery,
            clientId
          }),
          signal: abortControllerRef.current.signal
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        let citations: AskVaultResult[] = [];
        
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6);
                if (dataStr === '[DONE]') break;
                
                try {
                  const data = JSON.parse(dataStr);
                  if (data.text) {
                    setAnswer(prev => prev + data.text);
                  }
                  if (data.citations && !citations.length) {
                    citations = data.citations;
                    setResults(citations);
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        }

        setStreaming(false);
      } else {
        // Regular request
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

        const searchResults: AskVaultResult[] = data?.citations || [];
        const aiAnswer = data?.answer || '';
        
        console.log('Ask Vault API response:', {
          query: searchQuery,
          resultCount: searchResults.length,
          answer: aiAnswer.substring(0, 100) + '...',
          cached: data?.cached
        });

        setResults(searchResults);
        setAnswer(aiAnswer);
      }
      
      setIsOpen(true);
      
      // Track analytics
      trackSearch(searchQuery, results.length);

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Request was cancelled, ignore
      }

      console.error('Ask Vault error:', error);
      
      setResults([]);
      setAnswer('');
      setIsOpen(false);
      setStreaming(false);
      
      toast({
        title: "Search Error",
        description: "Unable to search files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [clientId, trackSearch, toast, enableStreaming]);

  const searchVault = useCallback(async (searchQuery: string) => {
    return askVault(searchQuery, false);
  }, [askVault]);

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
    setAnswer('');
    setIsOpen(false);
    setStreaming(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    results,
    loading,
    streaming,
    query,
    answer,
    isOpen,
    setIsOpen,
    searchVault,
    askVault,
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
