
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ValidationData {
  id: string;
  idea_name: string;
  one_line_description: string;
  problem_statement: string;
  solution_description: string;
  form_data: any;
}

export const useValidationData = (validationId: string | null) => {
  const [validationData, setValidationData] = useState<ValidationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!validationId) {
      setValidationData(null);
      return;
    }

    const fetchValidationData = async () => {
      try {
        setLoading(true);
        setError(null);

        // First get the report to find the validation_id
        const { data: report, error: reportError } = await supabase
          .from('validation_reports')
          .select('validation_id')
          .eq('id', validationId)
          .single();

        if (reportError) {
          setError(reportError.message);
          return;
        }

        // Then get the validation data
        const { data: validation, error: validationError } = await supabase
          .from('idea_validations')
          .select('*')
          .eq('id', report.validation_id)
          .single();

        if (validationError) {
          setError(validationError.message);
          return;
        }

        setValidationData(validation);
      } catch (err) {
        setError('Failed to fetch validation data');
        console.error('Error fetching validation data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchValidationData();
  }, [validationId]);

  return { validationData, loading, error };
};
