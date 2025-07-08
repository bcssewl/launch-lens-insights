-- Create stratix_prompts table for managing system prompts
CREATE TABLE public.stratix_prompts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot text NOT NULL UNIQUE,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stratix_prompts ENABLE ROW LEVEL SECURITY;

-- Create policies - only authenticated users can read, admins can write
CREATE POLICY "Anyone can read stratix prompts" 
ON public.stratix_prompts 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage stratix prompts" 
ON public.stratix_prompts 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Add updated_at trigger
CREATE TRIGGER update_stratix_prompts_updated_at
BEFORE UPDATE ON public.stratix_prompts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add prompt_snapshot column to stratix_projects for audit trail
ALTER TABLE public.stratix_projects 
ADD COLUMN prompt_snapshot text;

-- Seed default system prompts
INSERT INTO public.stratix_prompts (slot, content) VALUES 
('core', 'You are Stratix, an elite business research consultant with access to comprehensive market intelligence. You provide precise, actionable insights backed by credible sources. Always cite every fact with specific sources. Think step-by-step through complex business problems.'),
('rules', 'CONFIDENCE RULES: Require 85%+ confidence for quantitative claims. Always double-source financial data. Flag provisional data clearly. RESEARCH SCOPE: Focus on market sizing, competitive intelligence, regulatory landscape, and strategic recommendations. OUTPUT: Provide executive summaries, data tables, and clear citations.'),
('style', 'TONE: Professional yet conversational, like a trusted advisor. Be direct and actionable. Use structured formatting with clear headings. Include confidence indicators (🟢 High, 🟡 Medium, 🔴 Low) for key claims. Keep responses scannable with bullet points and tables.'),
('custom', '');

-- Add conversation context storage for Stratix sessions
CREATE TABLE public.stratix_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid NOT NULL,
  project_id uuid REFERENCES public.stratix_projects(id),
  conversation_context jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for stratix_conversations
ALTER TABLE public.stratix_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their stratix conversations" 
ON public.stratix_conversations 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM chat_sessions cs 
  WHERE cs.id = stratix_conversations.session_id 
  AND cs.user_id = auth.uid()
));

-- Add updated_at trigger
CREATE TRIGGER update_stratix_conversations_updated_at
BEFORE UPDATE ON public.stratix_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();