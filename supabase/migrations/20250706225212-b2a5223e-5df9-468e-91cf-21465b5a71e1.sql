
-- Enable pgvector extension for vector operations
CREATE EXTENSION IF NOT EXISTS vector;

-- Create file_embeddings table for storing text chunks and their vector embeddings
CREATE TABLE public.file_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES public.client_files(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  embedding VECTOR(1536) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for file embeddings
ALTER TABLE public.file_embeddings ENABLE ROW LEVEL SECURITY;

-- Users can only access embeddings for files they own
CREATE POLICY "Users can view embeddings for their files" 
  ON public.file_embeddings 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.client_files cf 
    WHERE cf.id = file_embeddings.file_id 
    AND cf.user_id = auth.uid()
  ));

CREATE POLICY "Users can create embeddings for their files" 
  ON public.file_embeddings 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.client_files cf 
    WHERE cf.id = file_embeddings.file_id 
    AND cf.user_id = auth.uid()
  ));

CREATE POLICY "Users can update embeddings for their files" 
  ON public.file_embeddings 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.client_files cf 
    WHERE cf.id = file_embeddings.file_id 
    AND cf.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete embeddings for their files" 
  ON public.file_embeddings 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.client_files cf 
    WHERE cf.id = file_embeddings.file_id 
    AND cf.user_id = auth.uid()
  ));

-- Create vector similarity index for fast cosine similarity searches
CREATE INDEX idx_file_embeddings_vector ON public.file_embeddings 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create regular indexes for performance
CREATE INDEX idx_file_embeddings_file_id ON public.file_embeddings(file_id);
CREATE INDEX idx_file_embeddings_created_at ON public.file_embeddings(created_at);

-- Add unique constraint to prevent duplicate chunks
CREATE UNIQUE INDEX idx_file_embeddings_unique_chunk ON public.file_embeddings(file_id, chunk_index);

-- Add embedding processing status to client_files table
ALTER TABLE public.client_files ADD COLUMN embedding_status TEXT DEFAULT 'pending';
ALTER TABLE public.client_files ADD COLUMN embedding_processed_at TIMESTAMPTZ;
ALTER TABLE public.client_files ADD COLUMN total_chunks INTEGER DEFAULT 0;

-- Update the updated_at trigger for file_embeddings
CREATE OR REPLACE FUNCTION update_file_embeddings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_file_embeddings_updated_at_trigger
  BEFORE UPDATE ON public.file_embeddings
  FOR EACH ROW
  EXECUTE FUNCTION update_file_embeddings_updated_at();
