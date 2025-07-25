
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ReportStatus {
  id: string;
  status: 'generating' | 'completed' | 'failed' | 'archived';
  overall_score?: number;
  recommendation?: string;
  completed_at?: string;
  report_data?: any;
  idea_name?: string;
  one_line_description?: string;
}

export const useReportStatus = (reportId: string) => {
  const [reportStatus, setReportStatus] = useState<ReportStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId) return;

    const fetchReportStatus = async () => {
      try {
        const { data: report, error: reportError } = await supabase
          .from('validation_reports')
          .select(`
            *,
            idea_validations!inner (
              idea_name,
              one_line_description
            )
          `)
          .eq('id', reportId)
          .single();

        if (reportError) {
          setError(reportError.message);
          return;
        }

        // Ensure status is properly typed and include idea validation data
        const typedReport: ReportStatus = {
          ...report,
          status: report.status as 'generating' | 'completed' | 'failed' | 'archived',
          idea_name: report.idea_validations?.idea_name,
          one_line_description: report.idea_validations?.one_line_description
        };

        setReportStatus(typedReport);
      } catch (err) {
        setError('Failed to fetch report status');
        console.error('Error fetching report status:', err);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchReportStatus();

    // Set up more frequent polling for status updates
    const interval = setInterval(fetchReportStatus, 2000); // Check every 2 seconds

    // Set up real-time subscription for report updates
    const reportChannel = supabase
      .channel('report-status-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'validation_reports',
          filter: `id=eq.${reportId}`
        },
        (payload) => {
          console.log('Report status update received:', payload);
          fetchReportStatus();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(reportChannel);
    };
  }, [reportId]);

  return { reportStatus, loading, error };
};
