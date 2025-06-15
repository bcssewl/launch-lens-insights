
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useIdeaOperations = () => {
  const [loading, setLoading] = useState(false);

  const archiveIdea = async (reportId: string) => {
    try {
      setLoading(true);
      console.log('Archiving idea with reportId:', reportId);

      // First get the validation_id from the report and verify ownership
      const { data: report, error: reportError } = await supabase
        .from('validation_reports')
        .select(`
          validation_id,
          idea_validations!inner(
            id,
            user_id
          )
        `)
        .eq('id', reportId)
        .maybeSingle();

      if (reportError) {
        console.error('Error fetching report:', reportError);
        throw new Error(`Failed to fetch report: ${reportError.message}`);
      }

      if (!report) {
        throw new Error('Report not found or you do not have permission to access it');
      }

      console.log('Found report for archiving:', report);

      // Archive the idea validation
      const { error: archiveError } = await supabase
        .from('idea_validations')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', report.validation_id);

      if (archiveError) {
        console.error('Error archiving idea:', archiveError);
        throw new Error(`Failed to archive idea: ${archiveError.message}`);
      }

      console.log('Successfully archived idea');
      toast({
        title: "Idea Archived",
        description: "The idea has been archived successfully.",
      });

      return true;
    } catch (error) {
      console.error('Archive operation failed:', error);
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
      console.log('Deleting idea with reportId:', reportId);

      // First get the validation_id from the report and verify ownership
      const { data: report, error: reportError } = await supabase
        .from('validation_reports')
        .select(`
          validation_id,
          idea_validations!inner(
            id,
            user_id
          )
        `)
        .eq('id', reportId)
        .maybeSingle();

      if (reportError) {
        console.error('Error fetching report:', reportError);
        throw new Error(`Failed to fetch report: ${reportError.message}`);
      }

      if (!report) {
        throw new Error('Report not found or you do not have permission to access it');
      }

      console.log('Found report for deletion:', report);

      // Delete the idea validation (this will cascade delete the report due to foreign key)
      const { error: deleteError } = await supabase
        .from('idea_validations')
        .delete()
        .eq('id', report.validation_id);

      if (deleteError) {
        console.error('Error deleting idea:', deleteError);
        throw new Error(`Failed to delete idea: ${deleteError.message}`);
      }

      console.log('Successfully deleted idea');
      toast({
        title: "Idea Deleted",
        description: "The idea has been permanently deleted.",
      });

      return true;
    } catch (error) {
      console.error('Delete operation failed:', error);
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
      console.log('Unarchiving idea with reportId:', reportId);

      // First get the validation_id from the report and verify ownership
      const { data: report, error: reportError } = await supabase
        .from('validation_reports')
        .select(`
          validation_id,
          idea_validations!inner(
            id,
            user_id
          )
        `)
        .eq('id', reportId)
        .maybeSingle();

      if (reportError) {
        console.error('Error fetching report:', reportError);
        throw new Error(`Failed to fetch report: ${reportError.message}`);
      }

      if (!report) {
        throw new Error('Report not found or you do not have permission to access it');
      }

      console.log('Found report for unarchiving:', report);

      // Unarchive the idea validation
      const { error: unarchiveError } = await supabase
        .from('idea_validations')
        .update({ archived_at: null })
        .eq('id', report.validation_id);

      if (unarchiveError) {
        console.error('Error unarchiving idea:', unarchiveError);
        throw new Error(`Failed to unarchive idea: ${unarchiveError.message}`);
      }

      console.log('Successfully unarchived idea');
      toast({
        title: "Idea Unarchived",
        description: "The idea has been unarchived successfully.",
      });

      return true;
    } catch (error) {
      console.error('Unarchive operation failed:', error);
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
