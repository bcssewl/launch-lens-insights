
import React, { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Sparkles, FileText, Image, Presentation, File } from 'lucide-react';
import PopoverResults, { PopoverResultItem } from '@/components/ui/PopoverResults';
import { useAskVault, AskVaultResult } from '@/hooks/useAskVault';
import { cn } from '@/lib/utils';

interface AskVaultSearchBarProps {
  clientId: string;
  onResultSelect: (result: AskVaultResult) => void;
  onClearFilters?: () => void;
  className?: string;
}

const AskVaultSearchBar: React.FC<AskVaultSearchBarProps> = ({
  clientId,
  onResultSelect,
  onClearFilters,
  className
}) => {
  const [inputValue, setInputValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');
  
  const {
    results,
    loading,
    isOpen,
    setIsOpen,
    searchVault,
    handleResultSelect: hookHandleResultSelect,
    clearSearch
  } = useAskVault({
    clientId,
    onResultSelect: (result) => {
      // If result might not be visible in current filters, clear them first
      if (onClearFilters) {
        onClearFilters();
      }
      onResultSelect(result);
    }
  });

  // Debounce search input (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 500);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Trigger search when debounced value changes
  useEffect(() => {
    if (debouncedValue) {
      searchVault(debouncedValue);
    } else {
      clearSearch();
    }
  }, [debouncedValue, searchVault, clearSearch]);

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) 
      return <Presentation className="h-4 w-4 text-orange-500" />;
    if (fileType.includes('image')) return <Image className="h-4 w-4 text-green-500" />;
    return <File className="h-4 w-4 text-blue-500" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  // Convert AskVaultResult to PopoverResultItem
  const popoverResults: PopoverResultItem[] = results.map(result => ({
    id: result.id,
    title: result.title,
    snippet: result.snippet,
    icon: getFileIcon(result.fileType),
    metadata: `${formatFileSize(result.fileSize)} • ${formatDate(result.uploadDate)}`,
    matchedFragment: result.matchedFragment
  }));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setInputValue('');
      clearSearch();
      setIsOpen(false);
    }
  };

  const handleResultClick = useCallback((result: PopoverResultItem) => {
    const originalResult = results.find(r => r.id === result.id);
    if (originalResult) {
      hookHandleResultSelect(originalResult);
    }
  }, [results, hookHandleResultSelect]);

  return (
    <div className={cn("relative w-full max-w-2xl", className)}>
      <PopoverResults
        open={isOpen && (inputValue.length >= 2)}
        onOpenChange={setIsOpen}
        results={popoverResults}
        loading={loading}
        onSelectResult={handleResultClick}
        emptyMessage="No files match your search"
        searchQuery={inputValue}
        trigger={
          <div className="relative">
            {/* Visually hidden label for screen readers */}
            <span className="sr-only">AI search for vault files</span>
            
            <div className="relative">
              <Sparkles className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask Vault… (e.g., Show Tesla pricing deck)"
                className={cn(
                  "pl-10 pr-4 h-11 text-sm",
                  "bg-gradient-to-r from-background to-muted/20",
                  "border-2 border-transparent",
                  "focus:border-gradient-to-r focus:from-primary/20 focus:to-primary/10",
                  "focus:ring-2 focus:ring-primary/20",
                  "transition-all duration-200"
                )}
                aria-label="Search vault files with AI"
                aria-describedby="search-help"
                role="combobox"
                aria-expanded={isOpen && (inputValue.length >= 2)}
                aria-haspopup="listbox"
              />
              
              {/* Subtle AI indicator */}
              <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/5 to-secondary/5 pointer-events-none opacity-50" />
            </div>
            
            {/* Hidden help text for screen readers */}
            <div id="search-help" className="sr-only">
              Type at least 2 characters to search your vault files with AI. Use arrow keys to navigate results and Enter to select.
            </div>
          </div>
        }
      />
    </div>
  );
};

export default AskVaultSearchBar;
