
-- Create clients table to store actual client data (replacing mock data)
CREATE TABLE public.clients (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users,
  name TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  potential TEXT,
  contact_person TEXT,
  contact_email TEXT,
  engagement_start DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create client_files table to store file metadata
CREATE TABLE public.client_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  category TEXT,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_files ENABLE ROW LEVEL SECURITY;

-- RLS policies for clients table
CREATE POLICY "Users can view their own clients" 
  ON public.clients 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clients" 
  ON public.clients 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" 
  ON public.clients 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" 
  ON public.clients 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for client_files table
CREATE POLICY "Users can view their client files" 
  ON public.client_files 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their client files" 
  ON public.client_files 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their client files" 
  ON public.client_files 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their client files" 
  ON public.client_files 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create storage bucket for client files
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-files', 'client-files', false);

-- Create storage policies for client-files bucket
CREATE POLICY "Users can view their client files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'client-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their client files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'client-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their client files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'client-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their client files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'client-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create indexes for better performance
CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_client_files_client_id ON public.client_files(client_id);
CREATE INDEX idx_client_files_user_id ON public.client_files(user_id);
CREATE INDEX idx_client_files_upload_date ON public.client_files(upload_date DESC);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_files_updated_at BEFORE UPDATE ON public.client_files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
