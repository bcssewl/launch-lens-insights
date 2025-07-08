
-- Add full-text search capabilities to n8n_chat_history table
ALTER TABLE n8n_chat_history 
ADD COLUMN IF NOT EXISTS search_body tsvector 
GENERATED ALWAYS AS (to_tsvector('simple', coalesce(message, ''))) STORED;

-- Create GIN index for efficient full-text search
CREATE INDEX IF NOT EXISTS n8n_chat_history_search_idx 
ON n8n_chat_history USING gin(search_body);

-- Also add search capabilities to chat_sessions for title search
ALTER TABLE chat_sessions 
ADD COLUMN IF NOT EXISTS search_body tsvector 
GENERATED ALWAYS AS (to_tsvector('simple', coalesce(title, ''))) STORED;

-- Create GIN index for session title search
CREATE INDEX IF NOT EXISTS chat_sessions_search_idx 
ON chat_sessions USING gin(search_body);
