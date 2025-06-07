
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ProjectFiltersProps {
  activeFilters: string[];
  onRemoveFilter: (filter: string) => void;
  onClearAll: () => void;
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({ 
  activeFilters, 
  onRemoveFilter, 
  onClearAll 
}) => {
  if (activeFilters.length === 0) return null;

  return (
    <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
      <span className="text-sm font-medium text-foreground">Active filters:</span>
      <div className="flex items-center gap-2 flex-wrap">
        {activeFilters.map(filter => (
          <Badge key={filter} variant="secondary" className="gap-1">
            {filter}
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 w-3 h-3"
              onClick={() => onRemoveFilter(filter)}
            >
              <X className="h-2 w-2" />
            </Button>
          </Badge>
        ))}
        <Button variant="ghost" size="sm" onClick={onClearAll}>
          Clear all
        </Button>
      </div>
    </div>
  );
};

export default ProjectFilters;
