
-- Create waitlist_signups table
CREATE TABLE public.waitlist_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  referral_source TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (public waitlist)
CREATE POLICY "Anyone can join waitlist"
ON public.waitlist_signups FOR INSERT
WITH CHECK (true);

-- Create policy to prevent public reading of waitlist data
CREATE POLICY "Only authenticated users can view waitlist"
ON public.waitlist_signups FOR SELECT
USING (false);

-- Add updated_at trigger
CREATE TRIGGER update_waitlist_signups_updated_at
  BEFORE UPDATE ON public.waitlist_signups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
