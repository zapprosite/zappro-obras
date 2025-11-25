-- Add soft delete columns to all tables
ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT false;
ALTER TABLE public.tarefas ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT false;
ALTER TABLE public.equipes ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT false;
ALTER TABLE public.materiais ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT false;

-- Create indexes for soft delete queries
CREATE INDEX IF NOT EXISTS idx_obras_deleted ON public.obras(deleted);
CREATE INDEX IF NOT EXISTS idx_tarefas_deleted ON public.tarefas(deleted);
CREATE INDEX IF NOT EXISTS idx_equipes_deleted ON public.equipes(deleted);
CREATE INDEX IF NOT EXISTS idx_materiais_deleted ON public.materiais(deleted);
CREATE INDEX IF NOT EXISTS idx_profissionais_deleted ON public.profissionais(deleted);

-- Update RLS policies to exclude deleted records
DROP POLICY IF EXISTS "Users can view their own obras" ON public.obras;
CREATE POLICY "Users can view their own obras"
  ON public.obras FOR SELECT
  USING (auth.uid() = user_id AND (deleted = false OR deleted IS NULL));

DROP POLICY IF EXISTS "Users can view tarefas from their obras" ON public.tarefas;
CREATE POLICY "Users can view tarefas from their obras"
  ON public.tarefas FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM obras
    WHERE obras.id = tarefas.obra_id 
    AND obras.user_id = auth.uid()
  ) AND (tarefas.deleted = false OR tarefas.deleted IS NULL));

DROP POLICY IF EXISTS "Users can view equipes from their obras" ON public.equipes;
CREATE POLICY "Users can view equipes from their obras"
  ON public.equipes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM obras
    WHERE obras.id = equipes.obra_id 
    AND obras.user_id = auth.uid()
  ) AND (equipes.deleted = false OR equipes.deleted IS NULL));

DROP POLICY IF EXISTS "Users can view materiais from their obras" ON public.materiais;
CREATE POLICY "Users can view materiais from their obras"
  ON public.materiais FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM tarefas t
    JOIN obras o ON t.obra_id = o.id
    WHERE t.id = materiais.tarefa_id 
    AND o.user_id = auth.uid()
  ) AND (materiais.deleted = false OR materiais.deleted IS NULL));

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.obras;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tarefas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.equipes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.materiais;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profissionais;