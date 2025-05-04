-- Create projects table 
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  description TEXT,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop existing foreign key constraint if it exists
ALTER TABLE IF EXISTS public.projects
DROP CONSTRAINT IF EXISTS projects_user_id_fkey;

-- Create project_papers junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.project_papers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  paper_id TEXT NOT NULL REFERENCES public.papers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, paper_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_project_papers_project_id ON public.project_papers(project_id);
CREATE INDEX IF NOT EXISTS idx_project_papers_paper_id ON public.project_papers(paper_id);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_papers ENABLE ROW LEVEL SECURITY;

-- Create policies for development (allowing all operations)
CREATE POLICY "Development allow all operations on projects"
ON public.projects
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Development allow all operations on project_papers"
ON public.project_papers
FOR ALL
USING (true)
WITH CHECK (true); 