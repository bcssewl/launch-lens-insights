
-- Create client_file_versions table to store file versions
CREATE TABLE public.client_file_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_file_id UUID NOT NULL REFERENCES client_files(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(parent_file_id, version_number)
);

-- Add version tracking columns to client_files table
ALTER TABLE public.client_files 
ADD COLUMN version_count INTEGER NOT NULL DEFAULT 1,
ADD COLUMN current_version INTEGER NOT NULL DEFAULT 1,
ADD COLUMN has_versions BOOLEAN NOT NULL DEFAULT false;

-- Enable RLS on client_file_versions
ALTER TABLE public.client_file_versions ENABLE ROW LEVEL SECURITY;

-- RLS policies for client_file_versions
CREATE POLICY "Users can view their client file versions" 
  ON client_file_versions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM client_files cf 
      WHERE cf.id = client_file_versions.parent_file_id 
      AND cf.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their client file versions" 
  ON client_file_versions 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM client_files cf 
      WHERE cf.id = client_file_versions.parent_file_id 
      AND cf.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their client file versions" 
  ON client_file_versions 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM client_files cf 
      WHERE cf.id = client_file_versions.parent_file_id 
      AND cf.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their client file versions" 
  ON client_file_versions 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM client_files cf 
      WHERE cf.id = client_file_versions.parent_file_id 
      AND cf.user_id = auth.uid()
    )
  );

-- Add trigger to update updated_at timestamp on client_file_versions
CREATE TRIGGER update_client_file_versions_updated_at
    BEFORE UPDATE ON client_file_versions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
