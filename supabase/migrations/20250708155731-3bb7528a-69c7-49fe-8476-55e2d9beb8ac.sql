
-- Create research projects table
CREATE TABLE public.research_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  research_domain TEXT NOT NULL CHECK (research_domain IN ('market_research', 'competitive_analysis', 'cost_benchmarking', 'regulatory_scan', 'trend_analysis', 'lead_generation')),
  query TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create research results table
CREATE TABLE public.research_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  result_type TEXT NOT NULL CHECK (result_type IN ('markdown', 'json', 'citations')),
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create research citations table
CREATE TABLE public.research_citations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL,
  source_url TEXT,
  citation_text TEXT NOT NULL,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create research API usage tracking table
CREATE TABLE public.research_api_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  api_name TEXT NOT NULL,
  requests_count INTEGER NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, api_name, date)
);

-- Create research cache table
CREATE TABLE public.research_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.research_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_cache ENABLE ROW LEVEL SECURITY;

-- Create policies for research_projects
CREATE POLICY "Users can view their own research projects" ON public.research_projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own research projects" ON public.research_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own research projects" ON public.research_projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own research projects" ON public.research_projects
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for research_results
CREATE POLICY "Users can view their own research results" ON public.research_results
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM research_projects rp 
    WHERE rp.id = research_results.project_id AND rp.user_id = auth.uid()
  ));

CREATE POLICY "Users can create research results for their projects" ON public.research_results
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM research_projects rp 
    WHERE rp.id = research_results.project_id AND rp.user_id = auth.uid()
  ));

-- Create policies for research_citations
CREATE POLICY "Users can view their own research citations" ON public.research_citations
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM research_projects rp 
    WHERE rp.id = research_citations.project_id AND rp.user_id = auth.uid()
  ));

CREATE POLICY "Users can create research citations for their projects" ON public.research_citations
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM research_projects rp 
    WHERE rp.id = research_citations.project_id AND rp.user_id = auth.uid()
  ));

-- Create policies for research_api_usage
CREATE POLICY "Users can view their own API usage" ON public.research_api_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API usage" ON public.research_api_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API usage" ON public.research_api_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for research_cache (service role access)
CREATE POLICY "Service role can manage research cache" ON public.research_cache
  FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX idx_research_projects_user_id ON public.research_projects(user_id);
CREATE INDEX idx_research_projects_status ON public.research_projects(status);
CREATE INDEX idx_research_results_project_id ON public.research_results(project_id);
CREATE INDEX idx_research_citations_project_id ON public.research_citations(project_id);
CREATE INDEX idx_research_api_usage_user_date ON public.research_api_usage(user_id, date);
CREATE INDEX idx_research_cache_key ON public.research_cache(cache_key);
CREATE INDEX idx_research_cache_expires ON public.research_cache(expires_at);

-- Create function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_research_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM public.research_cache WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;
