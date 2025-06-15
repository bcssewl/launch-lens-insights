
-- Create storage bucket for pitch deck files
INSERT INTO storage.buckets (id, name, public)
VALUES ('pitch-deck-files', 'pitch-deck-files', false);

-- Create RLS policies for pitch deck files bucket
CREATE POLICY "Users can upload their own pitch deck files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'pitch-deck-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own pitch deck files"
ON storage.objects FOR SELECT
USING (bucket_id = 'pitch-deck-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own pitch deck files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'pitch-deck-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own pitch deck files"
ON storage.objects FOR DELETE
USING (bucket_id = 'pitch-deck-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create pitch_deck_uploads table to track uploaded files
CREATE TABLE public.pitch_deck_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT NOT NULL,
  processing_status TEXT NOT NULL DEFAULT 'uploaded',
  transcription_text TEXT,
  transcription_completed_at TIMESTAMP WITH TIME ZONE,
  validation_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for pitch_deck_uploads table
ALTER TABLE public.pitch_deck_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pitch deck uploads"
ON public.pitch_deck_uploads FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pitch deck uploads"
ON public.pitch_deck_uploads FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pitch deck uploads"
ON public.pitch_deck_uploads FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pitch deck uploads"
ON public.pitch_deck_uploads FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_pitch_deck_uploads_updated_at
  BEFORE UPDATE ON public.pitch_deck_uploads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
