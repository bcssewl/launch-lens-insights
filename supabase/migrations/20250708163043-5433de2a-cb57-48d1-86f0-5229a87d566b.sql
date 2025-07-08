-- Create Stratix research agent tables (isolated from existing research tables)

-- Stratix projects table
CREATE TABLE public.stratix_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued', -- queued | running | needs_review | done
  deep_dive BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Stratix results table  
CREATE TABLE public.stratix_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.stratix_projects(id) ON DELETE CASCADE,
  section TEXT NOT NULL, -- e.g. 'market_size', 'competitor_analysis'
  content JSONB NOT NULL, -- markdown or structured JSON
  confidence NUMERIC NOT NULL DEFAULT 0.0,
  provisional BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Stratix citations table
CREATE TABLE public.stratix_citations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  result_id UUID NOT NULL REFERENCES public.stratix_results(id) ON DELETE CASCADE,
  citation_key TEXT NOT NULL, -- e.g. '[3]'
  title TEXT NOT NULL,
  url TEXT,
  weight NUMERIC NOT NULL DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Stratix vectors for pgvector storage
CREATE TABLE public.stratix_vectors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.stratix_projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI embedding dimensions
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all Stratix tables
ALTER TABLE public.stratix_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stratix_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stratix_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stratix_vectors ENABLE ROW LEVEL SECURITY;

-- RLS policies for stratix_projects
CREATE POLICY "Users can create their own stratix projects" ON public.stratix_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own stratix projects" ON public.stratix_projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stratix projects" ON public.stratix_projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stratix projects" ON public.stratix_projects
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for stratix_results
CREATE POLICY "Users can create stratix results for their projects" ON public.stratix_results
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stratix_projects 
      WHERE id = stratix_results.project_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view stratix results for their projects" ON public.stratix_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.stratix_projects 
      WHERE id = stratix_results.project_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update stratix results for their projects" ON public.stratix_results
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.stratix_projects 
      WHERE id = stratix_results.project_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete stratix results for their projects" ON public.stratix_results
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.stratix_projects 
      WHERE id = stratix_results.project_id AND user_id = auth.uid()
    )
  );

-- RLS policies for stratix_citations
CREATE POLICY "Users can create citations for their results" ON public.stratix_citations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stratix_results sr
      JOIN public.stratix_projects sp ON sr.project_id = sp.id
      WHERE sr.id = stratix_citations.result_id AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view citations for their results" ON public.stratix_citations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.stratix_results sr
      JOIN public.stratix_projects sp ON sr.project_id = sp.id
      WHERE sr.id = stratix_citations.result_id AND sp.user_id = auth.uid()
    )
  );

-- RLS policies for stratix_vectors
CREATE POLICY "Users can create vectors for their projects" ON public.stratix_vectors
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stratix_projects 
      WHERE id = stratix_vectors.project_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view vectors for their projects" ON public.stratix_vectors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.stratix_projects 
      WHERE id = stratix_vectors.project_id AND user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_stratix_results_project_id ON public.stratix_results(project_id);
CREATE INDEX idx_stratix_citations_result_id ON public.stratix_citations(result_id);
CREATE INDEX idx_stratix_vectors_project_id ON public.stratix_vectors(project_id);

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_stratix_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stratix_projects_updated_at
  BEFORE UPDATE ON public.stratix_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_stratix_updated_at();

CREATE TRIGGER update_stratix_results_updated_at
  BEFORE UPDATE ON public.stratix_results
  FOR EACH ROW EXECUTE FUNCTION public.update_stratix_updated_at();