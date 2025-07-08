-- Create stratix_events table for progress tracking
CREATE TABLE IF NOT EXISTS public.stratix_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.stratix_projects(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  progress_percentage integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for stratix_events
ALTER TABLE public.stratix_events ENABLE ROW LEVEL SECURITY;

-- Create policy for stratix_events
CREATE POLICY "Users can view events for their projects" 
ON public.stratix_events 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM stratix_projects sp 
  WHERE sp.id = stratix_events.project_id 
  AND sp.user_id = auth.uid()
));

CREATE POLICY "Service can manage all stratix events" 
ON public.stratix_events 
FOR ALL 
USING (true);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_stratix_events_project_created 
ON public.stratix_events(project_id, created_at DESC);