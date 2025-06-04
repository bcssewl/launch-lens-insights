
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface AudioRecording {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  duration_seconds?: number;
  transcription_text?: string;
  processing_status: string;
  transcription_completed_at?: string;
  validation_id?: string;
  created_at: string;
  updated_at: string;
}

export const useAudioRecordings = () => {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { user } = useAuth();

  const uploadAudioRecording = async (
    audioBlob: Blob,
    fileName: string,
    durationSeconds?: number
  ): Promise<AudioRecording | null> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload audio recordings.",
        variant: "destructive",
      });
      return null;
    }

    try {
      setUploading(true);

      // Create unique file path with user ID
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileExtension = fileName.split('.').pop() || 'webm';
      const uniqueFileName = `${timestamp}_${fileName}`;
      const filePath = `${user.id}/${uniqueFileName}`;

      console.log('Uploading audio file:', { fileName: uniqueFileName, filePath, size: audioBlob.size });

      // Upload audio file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio-recordings')
        .upload(filePath, audioBlob, {
          contentType: audioBlob.type || 'audio/webm',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Audio file uploaded successfully:', uploadData);

      // Create database record
      const { data: recordData, error: recordError } = await supabase
        .from('audio_recordings')
        .insert({
          user_id: user.id,
          file_name: uniqueFileName,
          file_path: filePath,
          file_size: audioBlob.size,
          duration_seconds: durationSeconds,
          processing_status: 'uploaded'
        })
        .select()
        .single();

      if (recordError) {
        console.error('Database record error:', recordError);
        throw recordError;
      }

      console.log('Audio recording record created:', recordData);

      toast({
        title: "Audio Uploaded",
        description: "Your audio recording has been saved successfully.",
      });

      return recordData;
    } catch (error) {
      console.error('Error uploading audio recording:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload audio recording. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const transcribeAudioWithN8n = async (recordingId: string): Promise<string | null> => {
    if (!user) return null;

    try {
      setProcessing(true);

      // Get the recording details
      const { data: recording, error: fetchError } = await supabase
        .from('audio_recordings')
        .select('*')
        .eq('id', recordingId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      // Update status to processing
      await updateAudioRecording(recordingId, { processing_status: 'transcribing' });

      // Get the audio file URL
      const { data: urlData } = await supabase.storage
        .from('audio-recordings')
        .createSignedUrl(recording.file_path, 3600); // 1 hour expiry

      if (!urlData?.signedUrl) {
        throw new Error('Failed to get audio file URL');
      }

      console.log('Sending audio to n8n webhook for transcription...');

      // Send to n8n webhook
      const response = await fetch('https://n8n-launchlens.botica.it.com/webhook/audio-transcribe-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_url: urlData.signedUrl,
          recording_id: recordingId,
          user_id: user.id,
          file_name: recording.file_name,
          duration_seconds: recording.duration_seconds
        })
      });

      if (!response.ok) {
        throw new Error(`N8n webhook failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('N8n transcription response:', result);

      // Update the recording with transcription results
      await updateAudioRecording(recordingId, {
        transcription_text: result.transcription || result.text,
        processing_status: 'completed',
        transcription_completed_at: new Date().toISOString()
      });

      toast({
        title: "Transcription Complete",
        description: "Your audio has been transcribed successfully.",
      });

      return result.transcription || result.text;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      
      // Update status to failed
      await updateAudioRecording(recordingId, { processing_status: 'failed' });
      
      toast({
        title: "Transcription Failed",
        description: "Failed to transcribe audio. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setProcessing(false);
    }
  };

  const updateAudioRecording = async (
    recordingId: string,
    updates: Partial<AudioRecording>
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('audio_recordings')
        .update(updates)
        .eq('id', recordingId)
        .eq('user_id', user.id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error updating audio recording:', error);
      return false;
    }
  };

  const getAudioRecordings = async (): Promise<AudioRecording[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('audio_recordings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching audio recordings:', error);
      return [];
    }
  };

  const deleteAudioRecording = async (recordingId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // First get the recording to get the file path
      const { data: recording, error: fetchError } = await supabase
        .from('audio_recordings')
        .select('file_path')
        .eq('id', recordingId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('audio-recordings')
        .remove([recording.file_path]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('audio_recordings')
        .delete()
        .eq('id', recordingId)
        .eq('user_id', user.id);

      if (dbError) throw dbError;

      toast({
        title: "Recording Deleted",
        description: "Audio recording has been deleted successfully.",
      });

      return true;
    } catch (error) {
      console.error('Error deleting audio recording:', error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete audio recording.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    uploading,
    processing,
    uploadAudioRecording,
    transcribeAudioWithN8n,
    updateAudioRecording,
    getAudioRecordings,
    deleteAudioRecording
  };
};
