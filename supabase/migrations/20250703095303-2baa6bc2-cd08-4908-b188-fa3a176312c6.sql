
-- Create a table to map messages to canvas documents
CREATE TABLE public.message_canvas_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id TEXT NOT NULL,
  document_id UUID REFERENCES public.canvas_documents(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users NOT NULL,
  UNIQUE(message_id, created_by)
);

-- Add RLS policies for message_canvas_documents
ALTER TABLE public.message_canvas_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own message document mappings" 
  ON public.message_canvas_documents 
  FOR SELECT 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own message document mappings" 
  ON public.message_canvas_documents 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own message document mappings" 
  ON public.message_canvas_documents 
  FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own message document mappings" 
  ON public.message_canvas_documents 
  FOR DELETE 
  USING (auth.uid() = created_by);
