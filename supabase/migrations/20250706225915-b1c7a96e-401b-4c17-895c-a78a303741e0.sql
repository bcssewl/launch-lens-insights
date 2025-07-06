
-- Create the search_file_embeddings function for semantic search
CREATE OR REPLACE FUNCTION search_file_embeddings(
  query_embedding vector(1536),
  client_id text,
  user_id uuid,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  file_id uuid,
  file_name text,
  file_type text,
  file_path text,
  file_size int,
  upload_date timestamptz,
  chunk_text text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cf.id as file_id,
    cf.file_name,
    cf.file_type,
    cf.file_path,
    cf.file_size,
    cf.upload_date,
    fe.chunk_text,
    (1 - (fe.embedding <=> query_embedding)) as similarity
  FROM file_embeddings fe
  JOIN client_files cf ON fe.file_id = cf.id
  WHERE cf.client_id = search_file_embeddings.client_id
    AND cf.user_id = search_file_embeddings.user_id
    AND (1 - (fe.embedding <=> query_embedding)) > match_threshold
  ORDER BY fe.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
