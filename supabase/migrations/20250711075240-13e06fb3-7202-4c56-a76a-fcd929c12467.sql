-- Clean up stuck projects and add timeout handling
UPDATE stratix_projects 
SET status = 'error' 
WHERE status = 'running' 
AND created_at < NOW() - INTERVAL '30 minutes';

-- Add an index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_stratix_projects_status_created ON stratix_projects(status, created_at);

-- Create a function to clean up stuck projects automatically
CREATE OR REPLACE FUNCTION cleanup_stuck_stratix_projects()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE stratix_projects 
  SET status = 'error' 
  WHERE status = 'running' 
  AND created_at < NOW() - INTERVAL '30 minutes';
END;
$$;