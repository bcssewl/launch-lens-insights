
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BusinessIdeasHeaderProps {
  showArchivedOnly: boolean;
  onRefresh: () => void;
}

const BusinessIdeasHeader: React.FC<BusinessIdeasHeaderProps> = ({ showArchivedOnly, onRefresh }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h3 className="text-lg font-medium text-foreground">
          {showArchivedOnly ? 'Archived Business Ideas' : 'Your Active Business Ideas'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {showArchivedOnly 
            ? 'View and manage your archived business concepts.' 
            : 'Track progress and manage your validated business concepts.'
          }
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
        {!showArchivedOnly && (
          <Button asChild className="w-full sm:w-auto">
            <Link to="/dashboard/validate">
              <PlusCircle className="mr-2 h-4 w-4" />
              Validate New Idea
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default BusinessIdeasHeader;
