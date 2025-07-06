
-- Insert two demo clients for demonstration purposes
INSERT INTO clients (id, name, industry, description, potential, user_id, engagement_start, contact_person, contact_email, created_at, updated_at) 
VALUES 
  (
    'acme-corp',
    'Acme Corporation',
    'Technology',
    'Enterprise software solutions and digital transformation consulting',
    'High Potential',
    '00000000-0000-0000-0000-000000000000'::uuid,
    '2024-01-15'::date,
    'John Smith',
    'john.smith@acmecorp.com',
    now(),
    now()
  ),
  (
    'green-energy-co',
    'Green Energy Co',
    'Energy',
    'Renewable energy strategy and sustainability consulting',
    'Medium Potential',
    '00000000-0000-0000-0000-000000000000'::uuid,
    '2024-02-01'::date,
    'Sarah Wilson',
    'sarah.wilson@greenenergy.com',
    now(),
    now()
  );
