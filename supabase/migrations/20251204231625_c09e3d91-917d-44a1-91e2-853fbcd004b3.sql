-- Drop existing custo_total column and recreate as GENERATED column
ALTER TABLE public.materiais DROP COLUMN IF EXISTS custo_total;
ALTER TABLE public.materiais ADD COLUMN custo_total numeric GENERATED ALWAYS AS (quantidade * COALESCE(custo_unitario, 0)) STORED;