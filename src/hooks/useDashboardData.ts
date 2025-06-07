
import { useState, useEffect } from 'react';
import { useValidationReports } from './useValidationReports';
import { format } from 'date-fns';

export const useDashboardData = () => {
  const { reports, loading: reportsLoading, refreshReports } = useValidationReports();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(reportsLoading);
  }, [reportsLoading]);

  const stats = {
    ideasValidated: reports.length,
    averageScore: reports.length > 0 
      ? Math.round(reports.reduce((sum, report) => sum + (report.overall_score || 0), 0) / reports.length)
      : 0,
    businessPlans: 0, // Placeholder for future feature
    successRate: reports.length > 0 
      ? Math.round((reports.filter(report => (report.overall_score || 0) >= 6).length / reports.length) * 100)
      : 0,
    activeProjects: reports.filter(report => report.status === 'completed').length, // New metric
  };

  const recentActivities = reports
    .filter(report => report.status === 'completed')
    .slice(0, 5)
    .map(report => {
      const score = report.overall_score || 0;
      let statusText = 'Analysis completed';
      let statusColor: 'green' | 'yellow' | 'red' = 'green';

      if (score >= 7) {
        statusText = 'Highly validated';
        statusColor = 'green';
      } else if (score >= 5) {
        statusText = 'Promising opportunity';
        statusColor = 'green';
      } else if (score >= 3) {
        statusText = 'Needs attention';
        statusColor = 'yellow';
      } else {
        statusText = 'High risk identified';
        statusColor = 'red';
      }

      return {
        id: report.id,
        ideaName: report.idea_name || 'Untitled Idea',
        score,
        timestamp: format(new Date(report.completed_at || report.created_at), 'MMM d, h:mm a'),
        statusText,
        statusColor,
        reportId: report.id,
      };
    });

  const refreshData = () => {
    refreshReports();
  };

  return {
    stats,
    recentActivities,
    loading,
    refreshData,
  };
};
