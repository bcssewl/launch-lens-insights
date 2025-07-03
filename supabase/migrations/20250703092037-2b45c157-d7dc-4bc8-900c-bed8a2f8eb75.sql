
-- Create canvas_documents table to store the main document content
CREATE TABLE public.canvas_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users NOT NULL
);

-- Create canvas_versions table to store document versions
CREATE TABLE public.canvas_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.canvas_documents(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by_user BOOLEAN NOT NULL DEFAULT true
);

-- Add RLS policies for canvas_documents
ALTER TABLE public.canvas_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own documents" 
  ON public.canvas_documents 
  FOR SELECT 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own documents" 
  ON public.canvas_documents 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own documents" 
  ON public.canvas_documents 
  FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own documents" 
  ON public.canvas_documents 
  FOR DELETE 
  USING (auth.uid() = created_by);

-- Add RLS policies for canvas_versions
ALTER TABLE public.canvas_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view versions of their documents" 
  ON public.canvas_versions 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.canvas_documents 
    WHERE id = canvas_versions.document_id 
    AND created_by = auth.uid()
  ));

CREATE POLICY "Users can create versions of their documents" 
  ON public.canvas_versions 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.canvas_documents 
    WHERE id = canvas_versions.document_id 
    AND created_by = auth.uid()
  ));

-- Create function to automatically increment version numbers
CREATE OR REPLACE FUNCTION public.increment_version_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version_number := COALESCE(
    (SELECT MAX(version_number) FROM canvas_versions WHERE document_id = NEW.document_id), 0
  ) + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-increment version numbers
CREATE TRIGGER set_version_number
  BEFORE INSERT ON public.canvas_versions
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_version_number();

-- Create function to automatically create versions when document is updated
CREATE OR REPLACE FUNCTION public.create_version_on_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create version if content actually changed
  IF OLD.content IS DISTINCT FROM NEW.content OR OLD.title IS DISTINCT FROM NEW.title THEN
    INSERT INTO canvas_versions (document_id, title, content, created_by_user)
    VALUES (NEW.id, NEW.title, NEW.content, false);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create versions on document updates
CREATE TRIGGER create_version_on_document_update
  AFTER UPDATE ON public.canvas_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.create_version_on_update();

-- Add updated_at trigger for canvas_documents
CREATE TRIGGER update_canvas_documents_updated_at
  BEFORE UPDATE ON public.canvas_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
