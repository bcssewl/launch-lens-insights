
import React, { useState } from 'react';
import ReportCard, { Report } from '@/components/reports/ReportCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, FolderOpen, Search as SearchIcon, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useValidationReports } from '@/hooks/useValidationReports';
import { format } from 'date-fns';

const MyReportsTabContent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterScore, setFilterScore] = useState('all_scores');
  const [filterStatus, setFilterStatus] = useState('all_status');
  const [includeArchived, setIncludeArchived] = useState(false);
  
  const { reports, loading, error, refreshReports } = useValidationReports();

  // Transform validation reports to match ReportCard interface
  const transformedReports: Report[] = reports.map(report => {
    // Map status to ReportCard status
    const getReportCardStatus = (status: string): Report['status'] => {
      console.log('Report status:', status, 'Report ID:', report.id, 'Archived at:', report.archived_at);
      
      switch (status) {
        case 'archived':
          return 'Archived';
        case 'completed':
          if (report.overall_score && report.overall_score >= 7) return 'Validated';
          if (report.overall_score && report.overall_score >= 5) return 'Promising';
          if (report.overall_score && report.overall_score >= 3) return 'Caution';
          return 'High Risk';
        case 'failed':
          return 'Not Recommended';
        case 'generating':
        default:
          return 'Caution'; // For generating status and other cases
      }
    };

    return {
      id: report.id,
      ideaName: report.idea_name || 'Untitled Idea',
      score: report.overall_score || 0,
      maxScore: 10,
      date: report.completed_at 
        ? format(new Date(report.completed_at), 'MMM d, yyyy')
        : format(new Date(report.created_at), 'MMM d, yyyy'),
      status: getReportCardStatus(report.status),
      preview: report.one_line_description || 'No description available',
    };
  });

  // Apply filters and search
  const filteredReports = transformedReports.filter(report => {
    const matchesSearch = report.ideaName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesScoreFilter = filterScore === 'all_scores' || 
      (filterScore === 'high' && report.score >= 7) ||
      (filterScore === 'medium' && report.score >= 4 && report.score < 7) ||
      (filterScore === 'low' && report.score < 4);
    
    const matchesStatusFilter = filterStatus === 'all_status' || report.status === filterStatus;
    
    // Updated archive filter logic: if status filter is "Archived", show archived regardless of includeArchived checkbox
    const matchesArchiveFilter = filterStatus === 'Archived' || includeArchived || report.status !== 'Archived';
    
    return matchesSearch && matchesScoreFilter && matchesStatusFilter && matchesArchiveFilter;
  });

  // Apply sorting
  const sortedReports = [...filteredReports].sort((a, b) => {
    switch (sortBy) {
      case 'highest_score':
        return b.score - a.score;
      case 'lowest_score':
        return a.score - b.score;
      case 'a-z':
        return a.ideaName.localeCompare(b.ideaName);
      case 'recent':
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-medium text-foreground">Your Idea Analyses</h3>
            <p className="text-sm text-muted-foreground">View and manage all your past idea validation reports.</p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link to="/dashboard/validate">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Analysis
            </Link>
          </Button>
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
          <p className="text-red-600 mb-4">Error loading reports: {error}</p>
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
          <h3 className="text-lg font-medium text-foreground">Your Idea Analyses</h3>
          <p className="text-sm text-muted-foreground">View and manage all your past idea validation reports.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshReports} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link to="/dashboard/validate">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Analysis
            </Link>
          </Button>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div className="relative md:col-span-2 lg:col-span-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your ideas..."
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
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by Status..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_status">All Statuses</SelectItem>
            <SelectItem value="Validated">Validated</SelectItem>
            <SelectItem value="Promising">Promising</SelectItem>
            <SelectItem value="Caution">Caution</SelectItem>
            <SelectItem value="High Risk">High Risk</SelectItem>
            <SelectItem value="Not Recommended">Not Recommended</SelectItem>
            <SelectItem value="Archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Include Archived Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="include-archived"
          checked={includeArchived}
          onCheckedChange={(checked) => setIncludeArchived(checked === true)}
        />
        <label
          htmlFor="include-archived"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Include archived ideas
        </label>
      </div>

      {/* Reports Grid or Empty State */}
      {sortedReports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedReports.map(report => (
            <ReportCard 
              key={report.id} 
              report={report} 
              onReportUpdated={refreshReports}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg mt-8">
          <FolderOpen className="mx-auto h-20 w-20 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold text-foreground">No reports found</h3>
          {searchTerm || filterScore !== 'all_scores' || filterStatus !== 'all_status' ? (
            <p className="mt-2 text-sm text-muted-foreground">Try adjusting your search or filter criteria.</p>
          ) : reports.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">Start your first idea validation to see your reports here.</p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">No reports match your current filters.</p>
          )}
          {reports.length === 0 && (
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

export default MyReportsTabContent;
