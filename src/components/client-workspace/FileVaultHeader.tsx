
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';
import { Search, List, LayoutGrid, X, Filter, Upload } from 'lucide-react';
import { FileFilters, ViewMode } from '@/hooks/useClientFiles';
import FileUploadModal from './FileUploadModal';
import AskVaultSearchBar from './AskVaultSearchBar';
import { AskVaultResult } from '@/hooks/useAskVault';

interface FileVaultHeaderProps {
  filters: FileFilters;
  onFiltersChange: (filters: FileFilters) => void;
  onClearFilters: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  fileCount: number;
  totalFiles: number;
  clientId: string;
  onUploadComplete?: () => void;
  onPreviewFile?: (file: any) => void;
}

const FileVaultHeader: React.FC<FileVaultHeaderProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  viewMode,
  onViewModeChange,
  fileCount,
  totalFiles,
  clientId,
  onUploadComplete,
  onPreviewFile
}) => {
  const [searchValue, setSearchValue] = useState(filters.search);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({ ...filters, search: searchValue });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Initialize search value when filters change externally
  useEffect(() => {
    setSearchValue(filters.search);
  }, [filters.search]);

  // Save view mode to localStorage
  useEffect(() => {
    localStorage.setItem('fileVaultViewMode', viewMode);
  }, [viewMode]);

  const hasActiveFilters = filters.search || filters.fileType !== 'all' || filters.category !== 'all';

  const handleViewModeChange = (value: string) => {
    if (value === 'list' || value === 'grid') {
      onViewModeChange(value);
    }
  };

  const handleUploadComplete = () => {
    setUploadModalOpen(false);
    if (onUploadComplete) {
      onUploadComplete();
    }
  };

  const handleAskVaultResult = (result: AskVaultResult) => {
    // Create a mock file object that matches the expected interface
    const mockFile = {
      id: result.id,
      file_name: result.title,
      file_path: result.filePath,
      file_type: result.fileType,
      file_size: result.fileSize || 0,
      upload_date: result.uploadDate || new Date().toISOString(),
      category: 'AI Search Result',
      current_version: 1,
      version_count: 1,
      has_versions: false
    };
    
    if (onPreviewFile) {
      onPreviewFile(mockFile);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Main Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">File Vault</h2>
            <p className="text-muted-foreground">
              {fileCount === totalFiles 
                ? `${totalFiles} files stored` 
                : `${fileCount} of ${totalFiles} files`}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Upload Files Button */}
            <Button onClick={() => setUploadModalOpen(true)} className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Files
            </Button>
            
            {/* View Toggle */}
            <ToggleGroup 
              type="single" 
              value={viewMode} 
              onValueChange={handleViewModeChange}
              className="border rounded-lg p-1"
            >
              <ToggleGroupItem value="list" aria-label="List view" className="flex items-center gap-1">
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="grid" aria-label="Grid view" className="flex items-center gap-1">
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Grid</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Ask Vault Global AI Search */}
        <div className="flex flex-col gap-4">
          <AskVaultSearchBar
            clientId={clientId}
            onResultSelect={handleAskVaultResult}
            onClearFilters={onClearFilters}
            className="w-full"
          />

          {/* Mobile: Collapsible Filter Toggle */}
          <div className="flex items-center justify-between lg:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">!</span>}
            </Button>
          </div>
        </div>

        {/* Search and Filters - Collapsible on mobile */}
        <div className={`lg:block ${filtersExpanded ? 'block' : 'hidden'}`}>
          <div className="flex flex-col lg:flex-row gap-3 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 min-w-0">
              <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm font-medium whitespace-nowrap">Traditional Filters:</span>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files…"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-9 min-h-[48px] lg:min-h-[40px]"
              />
            </div>

            {/* Type Filter */}
            <Select
              value={filters.fileType}
              onValueChange={(value) => onFiltersChange({ ...filters, fileType: value })}
            >
              <SelectTrigger className="w-full sm:w-40 min-h-[48px] lg:min-h-[40px]">
                <SelectValue placeholder="File type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="PDF">PDF</SelectItem>
                <SelectItem value="Presentation">PPTX</SelectItem>
                <SelectItem value="Document">DOC</SelectItem>
                <SelectItem value="Image">Image</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select
              value={filters.category}
              onValueChange={(value) => onFiltersChange({ ...filters, category: value })}
            >
              <SelectTrigger className="w-full sm:w-48 min-h-[48px] lg:min-h-[40px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Research">Research</SelectItem>
                <SelectItem value="Financials">Financials</SelectItem>
                <SelectItem value="Legal">Legal</SelectItem>
                <SelectItem value="Financial Documents">Financial Documents</SelectItem>
                <SelectItem value="Presentations">Presentations</SelectItem>
                <SelectItem value="Research Documents">Research Documents</SelectItem>
                <SelectItem value="Brand Assets">Brand Assets</SelectItem>
                <SelectItem value="Charts & Graphs">Charts & Graphs</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onClearFilters} 
                className="flex items-center gap-1 min-h-[48px] lg:min-h-[40px]"
              >
                <X className="h-3 w-3" />
                <span className="hidden sm:inline">Clear</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <FileUploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        clientId={clientId}
        onUploadComplete={handleUploadComplete}
      />
    </>
  );
};

export default FileVaultHeader;
