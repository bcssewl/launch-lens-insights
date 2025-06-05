
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ReportShare {
  id: string;
  shared_with?: string;
  access_level: 'view' | 'comment' | 'edit';
  share_token?: string;
  expires_at?: string;
  created_at: string;
}

export const useReportSharing = (reportId: string) => {
  const [shares, setShares] = useState<ReportShare[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchShares = async () => {
    if (!reportId) return;
    
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('report_shares')
        .select('*')
        .eq('report_id', reportId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setShares(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch shares');
    } finally {
      setLoading(false);
    }
  };

  const deleteShare = async (shareId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('report_shares')
        .delete()
        .eq('id', shareId);

      if (deleteError) throw deleteError;
      
      // Refresh shares list
      await fetchShares();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete share');
      return false;
    }
  };

  const updateShareAccess = async (shareId: string, accessLevel: string) => {
    try {
      const { error: updateError } = await supabase
        .from('report_shares')
        .update({ 
          access_level: accessLevel,
          updated_at: new Date().toISOString()
        })
        .eq('id', shareId);

      if (updateError) throw updateError;
      
      // Refresh shares list
      await fetchShares();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update share');
      return false;
    }
  };

  useEffect(() => {
    fetchShares();
  }, [reportId]);

  return {
    shares,
    loading,
    error,
    fetchShares,
    deleteShare,
    updateShareAccess,
  };
};
