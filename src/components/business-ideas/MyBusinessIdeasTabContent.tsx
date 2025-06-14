
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import BusinessIdeasHeader from '@/components/business-ideas/BusinessIdeasHeader';
import BusinessIdeasFilters from '@/components/business-ideas/BusinessIdeasFilters';
import BusinessIdeasGrid from '@/components/business-ideas/BusinessIdeasGrid';
import BusinessIdeasEmptyState from '@/components/business-ideas/BusinessIdeasEmptyState';
import { useBusinessIdeasLogic } from '@/hooks/useBusinessIdeasLogic';

interface MyBusinessIdeasTabContentProps {
  showArchivedOnly?: boolean;
}

const MyBusinessIdeasTabContent: React.FC<MyBusinessIdeasTabContentProps> = ({ showArchivedOnly = false }) => {
  const {
    ideas,
    totalReports,
    loading,
    error,
    refreshReports,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    filterScore,
    setFilterScore,
    filterProgress,
    setFilterProgress,
  } = useBusinessIdeasLogic({ showArchivedOnly });

  if (loading) {
    return (
      <div className="space-y-6">
        <BusinessIdeasHeader showArchivedOnly={showArchivedOnly} onRefresh={refreshReports} />
        {/* Loading skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Error loading business ideas: {error}</p>
          <Button onClick={refreshReports} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BusinessIdeasHeader showArchivedOnly={showArchivedOnly} onRefresh={refreshReports} />

      <BusinessIdeasFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
        filterScore={filterScore}
        setFilterScore={setFilterScore}
        filterProgress={filterProgress}
        setFilterProgress={setFilterProgress}
      />

      {ideas.length > 0 ? (
        <BusinessIdeasGrid ideas={ideas} onIdeaUpdated={refreshReports} />
      ) : (
        <BusinessIdeasEmptyState
          showArchivedOnly={showArchivedOnly}
          searchTerm={searchTerm}
          filterScore={filterScore}
          filterProgress={filterProgress}
          totalReports={totalReports}
        />
      )}
    </div>
  );
};

export default MyBusinessIdeasTabContent;
