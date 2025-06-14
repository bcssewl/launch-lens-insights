
import React from 'react';
import { Button } from '@/components/ui/button';
import { FolderOpen, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BusinessIdeasEmptyStateProps {
  showArchivedOnly: boolean;
  searchTerm: string;
  filterScore: string;
  filterProgress: string;
  totalReports: number;
}

const BusinessIdeasEmptyState: React.FC<BusinessIdeasEmptyStateProps> = ({
  showArchivedOnly,
  searchTerm,
  filterScore,
  filterProgress,
  totalReports,
}) => {
  const hasFilters = searchTerm || filterScore !== 'all_scores' || filterProgress !== 'all_progress';

  return (
    <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg mt-8">
      <FolderOpen className="mx-auto h-20 w-20 text-muted-foreground" />
      <h3 className="mt-4 text-xl font-semibold text-foreground">
        {showArchivedOnly ? 'No archived ideas found' : 'No business ideas found'}
      </h3>
      {hasFilters ? (
        <p className="mt-2 text-sm text-muted-foreground">Try adjusting your search or filter criteria.</p>
      ) : totalReports === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          {showArchivedOnly 
            ? 'No archived business ideas yet.' 
            : 'Start your first idea validation to see your business dashboard here.'
          }
        </p>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">No ideas match your current filters.</p>
      )}
      {!showArchivedOnly && totalReports === 0 && (
        <Button className="mt-6" asChild>
          <Link to="/dashboard/validate">
            <PlusCircle className="mr-2 h-4 w-4" />
            Validate First Idea
          </Link>
        </Button>
      )}
    </div>
  );
};

export default BusinessIdeasEmptyState;
