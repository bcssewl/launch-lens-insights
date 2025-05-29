
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ReportStatus {
  id: string;
  status: 'generating' | 'completed' | 'failed' | 'archived';
  overall_score?: number;
  recommendation?: string;
  completed_at?: string;
  report_data?: any;
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
          .select('*')
          .eq('id', reportId)
          .single();

        if (reportError) {
          setError(reportError.message);
          return;
        }

        // Ensure status is properly typed
        const typedReport: ReportStatus = {
          ...report,
          status: report.status as 'generating' | 'completed' | 'failed' | 'archived'
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

    // Set up polling for status updates
    const interval = setInterval(fetchReportStatus, 3000);

    // Set up real-time subscription for report updates
    const reportChannel = supabase
      .channel('report-status')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'validation_reports',
          filter: `id=eq.${reportId}`
        },
        () => {
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
