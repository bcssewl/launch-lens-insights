
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ValidationReportData {
  id: string;
  validation_id: string;
  status: 'generating' | 'completed' | 'failed' | 'archived';
  overall_score?: number;
  recommendation?: string;
  completed_at?: string;
  created_at: string;
  report_data?: any;
  // Join data from idea_validations
  idea_name?: string;
  one_line_description?: string;
}

export const useValidationReport = (reportId: string) => {
  const [report, setReport] = useState<ValidationReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId) return;

    const fetchReport = async () => {
      try {
        setLoading(true);
        
        const { data, error: fetchError } = await supabase
          .from('validation_reports')
          .select(`
            *,
            idea_validations!inner(
              id,
              idea_name,
              one_line_description
            )
          `)
          .eq('id', reportId)
          .maybeSingle();

        if (fetchError) {
          console.error('Fetch error:', fetchError);
          setError(fetchError.message);
          return;
        }

        if (!data) {
          setError('Report not found');
          return;
        }

        // Transform the data to include idea details at the top level
        const transformedReport: ValidationReportData = {
          ...data,
          status: data.status as 'generating' | 'completed' | 'failed' | 'archived',
          idea_name: data.idea_validations?.idea_name,
          one_line_description: data.idea_validations?.one_line_description,
        };

        setReport(transformedReport);
        setError(null);
      } catch (err) {
        console.error('Error fetching validation report:', err);
        setError('Failed to fetch validation report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  return { report, loading, error };
};
