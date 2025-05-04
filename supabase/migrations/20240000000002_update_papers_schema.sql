-- Update the papers table schema to ensure it has all required columns
-- and proper constraints

-- First, check if the papers table exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'papers') THEN
    -- Create the papers table if it doesn't exist
    CREATE TABLE papers (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      abstract TEXT,
      authors TEXT,
      year INTEGER,
      journal TEXT,
      citations INTEGER DEFAULT 0,
      url TEXT,
      pdf_url TEXT,
      source TEXT,
      is_favorite BOOLEAN DEFAULT FALSE,
      user_id TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Add indexes for performance
    CREATE INDEX idx_papers_user_id ON papers(user_id);
    CREATE INDEX idx_papers_is_favorite ON papers(is_favorite);
    CREATE INDEX idx_papers_updated_at ON papers(updated_at);
  ELSE
    -- Alter the existing table to ensure it has all required columns
    
    -- Add columns if they don't exist
    BEGIN
      ALTER TABLE papers ADD COLUMN IF NOT EXISTS id TEXT;
      ALTER TABLE papers ADD COLUMN IF NOT EXISTS title TEXT;
      ALTER TABLE papers ADD COLUMN IF NOT EXISTS abstract TEXT;
      ALTER TABLE papers ADD COLUMN IF NOT EXISTS authors TEXT;
      ALTER TABLE papers ADD COLUMN IF NOT EXISTS year INTEGER;
      ALTER TABLE papers ADD COLUMN IF NOT EXISTS journal TEXT;
      ALTER TABLE papers ADD COLUMN IF NOT EXISTS citations INTEGER DEFAULT 0;
      ALTER TABLE papers ADD COLUMN IF NOT EXISTS url TEXT;
      ALTER TABLE papers ADD COLUMN IF NOT EXISTS pdf_url TEXT;
      ALTER TABLE papers ADD COLUMN IF NOT EXISTS source TEXT;
      ALTER TABLE papers ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE;
      ALTER TABLE papers ADD COLUMN IF NOT EXISTS user_id TEXT;
      ALTER TABLE papers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
      ALTER TABLE papers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
    EXCEPTION WHEN OTHERS THEN
      -- Ignore errors (column might already exist)
    END;
    
    -- Make id column primary key if it's not already
    DO $pk$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'papers_pkey'
      ) THEN
        ALTER TABLE papers ADD PRIMARY KEY (id);
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Primary key might already exist
    END $pk$;
    
    -- Add indexes if they don't exist
    DO $idx$ 
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_papers_user_id') THEN
        CREATE INDEX idx_papers_user_id ON papers(user_id);
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_papers_is_favorite') THEN
        CREATE INDEX idx_papers_is_favorite ON papers(is_favorite);
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_papers_updated_at') THEN
        CREATE INDEX idx_papers_updated_at ON papers(updated_at);
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Indexes might already exist
    END $idx$;
  END IF;
END $$; 