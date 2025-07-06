
import React from 'react';
import { Button } from '@/components/ui/button';
import { Grid3X3, List, LayoutGrid } from 'lucide-react';

export type ViewMode = 'list' | 'grid';

interface FileViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const FileViewToggle: React.FC<FileViewToggleProps> = ({
  viewMode,
  onViewModeChange
}) => {
  return (
    <div className="flex items-center border rounded-lg p-1">
      <Button
        variant={viewMode === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('list')}
        className="flex items-center gap-1"
      >
        <List className="h-4 w-4" />
        <span className="hidden sm:inline">List</span>
      </Button>
      <Button
        variant={viewMode === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('grid')}
        className="flex items-center gap-1"
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline">Grid</span>
      </Button>
    </div>
  );
};

export default FileViewToggle;
