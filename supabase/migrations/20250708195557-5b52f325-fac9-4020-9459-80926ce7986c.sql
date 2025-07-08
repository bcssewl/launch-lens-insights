-- Add prompt_snapshot column to stratix_projects for audit trail (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'stratix_projects' 
                   AND column_name = 'prompt_snapshot') THEN
        ALTER TABLE public.stratix_projects ADD COLUMN prompt_snapshot text;
    END IF;
END $$;

-- Create conversation context storage for Stratix sessions (if not exists)
CREATE TABLE IF NOT EXISTS public.stratix_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid NOT NULL,
  project_id uuid REFERENCES public.stratix_projects(id),
  conversation_context jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for stratix_conversations
ALTER TABLE public.stratix_conversations ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "Users can manage their stratix conversations" ON public.stratix_conversations;

CREATE POLICY "Users can manage their stratix conversations" 
ON public.stratix_conversations 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM chat_sessions cs 
  WHERE cs.id = stratix_conversations.session_id 
  AND cs.user_id = auth.uid()
));

-- Add updated_at trigger if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_stratix_conversations_updated_at') THEN
        CREATE TRIGGER update_stratix_conversations_updated_at
        BEFORE UPDATE ON public.stratix_conversations
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;