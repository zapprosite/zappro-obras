-- Add Kanban scheduling columns to tarefas
ALTER TABLE public.tarefas 
ADD COLUMN IF NOT EXISTS lane text NOT NULL DEFAULT 'backlog';

ALTER TABLE public.tarefas 
ADD COLUMN IF NOT EXISTS sort_order numeric NOT NULL DEFAULT 0;

-- Add constraint for lane values
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tarefas_lane_check'
  ) THEN
    ALTER TABLE public.tarefas 
    ADD CONSTRAINT tarefas_lane_check 
    CHECK (lane IN ('backlog', 'todo', 'doing', 'done', 'blocked'));
  END IF;
END $$;

-- Create composite index for efficient Kanban queries
CREATE INDEX IF NOT EXISTS idx_tarefas_obra_data_inicio ON public.tarefas(obra_id, data_inicio);
CREATE INDEX IF NOT EXISTS idx_tarefas_obra_lane ON public.tarefas(obra_id, lane);
CREATE INDEX IF NOT EXISTS idx_tarefas_obra_equipe ON public.tarefas(obra_id, equipe_id);