-- Create RLS policies for client-files storage bucket
-- Users can only upload files to their own client's directories
CREATE POLICY "Users can upload to their own client files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'client-files' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM clients 
    WHERE clients.id = (storage.foldername(name))[1] 
    AND clients.user_id = auth.uid()
  )
);

-- Users can view files from their own clients
CREATE POLICY "Users can view their own client files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'client-files' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM clients 
    WHERE clients.id = (storage.foldername(name))[1] 
    AND clients.user_id = auth.uid()
  )
);

-- Users can update their own client files
CREATE POLICY "Users can update their own client files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'client-files' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM clients 
    WHERE clients.id = (storage.foldername(name))[1] 
    AND clients.user_id = auth.uid()
  )
);

-- Users can delete their own client files
CREATE POLICY "Users can delete their own client files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'client-files' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM clients 
    WHERE clients.id = (storage.foldername(name))[1] 
    AND clients.user_id = auth.uid()
  )
);