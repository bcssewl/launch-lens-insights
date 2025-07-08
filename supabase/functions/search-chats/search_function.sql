
-- This is a reference SQL function that should be added to the database
-- The actual implementation will be added via a separate SQL migration

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
      ts_headline('simple', cs.title, websearch_to_tsquery('simple', search_query)) as snippet,
      cs.created_at,
      1.0 as relevance_score
    FROM chat_sessions cs
    WHERE cs.user_id = search_chat_sessions.user_id
      AND cs.search_body @@ websearch_to_tsquery('simple', search_query)
  ),
  message_matches AS (
    -- Search in recent messages (last 5 per session)
    SELECT DISTINCT
      cs.id as session_id,
      cs.title,
      ts_headline('simple', recent_messages.message, websearch_to_tsquery('simple', search_query)) as snippet,
      cs.created_at,
      0.8 as relevance_score
    FROM chat_sessions cs
    JOIN LATERAL (
      SELECT nch.message
      FROM n8n_chat_history nch
      WHERE nch.session_id = cs.id
        AND nch.search_body @@ websearch_to_tsquery('simple', search_query)
      ORDER BY nch.created_at DESC
      LIMIT 5
    ) recent_messages ON true
    WHERE cs.user_id = search_chat_sessions.user_id
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
  ORDER BY cr.relevance_score DESC, cr.created_at DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
