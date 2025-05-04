-- First, drop any foreign key constraints that reference the papers table's id column
DO $$ 
BEGIN
    -- Drop foreign key constraints if they exist
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_type = 'FOREIGN KEY' 
        AND table_name = 'papers'
    ) THEN
        EXECUTE (
            SELECT string_agg('ALTER TABLE ' || table_name || ' DROP CONSTRAINT ' || constraint_name, '; ')
            FROM information_schema.table_constraints 
            WHERE constraint_type = 'FOREIGN KEY' 
            AND table_name = 'papers'
        );
    END IF;
END $$;

-- Alter the id column type to TEXT
ALTER TABLE papers 
ALTER COLUMN id TYPE TEXT;

-- Add a check constraint to ensure id is not empty
ALTER TABLE papers 
ADD CONSTRAINT papers_id_not_empty CHECK (id != ''); 