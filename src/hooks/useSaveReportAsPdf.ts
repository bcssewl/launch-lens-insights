import { useState } from 'react';
import html2pdf from 'html2pdf.js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { processMarkdownForPdf, createChatGptPdfHtml } from '@/utils/canvasPdfProcessor';
import { format } from 'date-fns';

interface SaveReportAsPdfOptions {
  clientId: string;
  fileName: string;
  canvasContent: string;
  canvasTitle: string;
}

export const useSaveReportAsPdf = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const preprocessCanvasContent = (rawContent: string): string => {
    try {
      const parsed = JSON.parse(rawContent);
      
      const contentFields = ['content', 'markdown', 'text', 'report', 'response', 'message'];
      
      for (const field of contentFields) {
        if (parsed[field] && typeof parsed[field] === 'string' && parsed[field].trim()) {
          console.log(`useSaveReportAsPdf: Extracted content from JSON field: ${field}`);
          return parsed[field].trim();
        }
      }
      
      console.log('useSaveReportAsPdf: JSON parsed but no content field found, using stringified version');
      return JSON.stringify(parsed, null, 2);
      
    } catch (error) {
      console.log('useSaveReportAsPdf: Content is not JSON, treating as markdown');
      return rawContent.trim();
    }
  };

  const generatePdfBlob = async (content: string, title: string): Promise<Blob> => {
    // Preprocess content to extract meaningful text from JSON if needed
    const processedContent = preprocessCanvasContent(content);
    
    // Validate content length
    if (!processedContent || processedContent.length < 10) {
      throw new Error('Content is too short or empty to generate a meaningful report');
    }
    
    // Process markdown to HTML using existing utility
    const processed = await processMarkdownForPdf(processedContent);
    const html = createChatGptPdfHtml(processed, {
      generatedDate: format(new Date(), 'd MMM yyyy'),
      author: 'AI Assistant'
    });
    
    // Generate PDF blob using html2pdf.js
    const pdfBlob = await html2pdf()
      .from(html)
      .set({
        margin: 1,
        filename: title.replace(/[^a-zA-Z0-9\s]/g, '').trim() + '.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      })
      .output('blob');
    
    return pdfBlob;
  };

  const saveReportAsPdf = async ({
    clientId,
    fileName,
    canvasContent,
    canvasTitle
  }: SaveReportAsPdfOptions): Promise<{ success: boolean; clientName?: string }> => {
    setIsLoading(true);
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('You must be logged in to save files');
      }

      // Generate PDF blob
      const pdfBlob = await generatePdfBlob(canvasContent, canvasTitle);
      
      // Ensure filename has .pdf extension
      const cleanFileName = fileName.endsWith('.pdf') 
        ? fileName 
        : fileName.replace(/\.[^/.]+$/, '') + '.pdf';
      
      const filePath = `${clientId}/${Date.now()}_${cleanFileName}`;
      
      // Upload PDF to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('client-files')
        .upload(filePath, pdfBlob, {
          cacheControl: '3600',
          contentType: 'application/pdf',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Failed to upload file. Please try again.');
      }

      // Save file record to database
      const { error: dbError } = await supabase
        .from('client_files')
        .insert({
          client_id: clientId,
          file_name: cleanFileName,
          file_path: filePath,
          file_size: pdfBlob.size,
          file_type: 'application/pdf',
          category: 'Report',
          user_id: user.id
        });

      if (dbError) {
        console.error('Database error:', dbError);
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('client-files').remove([filePath]);
        throw new Error('Failed to save file record. Please try again.');
      }

      // Get client name for success message
      const { data: clientData } = await supabase
        .from('clients')
        .select('name')
        .eq('id', clientId)
        .single();

      const clientName = clientData?.name || 'Unknown Client';

      toast({
        title: "Success",
        description: "Saved to client workspace",
      });

      return { success: true, clientName };

    } catch (error) {
      console.error('Error saving PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save canvas report. Please try again.';
      
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive"
      });

      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveReportAsPdf,
    isLoading
  };
};