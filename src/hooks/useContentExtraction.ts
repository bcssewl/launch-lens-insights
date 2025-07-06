
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ExtractionStatus {
  fileId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error?: string;
}

export const useContentExtraction = () => {
  const [extractionStatuses, setExtractionStatuses] = useState<Map<string, ExtractionStatus>>(new Map());
  const { toast } = useToast();

  const updateStatus = (fileId: string, status: Partial<ExtractionStatus>) => {
    setExtractionStatuses(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(fileId) || { fileId, status: 'pending' };
      newMap.set(fileId, { ...existing, ...status });
      return newMap;
    });
  };

  const extractContent = async (fileId: string, fileName: string) => {
    updateStatus(fileId, { status: 'processing' });
    
    try {
      console.log('Starting content extraction for:', fileName, 'fileId:', fileId);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('extract-file-content', {
        body: { 
          fileId,
          userId: user?.id 
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Content extraction response:', data);

      if (data?.success) {
        updateStatus(fileId, { 
          status: 'completed',
          progress: 100
        });
        
        toast({
          title: "Content Extracted",
          description: `Successfully extracted content from ${fileName}. ${data.extractedLength} characters processed.`,
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
        title: "Extraction Failed",
        description: `Failed to extract content from ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      
      return false;
    }
  };

  const getExtractionStatus = (fileId: string): ExtractionStatus | null => {
    return extractionStatuses.get(fileId) || null;
  };

  const batchExtractContent = async (fileIds: string[]) => {
    console.log('Starting batch extraction for', fileIds.length, 'files');
    
    const results = await Promise.all(
      fileIds.map(async (fileId) => {
        try {
          await extractContent(fileId, `File ${fileId}`);
          return { fileId, success: true };
        } catch (error) {
          return { fileId, success: false, error };
        }
      })
    );
    
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    
    toast({
      title: "Batch Extraction Complete",
      description: `Processed ${results.length} files: ${successful} successful, ${failed} failed`,
    });
    
    return results;
  };

  // Auto-extract content when files are uploaded
  const autoExtractOnUpload = async (fileId: string, fileName: string) => {
    console.log('Auto-extracting content for uploaded file:', fileName);
    
    // Small delay to ensure file is fully uploaded
    setTimeout(() => {
      extractContent(fileId, fileName);
    }, 1000);
  };

  return {
    extractContent,
    getExtractionStatus,
    batchExtractContent,
    autoExtractOnUpload,
    extractionStatuses
  };
};
