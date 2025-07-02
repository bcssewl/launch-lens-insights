
-- Create canvas_documents table for storing documents
CREATE TABLE public.canvas_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID REFERENCES public.chat_sessions(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'general_report',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create canvas_versions table for version history
CREATE TABLE public.canvas_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.canvas_documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by_user BOOLEAN NOT NULL DEFAULT false
);

-- Add Row Level Security (RLS) for canvas_documents
ALTER TABLE public.canvas_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for canvas_documents
CREATE POLICY "Users can view their own documents" 
  ON public.canvas_documents 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents" 
  ON public.canvas_documents 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" 
  ON public.canvas_documents 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" 
  ON public.canvas_documents 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add Row Level Security (RLS) for canvas_versions
ALTER TABLE public.canvas_versions ENABLE ROW LEVEL SECURITY;

-- Create policies for canvas_versions
CREATE POLICY "Users can view versions of their documents" 
  ON public.canvas_versions 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.canvas_documents cd 
    WHERE cd.id = canvas_versions.document_id AND cd.user_id = auth.uid()
  ));

CREATE POLICY "Users can create versions for their documents" 
  ON public.canvas_versions 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.canvas_documents cd 
    WHERE cd.id = canvas_versions.document_id AND cd.user_id = auth.uid()
  ));

-- Create trigger to auto-increment version numbers
CREATE OR REPLACE FUNCTION increment_version_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version_number := COALESCE(
    (SELECT MAX(version_number) FROM canvas_versions WHERE document_id = NEW.document_id), 0
  ) + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_version_number
  BEFORE INSERT ON canvas_versions
  FOR EACH ROW
  EXECUTE FUNCTION increment_version_number();

-- Create trigger to auto-create version when document is updated
CREATE OR REPLACE FUNCTION create_version_on_update()
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

CREATE TRIGGER trigger_create_version_on_update
  AFTER UPDATE ON canvas_documents
  FOR EACH ROW
  EXECUTE FUNCTION create_version_on_update();
