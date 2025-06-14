
import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { BusinessIdea } from '@/components/business-ideas/BusinessIdeaCard';
import { useValidationReports } from '@/hooks/useValidationReports';

interface UseBusinessIdeasLogicProps {
  showArchivedOnly: boolean;
}

export const useBusinessIdeasLogic = ({ showArchivedOnly }: UseBusinessIdeasLogicProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterScore, setFilterScore] = useState('all_scores');
  const [filterProgress, setFilterProgress] = useState('all_progress');
  
  const { reports, loading, error, refreshReports } = useValidationReports();

  // Transform validation reports to match BusinessIdeaCard interface
  const transformedBusinessIdeas: BusinessIdea[] = useMemo(() => {
    return reports.map(report => {
      // Calculate completion progress (only validation report is complete for now)
      const completedSections = 1; // Only validation report
      const totalSections = 5; // Validation, Business Plan, Marketing, Financial, Action Items
      const completionPercentage = (completedSections / totalSections) * 100;

      return {
        id: report.validation_id, // Use validation_id instead of report.id for dashboard navigation
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
  }, [reports]);

  // Filter and sort logic
  const processedIdeas = useMemo(() => {
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

    return sortedIdeas;
  }, [transformedBusinessIdeas, showArchivedOnly, searchTerm, filterScore, filterProgress, sortBy]);

  return {
    // Data
    ideas: processedIdeas,
    totalReports: reports.length,
    loading,
    error,
    
    // Actions
    refreshReports,
    
    // Filter state
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    filterScore,
    setFilterScore,
    filterProgress,
    setFilterProgress,
  };
};
