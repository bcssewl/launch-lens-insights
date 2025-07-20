
-- Add client_message_id column to n8n_chat_history table for request-response correlation
ALTER TABLE public.n8n_chat_history 
ADD COLUMN client_message_id uuid;

-- Add index for efficient lookups by client_message_id
CREATE INDEX idx_n8n_chat_history_client_message_id 
ON public.n8n_chat_history(client_message_id);

-- Add comment to document the purpose
COMMENT ON COLUMN public.n8n_chat_history.client_message_id 
IS 'Frontend-generated UUID to correlate requests with responses';
