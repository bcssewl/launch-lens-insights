
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface CanvasDocument {
  id: string;
  title: string;
  content: string;
  document_type: string;
  created_at: string;
  updated_at: string;
  session_id: string | null;
}

export interface CanvasVersion {
  id: string;
  document_id: string;
  version_number: number;
  title: string;
  content: string;
  created_at: string;
  created_by_user: boolean;
}

export const useCanvasDocuments = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const createDocument = useCallback(async (
    title: string,
    content: string,
    documentType: string,
    sessionId?: string | null
  ): Promise<CanvasDocument | null> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create documents",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('canvas_documents')
        .insert([
          {
            user_id: user.id,
            session_id: sessionId,
            title,
            content,
            document_type: documentType,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Create initial version (trigger will handle version numbering, we provide 0 as placeholder)
      await supabase
        .from('canvas_versions')
        .insert([
          {
            document_id: data.id,
            title,
            content,
            created_by_user: false,
            version_number: 0, // Placeholder - will be overridden by trigger
          }
        ]);

      toast({
        title: "Document created",
        description: `"${title}" has been created successfully`,
      });

      return data;
    } catch (error) {
      console.error('Error creating document:', error);
      toast({
        title: "Error",
        description: "Failed to create document",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const updateDocument = useCallback(async (
    documentId: string,
    title: string,
    content: string,
    createdByUser: boolean = false
  ): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to update documents",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('canvas_documents')
        .update({
          title,
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId);

      if (error) throw error;

      // Create version entry (trigger will handle version numbering, we provide 0 as placeholder)
      await supabase
        .from('canvas_versions')
        .insert([
          {
            document_id: documentId,
            title,
            content,
            created_by_user: createdByUser,
            version_number: 0, // Placeholder - will be overridden by trigger
          }
        ]);

      return true;
    } catch (error) {
      console.error('Error updating document:', error);
      toast({
        title: "Error",
        description: "Failed to update document",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const getDocument = useCallback(async (documentId: string): Promise<CanvasDocument | null> => {
    try {
      const { data, error } = await supabase
        .from('canvas_documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching document:', error);
      return null;
    }
  }, []);

  const getDocumentVersions = useCallback(async (documentId: string): Promise<CanvasVersion[]> => {
    try {
      const { data, error } = await supabase
        .from('canvas_versions')
        .select('*')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching document versions:', error);
      return [];
    }
  }, []);

  const deleteDocument = useCallback(async (documentId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('canvas_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      toast({
        title: "Document deleted",
        description: "Document has been deleted successfully",
      });

      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast]);

  return {
    createDocument,
    updateDocument,
    getDocument,
    getDocumentVersions,
    deleteDocument,
    isLoading,
  };
};
