
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

  // Check if a document exists for a given message ID
  const findDocumentByMessageId = useCallback(async (msgId: string) => {
    console.log('useCanvasDocument: Finding document for message:', msgId);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: mapping, error: mappingError } = await supabase
        .from('message_canvas_documents')
        .select(`
          document_id,
          canvas_documents (
            id,
            title,
            content,
            created_at,
            updated_at,
            created_by
          )
        `)
        .eq('message_id', msgId)
        .eq('created_by', user.id)
        .single();

      if (mappingError && mappingError.code !== 'PGRST116') {
        throw mappingError;
      }

      if (mapping && mapping.canvas_documents) {
        console.log('useCanvasDocument: Found existing document:', mapping.canvas_documents.id);
        return mapping.canvas_documents as CanvasDocument;
      }

      console.log('useCanvasDocument: No existing document found for message');
      return null;
    } catch (err) {
      console.error('useCanvasDocument: Error finding document:', err);
      return null;
    }
  }, []);

  // Create a new document and link it to a message
  const createDocumentForMessage = useCallback(async (msgId: string, title: string, content: string) => {
    console.log('useCanvasDocument: Creating new document for message:', msgId);
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create the document
      const { data: newDocument, error: docError } = await supabase
        .from('canvas_documents')
        .insert({
          title,
          content,
          created_by: user.id
        })
        .select()
        .single();

      if (docError) throw docError;

      // Create the message-document mapping
      const { error: mappingError } = await supabase
        .from('message_canvas_documents')
        .insert({
          message_id: msgId,
          document_id: newDocument.id,
          created_by: user.id
        });

      if (mappingError) {
        console.error('useCanvasDocument: Error creating mapping:', mappingError);
        // Don't throw here as the document was created successfully
      }

      setDocument(newDocument);
      console.log('useCanvasDocument: Document created and linked successfully:', newDocument.id);
      return newDocument;
    } catch (err) {
      console.error('useCanvasDocument: Error creating document:', err);
      setError(err instanceof Error ? err.message : 'Failed to create document');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new document (without message linking)
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
        } as any)
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

  // Initialize document for a message - either find existing or create new
  useEffect(() => {
    const initializeDocumentForMessage = async () => {
      if (!messageId || !initialContent || document) return;

      console.log('useCanvasDocument: Initializing document for message:', messageId);

      // First, try to find existing document
      const existingDoc = await findDocumentByMessageId(messageId);
      
      if (existingDoc) {
        console.log('useCanvasDocument: Using existing document:', existingDoc.id);
        setDocument(existingDoc);
        return;
      }

      // If no existing document, create a new one
      const title = initialContent.split('\n')[0].replace(/^#\s*/, '') || 'AI Report';
      await createDocumentForMessage(messageId, title, initialContent);
    };

    initializeDocumentForMessage();
  }, [messageId, initialContent, document, findDocumentByMessageId, createDocumentForMessage]);

  return {
    document,
    versions,
    isLoading,
    error,
    createDocument,
    updateDocument,
    loadDocument,
    loadVersions,
    createVersion,
    findDocumentByMessageId
  };
};
