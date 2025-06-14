import React, { useState } from 'react';
import BusinessIdeaCard, { BusinessIdea } from '@/components/business-ideas/BusinessIdeaCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, FolderOpen, Search as SearchIcon, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useValidationReports } from '@/hooks/useValidationReports';
import { format } from 'date-fns';

interface MyBusinessIdeasTabContentProps {
  showArchivedOnly?: boolean;
}

const MyBusinessIdeasTabContent: React.FC<MyBusinessIdeasTabContentProps> = ({ showArchivedOnly = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterScore, setFilterScore] = useState('all_scores');
  const [filterProgress, setFilterProgress] = useState('all_progress');
  
  const { reports, loading, error, refreshReports } = useValidationReports();

  // Transform validation reports to match BusinessIdeaCard interface
  const transformedBusinessIdeas: BusinessIdea[] = reports.map(report => {
    // Calculate completion progress (only validation report is complete for now)
    const completedSections = 1; // Only validation report
    const totalSections = 5; // Validation, Business Plan, Marketing, Financial, Action Items
    const completionPercentage = (completedSections / totalSections) * 100;

    return {
      id: report.id,
      ideaName: report.idea_name || 'Untitled Idea',
      oneLineDescription: report.one_line_description || 'No description available',
      validationScore: report.overall_score || 0,
      dateValidated: report.completed_at 
        ? format(new Date(report.completed_at), 'MMM d, yyyy')
        : format(new Date(report.created_at), 'MMM d, yyyy'),
      completionPercentage,
      completedSections,
      totalSections,
      isArchived: report.status === 'archived',
      status: report.status,
    };
  });

  // Filter based on archived state
  const filteredByArchiveState = transformedBusinessIdeas.filter(idea => 
    showArchivedOnly ? idea.isArchived : !idea.isArchived
  );

  // Apply other filters and search
  const filteredIdeas = filteredByArchiveState.filter(idea => {
    const matchesSearch = idea.ideaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.oneLineDescription.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesScoreFilter = filterScore === 'all_scores' || 
      (filterScore === 'high' && idea.validationScore >= 7) ||
      (filterScore === 'medium' && idea.validationScore >= 4 && idea.validationScore < 7) ||
      (filterScore === 'low' && idea.validationScore < 4);
    
    const matchesProgressFilter = filterProgress === 'all_progress' ||
      (filterProgress === 'high' && idea.completionPercentage >= 60) ||
      (filterProgress === 'medium' && idea.completionPercentage >= 30 && idea.completionPercentage < 60) ||
      (filterProgress === 'low' && idea.completionPercentage < 30);
    
    return matchesSearch && matchesScoreFilter && matchesProgressFilter;
  });

  // Apply sorting
  const sortedIdeas = [...filteredIdeas].sort((a, b) => {
    switch (sortBy) {
      case 'highest_score':
        return b.validationScore - a.validationScore;
      case 'lowest_score':
        return a.validationScore - b.validationScore;
      case 'most_complete':
        return b.completionPercentage - a.completionPercentage;
      case 'a-z':
        return a.ideaName.localeCompare(b.ideaName);
      case 'recent':
      default:
        return new Date(b.dateValidated).getTime() - new Date(a.dateValidated).getTime();
    }
  });

  if (loading) {
    return (
      <div className="space-y-6">
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
          {!showArchivedOnly && (
            <Button asChild className="w-full sm:w-auto">
              <Link to="/dashboard/validate">
                <PlusCircle className="mr-2 h-4 w-4" />
                Validate New Idea
              </Link>
            </Button>
          )}
        </div>

        {/* Loading skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
          <Button onClick={refreshReports} variant="outline" size="sm">
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

      {/* Filter and Search Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div className="relative md:col-span-2 lg:col-span-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search business ideas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="highest_score">Highest Score</SelectItem>
            <SelectItem value="lowest_score">Lowest Score</SelectItem>
            <SelectItem value="most_complete">Most Complete</SelectItem>
            <SelectItem value="a-z">A-Z</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterScore} onValueChange={setFilterScore}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by Score..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_scores">All Scores</SelectItem>
            <SelectItem value="high">High (7-10)</SelectItem>
            <SelectItem value="medium">Medium (4-7)</SelectItem>
            <SelectItem value="low">Low (0-4)</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterProgress} onValueChange={setFilterProgress}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by Progress..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_progress">All Progress</SelectItem>
            <SelectItem value="high">High Progress (60%+)</SelectItem>
            <SelectItem value="medium">Medium Progress (30-60%)</SelectItem>
            <SelectItem value="low">Low Progress (&lt;30%)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Business Ideas Grid or Empty State */}
      {sortedIdeas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedIdeas.map(idea => (
            <BusinessIdeaCard 
              key={idea.id} 
              idea={idea} 
              onIdeaUpdated={refreshReports}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg mt-8">
          <FolderOpen className="mx-auto h-20 w-20 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold text-foreground">
            {showArchivedOnly ? 'No archived ideas found' : 'No business ideas found'}
          </h3>
          {searchTerm || filterScore !== 'all_scores' || filterProgress !== 'all_progress' ? (
            <p className="mt-2 text-sm text-muted-foreground">Try adjusting your search or filter criteria.</p>
          ) : reports.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {showArchivedOnly 
                ? 'No archived business ideas yet.' 
                : 'Start your first idea validation to see your business dashboard here.'
              }
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">No ideas match your current filters.</p>
          )}
          {!showArchivedOnly && reports.length === 0 && (
            <Button className="mt-6" asChild>
              <Link to="/dashboard/validate">
                <PlusCircle className="mr-2 h-4 w-4" />
                Validate First Idea
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default MyBusinessIdeasTabContent;
