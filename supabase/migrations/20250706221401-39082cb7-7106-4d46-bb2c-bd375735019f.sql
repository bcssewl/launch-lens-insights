
-- Create query cache table for storing previous Nexus questions and answers
CREATE TABLE public.nexus_query_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  file_id UUID REFERENCES client_files(id),
  question_hash TEXT NOT NULL, -- Hash of the normalized question for fast lookup
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  context_used TEXT,
  gemini_model_used TEXT DEFAULT 'gemini-1.5-flash',
  api_cost_estimate DECIMAL(10,6) DEFAULT 0, -- Track API costs
  response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  use_count INTEGER NOT NULL DEFAULT 1,
  is_valid BOOLEAN NOT NULL DEFAULT true -- For invalidating outdated cache entries
);

-- Add indexes for fast query lookup
CREATE INDEX idx_nexus_query_cache_user_file ON nexus_query_cache(user_id, file_id);
CREATE INDEX idx_nexus_query_cache_hash ON nexus_query_cache(question_hash);
CREATE INDEX idx_nexus_query_cache_created_at ON nexus_query_cache(created_at DESC);

-- Add RLS policies
ALTER TABLE public.nexus_query_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own query cache" 
  ON public.nexus_query_cache 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own query cache" 
  ON public.nexus_query_cache 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own query cache" 
  ON public.nexus_query_cache 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own query cache" 
  ON public.nexus_query_cache 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Add processing queue table for background file processing
CREATE TABLE public.file_processing_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID NOT NULL REFERENCES client_files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  processing_status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed, retrying
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for processing queue
CREATE INDEX idx_file_processing_queue_status ON file_processing_queue(processing_status);
CREATE INDEX idx_file_processing_queue_scheduled ON file_processing_queue(scheduled_at);
CREATE INDEX idx_file_processing_queue_file_id ON file_processing_queue(file_id);

-- Add RLS policies for processing queue
ALTER TABLE public.file_processing_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own processing queue" 
  ON public.file_processing_queue 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage processing queue" 
  ON public.file_processing_queue 
  FOR ALL 
  USING (true);

-- Add updated_at trigger for processing queue
CREATE OR REPLACE FUNCTION update_processing_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_file_processing_queue_updated_at
  BEFORE UPDATE ON file_processing_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_processing_queue_updated_at();

-- Add function to normalize questions for caching
CREATE OR REPLACE FUNCTION normalize_question(question_text TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Remove extra whitespace, convert to lowercase, remove common punctuation
  RETURN TRIM(REGEXP_REPLACE(LOWER(question_text), '[?.!,;:\s]+', ' ', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Add function to generate question hash
CREATE OR REPLACE FUNCTION generate_question_hash(question_text TEXT, file_id UUID DEFAULT NULL)
RETURNS TEXT AS $$
BEGIN
  -- Create a hash based on normalized question and optional file_id
  RETURN encode(digest(
    normalize_question(question_text) || COALESCE(file_id::TEXT, ''), 
    'sha256'
  ), 'hex');
END;
$$ LANGUAGE plpgsql;
