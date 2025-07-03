
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CanvasDocument {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface CanvasVersion {
  id: string;
  document_id: string;
  version_number: number;
  title: string;
  content: string;
  created_at: string;
  created_by_user: boolean;
}

export const useCanvasDocument = (messageId?: string, initialContent?: string) => {
  const [document, setDocument] = useState<CanvasDocument | null>(null);
  const [versions, setVersions] = useState<CanvasVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new document
  const createDocument = useCallback(async (title: string, content: string) => {
    console.log('useCanvasDocument: Creating new document');
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('canvas_documents')
        .insert({
          title,
          content,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setDocument(data);
      console.log('useCanvasDocument: Document created successfully:', data.id);
      return data;
    } catch (err) {
      console.error('useCanvasDocument: Error creating document:', err);
      setError(err instanceof Error ? err.message : 'Failed to create document');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update document content
  const updateDocument = useCallback(async (id: string, updates: Partial<Pick<CanvasDocument, 'title' | 'content'>>) => {
    console.log('useCanvasDocument: Updating document:', id);
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('canvas_documents')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setDocument(data);
      console.log('useCanvasDocument: Document updated successfully');
      return data;
    } catch (err) {
      console.error('useCanvasDocument: Error updating document:', err);
      setError(err instanceof Error ? err.message : 'Failed to update document');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load document by ID
  const loadDocument = useCallback(async (id: string) => {
    console.log('useCanvasDocument: Loading document:', id);
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('canvas_documents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setDocument(data);
      console.log('useCanvasDocument: Document loaded successfully');
      return data;
    } catch (err) {
      console.error('useCanvasDocument: Error loading document:', err);
      setError(err instanceof Error ? err.message : 'Failed to load document');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load document versions
  const loadVersions = useCallback(async (documentId: string) => {
    console.log('useCanvasDocument: Loading versions for document:', documentId);
    
    try {
      const { data, error } = await supabase
        .from('canvas_versions')
        .select('*')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false });

      if (error) throw error;

      setVersions(data || []);
      console.log('useCanvasDocument: Versions loaded:', data?.length || 0);
      return data || [];
    } catch (err) {
      console.error('useCanvasDocument: Error loading versions:', err);
      return [];
    }
  }, []);

  // Create a version manually (user-initiated)
  const createVersion = useCallback(async (documentId: string, title: string, content: string) => {
    console.log('useCanvasDocument: Creating manual version for document:', documentId);
    
    try {
      const { data, error } = await supabase
        .from('canvas_versions')
        .insert({
          document_id: documentId,
          title,
          content,
          created_by_user: true
        })
        .select()
        .single();

      if (error) throw error;

      // Reload versions
      await loadVersions(documentId);
      console.log('useCanvasDocument: Manual version created successfully');
      return data;
    } catch (err) {
      console.error('useCanvasDocument: Error creating version:', err);
      return null;
    }
  }, [loadVersions]);

  // Initialize document for a message if it doesn't exist
  useEffect(() => {
    if (messageId && initialContent && !document) {
      // Check if document already exists for this message
      // For now, we'll create a new document each time
      // In production, you might want to link documents to messages
      const title = initialContent.split('\n')[0].replace(/^#\s*/, '') || 'AI Report';
      createDocument(title, initialContent);
    }
  }, [messageId, initialContent, document, createDocument]);

  return {
    document,
    versions,
    isLoading,
    error,
    createDocument,
    updateDocument,
    loadDocument,
    loadVersions,
    createVersion
  };
};
