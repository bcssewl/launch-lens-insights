
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';
import { FileFilters as FileFiltersType } from '@/hooks/useClientFiles';

interface FileFiltersProps {
  filters: FileFiltersType;
  onFiltersChange: (filters: FileFiltersType) => void;
  onClearFilters: () => void;
}

const FileFilters: React.FC<FileFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  const hasActiveFilters = filters.search || filters.fileType !== 'all' || filters.category !== 'all';

  return (
    <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filters:</span>
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search files..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-9"
        />
      </div>

      {/* File Type Filter */}
      <Select
        value={filters.fileType}
        onValueChange={(value) => onFiltersChange({ ...filters, fileType: value })}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="File type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="PDF">PDFs</SelectItem>
          <SelectItem value="Presentation">Presentations</SelectItem>
          <SelectItem value="Image">Images</SelectItem>
          <SelectItem value="Document">Documents</SelectItem>
        </SelectContent>
      </Select>

      {/* Category Filter */}
      <Select
        value={filters.category}
        onValueChange={(value) => onFiltersChange({ ...filters, category: value })}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="Financial Documents">Financial Documents</SelectItem>
          <SelectItem value="Presentations">Presentations</SelectItem>
          <SelectItem value="Research Documents">Research Documents</SelectItem>
          <SelectItem value="Brand Assets">Brand Assets</SelectItem>
          <SelectItem value="Charts & Graphs">Charts & Graphs</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={onClearFilters}>
          <X className="h-3 w-3 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
};

export default FileFilters;
