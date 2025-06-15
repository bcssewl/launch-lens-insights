
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useIdeaOperations = () => {
  const [loading, setLoading] = useState(false);

  const findReportByIdOrValidationId = async (id: string) => {
    console.log('Finding report by ID:', id);
    
    // First try to find by report ID
    let { data: report, error: reportError } = await supabase
      .from('validation_reports')
      .select(`
        id,
        validation_id,
        idea_validations!inner(
          id,
          user_id
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (report) {
      console.log('Found report by report ID:', report);
      return { report, error: null };
    }

    // If not found by report ID, try to find by validation ID
    console.log('Report not found by ID, trying validation_id:', id);
    const { data: reportByValidation, error: validationError } = await supabase
      .from('validation_reports')
      .select(`
        id,
        validation_id,
        idea_validations!inner(
          id,
          user_id
        )
      `)
      .eq('validation_id', id)
      .maybeSingle();

    if (reportByValidation) {
      console.log('Found report by validation_id:', reportByValidation);
      return { report: reportByValidation, error: null };
    }

    console.log('Report not found by either ID or validation_id');
    return { 
      report: null, 
      error: reportError || validationError || new Error('Report not found') 
    };
  };

  const archiveIdea = async (reportId: string) => {
    try {
      setLoading(true);
      console.log('Archiving idea with ID:', reportId);

      const { report, error: findError } = await findReportByIdOrValidationId(reportId);

      if (findError || !report) {
        console.error('Error finding report:', findError);
        throw new Error(`Report not found or you do not have permission to access it`);
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
      console.log('Deleting idea with ID:', reportId);

      const { report, error: findError } = await findReportByIdOrValidationId(reportId);

      if (findError || !report) {
        console.error('Error finding report:', findError);
        throw new Error(`Report not found or you do not have permission to access it`);
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
      console.log('Unarchiving idea with ID:', reportId);

      const { report, error: findError } = await findReportByIdOrValidationId(reportId);

      if (findError || !report) {
        console.error('Error finding report:', findError);
        throw new Error(`Report not found or you do not have permission to access it`);
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
