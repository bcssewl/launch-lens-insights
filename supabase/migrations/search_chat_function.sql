
-- Create the search function for chat sessions
CREATE OR REPLACE FUNCTION search_chat_sessions(
  user_id UUID,
  search_query TEXT,
  result_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  session_id UUID,
  title TEXT,
  snippet TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  WITH session_matches AS (
    -- Search in session titles
    SELECT DISTINCT
      cs.id as session_id,
      cs.title,
      ts_headline('simple', cs.title, websearch_to_tsquery('simple', search_query), 'MaxWords=20, MinWords=5') as snippet,
      cs.created_at,
      2.0 as relevance_score
    FROM chat_sessions cs
    WHERE cs.user_id = search_chat_sessions.user_id
      AND cs.search_body @@ websearch_to_tsquery('simple', search_query)
  ),
  message_matches AS (
    -- Search in recent messages (last 5 per session)
    SELECT DISTINCT ON (cs.id)
      cs.id as session_id,
      cs.title,
      ts_headline('simple', nch.message, websearch_to_tsquery('simple', search_query), 'MaxWords=20, MinWords=5') as snippet,
      cs.created_at,
      1.0 as relevance_score
    FROM chat_sessions cs
    JOIN n8n_chat_history nch ON nch.session_id = cs.id
    WHERE cs.user_id = search_chat_sessions.user_id
      AND nch.search_body @@ websearch_to_tsquery('simple', search_query)
    ORDER BY cs.id, nch.created_at DESC
  ),
  combined_results AS (
    SELECT * FROM session_matches
    UNION ALL
    SELECT * FROM message_matches
  )
  SELECT DISTINCT
    cr.session_id,
    cr.title,
    cr.snippet,
    cr.created_at
  FROM combined_results cr
  ORDER BY MAX(cr.relevance_score) DESC, cr.created_at DESC
  GROUP BY cr.session_id, cr.title, cr.snippet, cr.created_at
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION search_chat_sessions(UUID, TEXT, INTEGER) TO authenticated;
