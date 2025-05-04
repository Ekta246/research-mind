-- Create projects table with TEXT IDs but proper UUID format for user_id
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- For development without authentication, insert a dummy project with proper UUID format
INSERT INTO public.projects (name, description, user_id)
VALUES 
  ('Sample Project 1', 'This is a sample project for testing', '00000000-0000-0000-0000-000000000000'::UUID),
  ('AI Research Overview', 'Collection of papers on AI fundamentals', '00000000-0000-0000-0000-000000000000'::UUID),
  ('Climate Change Meta-Analysis', 'Papers related to climate science and impacts', '00000000-0000-0000-0000-000000000000'::UUID);

-- Enable Row Level Security but with a permissive policy for development
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for development
CREATE POLICY "Development allow all operations"
ON public.projects
FOR ALL
USING (true)
WITH CHECK (true);

-- When you're ready for production, replace with proper policies:
/*
-- Create policy for users to see only their own projects
CREATE POLICY "Users can view their own projects" 
ON public.projects FOR SELECT
USING (auth.uid() = user_id);

-- Create policy for users to insert their own projects
CREATE POLICY "Users can insert their own projects" 
ON public.projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own projects
CREATE POLICY "Users can update their own projects" 
ON public.projects FOR UPDATE
USING (auth.uid() = user_id);

-- Create policy for users to delete their own projects
CREATE POLICY "Users can delete their own projects" 
ON public.projects FOR DELETE
USING (auth.uid() = user_id);
*/ 