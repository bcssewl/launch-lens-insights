
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EmbeddingProgress {
  fileId: string;
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'partial' | 'error';
  totalChunks?: number;
  processedChunks?: number;
}

export const useFileEmbedding = () => {
  const [processing, setProcessing] = useState<string[]>([]);
  const { toast } = useToast();

  const generateEmbeddings = useCallback(async (fileId: string, textChunks: string[]) => {
    if (!fileId || !textChunks.length) {
      throw new Error('File ID and text chunks are required');
    }

    setProcessing(prev => [...prev, fileId]);

    try {
      console.log(`Starting embedding generation for file ${fileId} with ${textChunks.length} chunks`);

      const { data, error } = await supabase.functions.invoke('embed-file-chunks', {
        body: {
          fileId,
          textChunks
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate embeddings');
      }

      console.log('Embedding generation result:', data);

      toast({
        title: "Embeddings Generated",
        description: `Successfully processed ${data.successCount}/${data.totalChunks} chunks for ${data.fileName}`,
      });

      return data;

    } catch (error) {
      console.error('Error generating embeddings:', error);
      
      toast({
        title: "Embedding Error",
        description: error.message || "Failed to generate embeddings",
        variant: "destructive"
      });

      throw error;
    } finally {
      setProcessing(prev => prev.filter(id => id !== fileId));
    }
  }, [toast]);

  const checkEmbeddingStatus = useCallback(async (fileId: string) => {
    const { data, error } = await supabase
      .from('client_files')
      .select('embedding_status, embedding_processed_at, total_chunks')
      .eq('id', fileId)
      .single();

    if (error) {
      console.error('Error checking embedding status:', error);
      return null;
    }

    return {
      status: data.embedding_status || 'pending',
      processedAt: data.embedding_processed_at,
      totalChunks: data.total_chunks || 0
    };
  }, []);

  const getFileEmbeddings = useCallback(async (fileId: string) => {
    const { data, error } = await supabase
      .from('file_embeddings')
      .select('*')
      .eq('file_id', fileId)
      .order('chunk_index');

    if (error) {
      console.error('Error fetching file embeddings:', error);
      return [];
    }

    return data || [];
  }, []);

  // Simple text chunking function
  const chunkText = useCallback((text: string, maxChunkSize: number = 1000, overlap: number = 100): string[] => {
    if (!text || text.length <= maxChunkSize) {
      return [text];
    }

    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      let end = start + maxChunkSize;
      
      // If we're not at the end, try to break at a word boundary
      if (end < text.length) {
        const spaceIndex = text.lastIndexOf(' ', end);
        if (spaceIndex > start + maxChunkSize * 0.5) {
          end = spaceIndex;
        }
      }

      chunks.push(text.slice(start, end).trim());
      
      // Move start forward, but with overlap
      start = end - overlap;
      if (start >= text.length) break;
    }

    return chunks.filter(chunk => chunk.length > 0);
  }, []);

  return {
    processing,
    generateEmbeddings,
    checkEmbeddingStatus,
    getFileEmbeddings,
    chunkText,
    isProcessing: (fileId: string) => processing.includes(fileId)
  };
};
