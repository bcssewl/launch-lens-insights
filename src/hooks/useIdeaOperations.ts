
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useIdeaOperations = () => {
  const [loading, setLoading] = useState(false);

  const archiveIdea = async (reportId: string) => {
    try {
      setLoading(true);

      // First get the validation_id from the report
      const { data: report, error: reportError } = await supabase
        .from('validation_reports')
        .select('validation_id')
        .eq('id', reportId)
        .single();

      if (reportError) {
        throw reportError;
      }

      // Archive the idea validation
      const { error: archiveError } = await supabase
        .from('idea_validations')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', report.validation_id);

      if (archiveError) {
        throw archiveError;
      }

      // Update the report status to archived
      const { error: reportUpdateError } = await supabase
        .from('validation_reports')
        .update({ status: 'archived' })
        .eq('id', reportId);

      if (reportUpdateError) {
        throw reportUpdateError;
      }

      toast({
        title: "Idea Archived",
        description: "The idea has been archived successfully.",
      });

      return true;
    } catch (error) {
      toast({
        title: "Archive Failed",
        description: `Failed to archive idea: ${error.message}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteIdea = async (reportId: string) => {
    try {
      setLoading(true);

      // First get the validation_id from the report
      const { data: report, error: reportError } = await supabase
        .from('validation_reports')
        .select('validation_id')
        .eq('id', reportId)
        .single();

      if (reportError) {
        throw reportError;
      }

      // Delete the idea validation (this will cascade delete the report)
      const { error: deleteError } = await supabase
        .from('idea_validations')
        .delete()
        .eq('id', report.validation_id);

      if (deleteError) {
        throw deleteError;
      }

      toast({
        title: "Idea Deleted",
        description: "The idea has been permanently deleted.",
      });

      return true;
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: `Failed to delete idea: ${error.message}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unarchiveIdea = async (reportId: string) => {
    try {
      setLoading(true);

      // First get the validation_id from the report
      const { data: report, error: reportError } = await supabase
        .from('validation_reports')
        .select('validation_id')
        .eq('id', reportId)
        .single();

      if (reportError) {
        throw reportError;
      }

      // Unarchive the idea validation
      const { error: unarchiveError } = await supabase
        .from('idea_validations')
        .update({ archived_at: null })
        .eq('id', report.validation_id);

      if (unarchiveError) {
        throw unarchiveError;
      }

      // Update the report status back to completed (assuming it was completed before archiving)
      const { error: reportUpdateError } = await supabase
        .from('validation_reports')
        .update({ status: 'completed' })
        .eq('id', reportId);

      if (reportUpdateError) {
        throw reportUpdateError;
      }

      toast({
        title: "Idea Unarchived",
        description: "The idea has been unarchived successfully.",
      });

      return true;
    } catch (error) {
      toast({
        title: "Unarchive Failed",
        description: `Failed to unarchive idea: ${error.message}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    archiveIdea,
    deleteIdea,
    unarchiveIdea,
    loading
  };
};
