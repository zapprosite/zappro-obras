-- Add soft delete column to profissionais table
ALTER TABLE public.profissionais 
ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT false;

-- Update existing professionals to not be deleted
UPDATE public.profissionais 
SET deleted = false 
WHERE deleted IS NULL;