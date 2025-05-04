-- DEVELOPMENT ONLY: This script sets up tables for development without requiring authentication

-- 1. Create projects table with simplified structure for development
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  description TEXT,
  -- Using TEXT instead of UUID to avoid foreign key constraints during development
  user_id TEXT NOT NULL DEFAULT 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Insert sample projects for development
INSERT INTO public.projects (name, description, user_id)
VALUES 
  ('Sample Project 1', 'This is a sample project for testing', 'dev-user'),
  ('AI Research Overview', 'Collection of papers on AI fundamentals', 'dev-user'),
  ('Climate Change Meta-Analysis', 'Papers related to climate science and impacts', 'dev-user')
ON CONFLICT (id) DO NOTHING;

-- 3. Create a table for project papers (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.project_papers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  paper_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create a papers table for development
CREATE TABLE IF NOT EXISTS public.papers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title TEXT NOT NULL,
  abstract TEXT,
  year INTEGER,
  authors TEXT[] DEFAULT '{}',
  url TEXT,
  pdf_url TEXT,
  user_id TEXT NOT NULL DEFAULT 'dev-user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT,
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  notes TEXT
);

-- 5. Insert sample papers
INSERT INTO public.papers (title, abstract, year, authors, is_favorite, user_id)
VALUES 
  ('Understanding Deep Learning Requires Rethinking Generalization', 
   'Despite their massive size, deep neural networks can generalize well. This paper explores why.', 
   2017, 
   ARRAY['Zhang, C.', 'Bengio, S.', 'Hardt, M.'], 
   true, 
   'dev-user'),
  ('Attention Is All You Need', 
   'We propose a new simple network architecture, the Transformer, based solely on attention mechanisms.', 
   2017, 
   ARRAY['Vaswani, A.', 'Shazeer, N.', 'Parmar, N.'], 
   false, 
   'dev-user')
ON CONFLICT (id) DO NOTHING;

-- 6. Enable Row Level Security but with permissive policies for development
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_papers ENABLE ROW LEVEL SECURITY;

-- 7. Create permissive policies for development
CREATE POLICY "Development projects access"
ON public.projects
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Development papers access"
ON public.papers
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Development project_papers access"
ON public.project_papers
FOR ALL USING (true) WITH CHECK (true);

-- 8. Create a function to get paper count for each project
CREATE OR REPLACE FUNCTION public.get_project_paper_count(project_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  count INTEGER;
BEGIN
  SELECT COUNT(*) INTO count
  FROM public.project_papers
  WHERE project_papers.project_id = $1;
  
  RETURN count;
END;
$$ LANGUAGE plpgsql; 