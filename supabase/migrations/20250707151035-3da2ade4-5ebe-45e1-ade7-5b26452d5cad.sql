-- Create a function to search chat sessions and messages
CREATE OR REPLACE FUNCTION search_user_chats(
  user_id UUID,
  search_query TEXT,
  match_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
  session_id UUID,
  session_title TEXT,
  session_created_at TIMESTAMP WITH TIME ZONE,
  message_snippet TEXT,
  rank REAL
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH chat_matches AS (
    -- Search in chat session titles
    SELECT 
      cs.id as session_id,
      cs.title as session_title,
      cs.created_at as session_created_at,
      cs.title as message_snippet,
      ts_rank(cs.search_body, websearch_to_tsquery('english', search_query)) as rank
    FROM chat_sessions cs
    WHERE cs.user_id = search_user_chats.user_id 
      AND cs.search_body @@ websearch_to_tsquery('english', search_query)
    
    UNION ALL
    
    -- Search in chat messages
    SELECT 
      nch.session_id,
      cs.title as session_title,
      cs.created_at as session_created_at,
      LEFT(nch.message, 150) || '...' as message_snippet,
      ts_rank(nch.search_body, websearch_to_tsquery('english', search_query)) as rank
    FROM n8n_chat_history nch
    JOIN chat_sessions cs ON nch.session_id = cs.id
    WHERE cs.user_id = search_user_chats.user_id
      AND nch.search_body @@ websearch_to_tsquery('english', search_query)
  )
  SELECT DISTINCT ON (cm.session_id)
    cm.session_id,
    cm.session_title,
    cm.session_created_at,
    cm.message_snippet,
    cm.rank
  FROM chat_matches cm
  ORDER BY cm.session_id, cm.rank DESC
  LIMIT match_limit;
END;
$$;