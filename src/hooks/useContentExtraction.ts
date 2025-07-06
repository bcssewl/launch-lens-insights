
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ExtractionStatus {
  fileId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error?: string;
  processingTimeMs?: number;
  extractedLength?: number;
}

export const useContentExtraction = () => {
  const [extractionStatuses, setExtractionStatuses] = useState<Map<string, ExtractionStatus>>(new Map());
  const processingFiles = useRef<Set<string>>(new Set());
  const { toast } = useToast();

  const updateStatus = useCallback((fileId: string, status: Partial<ExtractionStatus>) => {
    setExtractionStatuses(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(fileId) || { fileId, status: 'pending' };
      newMap.set(fileId, { ...existing, ...status });
      return newMap;
    });
  }, []);

  const extractContentWithGemini = useCallback(async (fileId: string, fileName: string) => {
    // Prevent duplicate processing
    if (processingFiles.current.has(fileId)) {
      console.log('File already being processed:', fileId);
      return false;
    }

    processingFiles.current.add(fileId);
    updateStatus(fileId, { status: 'processing', progress: 10 });
    
    try {
      console.log('Starting Gemini content extraction for:', fileName, 'fileId:', fileId);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Update progress
      updateStatus(fileId, { progress: 30 });

      const { data, error } = await supabase.functions.invoke('gemini-extract-content', {
        body: { 
          fileId,
          userId: user.id 
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Gemini extraction response:', data);

      if (data?.success) {
        updateStatus(fileId, { 
          status: 'completed',
          progress: 100,
          processingTimeMs: data.processingTimeMs,
          extractedLength: data.extractedLength
        });
        
        toast({
          title: "Content Extracted with AI",
          description: `Successfully processed ${fileName} using Gemini AI. ${data.extractedLength} characters extracted.`,
        });
        
        return true;
      } else {
        throw new Error(data?.error || 'Content extraction failed');
      }
    } catch (error) {
      console.error('Content extraction error:', error);
      
      updateStatus(fileId, { 
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      toast({
        title: "AI Extraction Failed",
        description: `Failed to extract content from ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      
      return false;
    } finally {
      // Always remove from processing set
      processingFiles.current.delete(fileId);
    }
  }, [updateStatus, toast]);

  const getExtractionStatus = useCallback((fileId: string): ExtractionStatus | null => {
    return extractionStatuses.get(fileId) || null;
  }, [extractionStatuses]);

  // Auto-extract content when files are uploaded using Gemini
  const autoExtractOnUpload = useCallback(async (fileId: string, fileName: string) => {
    console.log('Auto-extracting content with Gemini for uploaded file:', fileName);
    
    // Small delay to ensure file is fully uploaded
    setTimeout(() => {
      extractContentWithGemini(fileId, fileName);
    }, 1000);
  }, [extractContentWithGemini]);

  const batchExtractContent = useCallback(async (fileIds: string[]) => {
    console.log('Starting batch Gemini extraction for', fileIds.length, 'files');
    
    const results = await Promise.all(
      fileIds.map(async (fileId) => {
        try {
          await extractContentWithGemini(fileId, `File ${fileId}`);
          return { fileId, success: true };
        } catch (error) {
          return { fileId, success: false, error };
        }
      })
    );
    
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    
    toast({
      title: "Batch AI Extraction Complete",
      description: `Processed ${results.length} files with Gemini AI: ${successful} successful, ${failed} failed`,
    });
    
    return results;
  }, [extractContentWithGemini, toast]);

  return {
    extractContent: extractContentWithGemini,
    getExtractionStatus,
    batchExtractContent,
    autoExtractOnUpload,
    extractionStatuses
  };
};
