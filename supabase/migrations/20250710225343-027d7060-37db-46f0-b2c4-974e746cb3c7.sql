-- Create Stratix database tables for Railway agent integration

-- Projects table to track research sessions
CREATE TABLE public.stratix_projects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  session_id uuid NOT NULL,
  prompt text NOT NULL,
  status text NOT NULL DEFAULT 'initializing',
  prompt_snapshot text,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Results table to store research findings
CREATE TABLE public.stratix_results (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.stratix_projects(id) ON DELETE CASCADE,
  content text NOT NULL,
  agents_consulted text[],
  primary_agent text,
  confidence numeric,
  methodology text,
  processing_time numeric,
  analysis_depth text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Citations table to store clickable source links
CREATE TABLE public.stratix_citations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.stratix_projects(id) ON DELETE CASCADE,
  source_name text NOT NULL,
  source_url text,
  source_type text DEFAULT 'Research',
  clickable boolean DEFAULT true,
  agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Events table for real-time streaming
CREATE TABLE public.stratix_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.stratix_projects(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_data jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.stratix_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stratix_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stratix_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stratix_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for stratix_projects
CREATE POLICY "Users can manage their own projects" 
ON public.stratix_projects 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM chat_sessions cs 
  WHERE cs.id = stratix_projects.session_id 
  AND cs.user_id = auth.uid()
));

-- RLS policies for stratix_results
CREATE POLICY "Users can manage their project results" 
ON public.stratix_results 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM stratix_projects sp
  JOIN chat_sessions cs ON cs.id = sp.session_id
  WHERE sp.id = stratix_results.project_id 
  AND cs.user_id = auth.uid()
));

-- RLS policies for stratix_citations
CREATE POLICY "Users can manage their project citations" 
ON public.stratix_citations 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM stratix_projects sp
  JOIN chat_sessions cs ON cs.id = sp.session_id
  WHERE sp.id = stratix_citations.project_id 
  AND cs.user_id = auth.uid()
));

-- RLS policies for stratix_events
CREATE POLICY "Users can manage their project events" 
ON public.stratix_events 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM stratix_projects sp
  JOIN chat_sessions cs ON cs.id = sp.session_id
  WHERE sp.id = stratix_events.project_id 
  AND cs.user_id = auth.uid()
));

-- Add updated_at triggers
CREATE TRIGGER update_stratix_projects_updated_at
BEFORE UPDATE ON public.stratix_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_stratix_projects_session_id ON public.stratix_projects(session_id);
CREATE INDEX idx_stratix_projects_status ON public.stratix_projects(status);
CREATE INDEX idx_stratix_results_project_id ON public.stratix_results(project_id);
CREATE INDEX idx_stratix_citations_project_id ON public.stratix_citations(project_id);
CREATE INDEX idx_stratix_events_project_id ON public.stratix_events(project_id);
CREATE INDEX idx_stratix_events_created_at ON public.stratix_events(created_at);