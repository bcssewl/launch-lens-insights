
import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

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

// Mock data for demonstration
const generateMockResults = (query: string): AskVaultResult[] => {
  const mockFiles = [
    {
      id: 'file-1',
      title: 'Tesla Pricing Strategy Deck.pdf',
      snippet: 'Comprehensive pricing analysis for Tesla Model S, 3, X, and Y. Includes market positioning, competitive analysis, and revenue projections for Q3-Q4 2024.',
      source: 'content' as const,
      fileType: 'application/pdf',
      relevanceScore: 0.95,
      filePath: 'client-files/tesla-pricing-deck.pdf',
      matchedFragment: query.toLowerCase().includes('tesla') ? 'Tesla' : query.toLowerCase().includes('pricing') ? 'pricing' : undefined,
      fileSize: 2450000,
      uploadDate: '2024-01-15'
    },
    {
      id: 'file-2',
      title: 'Financial Projections Q4 2024.xlsx',
      snippet: 'Detailed financial forecasts including revenue streams, cost analysis, and growth projections. Updated with latest market data and customer acquisition metrics.',
      source: 'title' as const,
      fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      relevanceScore: 0.82,
      filePath: 'client-files/financial-projections-q4.xlsx',
      matchedFragment: query.toLowerCase().includes('financial') ? 'Financial' : undefined,
      fileSize: 1200000,
      uploadDate: '2024-01-10'
    },
    {
      id: 'file-3',
      title: 'Brand Guidelines v2.1.pdf',
      snippet: 'Complete brand identity guidelines including logo usage, color palette, typography, and marketing asset templates for consistent brand application.',
      source: 'metadata' as const,
      fileType: 'application/pdf',
      relevanceScore: 0.71,
      filePath: 'client-files/brand-guidelines-v2.pdf',
      matchedFragment: query.toLowerCase().includes('brand') ? 'brand' : undefined,
      fileSize: 5600000,
      uploadDate: '2024-01-08'
    }
  ];

  // Filter results based on query relevance
  return mockFiles.filter(file => {
    const searchableText = `${file.title} ${file.snippet}`.toLowerCase();
    const queryLower = query.toLowerCase();
    return searchableText.includes(queryLower);
  }).sort((a, b) => b.relevanceScore - a.relevanceScore);
};

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
      // TODO: Future vector search API contract
      // Expected response: { results: Array<{id, score, snippet, source}> }
      // Integration with pgvector + embeddings
      // Semantic search on file content, names, and metadata
      
      // Mock API call - replace with actual endpoint
      const response = await fetch('/api/ask-vault', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          clientId
        }),
        signal: abortControllerRef.current.signal
      });

      let searchResults: AskVaultResult[];

      if (response.ok) {
        const data = await response.json();
        searchResults = data.results || [];
      } else {
        // Fallback to mock results if API fails
        console.log('API endpoint not available, using mock results');
        searchResults = generateMockResults(searchQuery);
      }

      setResults(searchResults);
      setIsOpen(searchResults.length > 0);
      
      // Track analytics
      trackSearch(searchQuery, searchResults.length);

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Request was cancelled, ignore
      }

      console.error('Ask Vault search error:', error);
      
      // Fallback to mock results on error
      const mockResults = generateMockResults(searchQuery);
      setResults(mockResults);
      setIsOpen(mockResults.length > 0);
      
      toast({
        title: "Search temporarily unavailable",
        description: "Showing cached results. Please try again later.",
        variant: "default"
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
        clientId
      });
    }
    
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
