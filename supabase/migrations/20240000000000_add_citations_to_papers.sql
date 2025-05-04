-- Add citations column to papers table
ALTER TABLE papers
ADD COLUMN IF NOT EXISTS citations INTEGER DEFAULT 0;

-- Update existing rows to have a default value
UPDATE papers SET citations = 0 WHERE citations IS NULL; 