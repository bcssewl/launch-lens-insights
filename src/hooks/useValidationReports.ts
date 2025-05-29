
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ValidationReport {
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

export const useValidationReports = () => {
  const [reports, setReports] = useState<ValidationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setReports([]);
      setLoading(false);
      return;
    }

    fetchReports();
  }, [user]);

  const fetchReports = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Join validation_reports with idea_validations to get idea details
      const { data, error: fetchError } = await supabase
        .from('validation_reports')
        .select(`
          *,
          idea_validations!inner(
            id,
            idea_name,
            one_line_description,
            user_id
          )
        `)
        .eq('idea_validations.user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      // Transform the data to include idea details at the top level
      const transformedReports = data?.map(report => ({
        ...report,
        idea_name: report.idea_validations?.idea_name,
        one_line_description: report.idea_validations?.one_line_description,
      })) || [];

      setReports(transformedReports);
    } catch (err) {
      setError('Failed to fetch validation reports');
      console.error('Error fetching validation reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshReports = () => {
    fetchReports();
  };

  return { reports, loading, error, refreshReports };
};
