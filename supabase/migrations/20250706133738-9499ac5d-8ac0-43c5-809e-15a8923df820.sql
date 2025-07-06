
-- Add client_id column to validation_reports for optional one-to-many relationship
ALTER TABLE validation_reports ADD COLUMN client_id TEXT REFERENCES clients(id);

-- Create junction table for many-to-many report-client relationships
CREATE TABLE client_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  report_id UUID NOT NULL REFERENCES validation_reports(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(client_id, report_id)
);

-- Enable RLS on client_reports
ALTER TABLE client_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for client_reports
CREATE POLICY "Users can view their client reports" 
  ON client_reports 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = client_reports.client_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their client reports" 
  ON client_reports 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = client_reports.client_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their client reports" 
  ON client_reports 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = client_reports.client_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their client reports" 
  ON client_reports 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.id = client_reports.client_id 
      AND c.user_id = auth.uid()
    )
  );

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_client_reports_updated_at
    BEFORE UPDATE ON client_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
