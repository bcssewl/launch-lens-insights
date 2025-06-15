
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface PitchDeckUpload {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  file_type: string;
  processing_status: string;
  transcription_text: string | null;
  transcription_completed_at: string | null;
  validation_id: string | null;
  created_at: string;
  updated_at: string;
}

export const usePitchDeckUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useAuth();

  const uploadPitchDeck = async (file: File): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload files",
        variant: "destructive",
      });
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      console.log('Uploading pitch deck file:', fileName);

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pitch-deck-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded successfully:', uploadData);
      setUploadProgress(50);

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('pitch-deck-files')
        .getPublicUrl(fileName);

      const fileUrl = urlData.publicUrl;
      console.log('File URL:', fileUrl);

      // Create record in pitch_deck_uploads table
      const { data: uploadRecord, error: recordError } = await supabase
        .from('pitch_deck_uploads')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_path: fileName,
          file_size: file.size,
          file_type: file.type,
          processing_status: 'uploaded'
        })
        .select()
        .single();

      if (recordError) {
        console.error('Record creation error:', recordError);
        throw recordError;
      }

      console.log('Upload record created:', uploadRecord);
      setUploadProgress(75);

      // Send file to n8n webhook for processing
      const webhookUrl = 'https://n8n-launchlens.botica.it.com/webhook/presentation-transcribe-form';
      
      const webhookPayload = {
        file_url: fileUrl,
        upload_id: uploadRecord.id,
        user_id: user.id,
        file_name: file.name,
        file_type: file.type
      };

      console.log('Sending to n8n webhook:', webhookPayload);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });

      if (!response.ok) {
        console.error('Webhook response not ok:', response.status, response.statusText);
        throw new Error(`Webhook failed: ${response.status}`);
      }

      const webhookResult = await response.json();
      console.log('Webhook response:', webhookResult);

      setUploadProgress(100);

      toast({
        title: "Upload successful",
        description: "Your pitch deck is being processed. You'll be notified when it's ready.",
      });

      return uploadRecord.id;

    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred while uploading your file",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getPitchDeckUpload = async (uploadId: string): Promise<PitchDeckUpload | null> => {
    try {
      const { data, error } = await supabase
        .from('pitch_deck_uploads')
        .select('*')
        .eq('id', uploadId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching pitch deck upload:', error);
      return null;
    }
  };

  return {
    uploadPitchDeck,
    getPitchDeckUpload,
    isUploading,
    uploadProgress
  };
};
