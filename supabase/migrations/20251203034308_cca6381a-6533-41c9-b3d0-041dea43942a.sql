-- Add new columns to materiais table for comprehensive material management
ALTER TABLE public.materiais 
ADD COLUMN IF NOT EXISTS obra_id uuid REFERENCES public.obras(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS descricao text,
ADD COLUMN IF NOT EXISTS unidade_medida text DEFAULT 'un',
ADD COLUMN IF NOT EXISTS data_entrega_estimada date,
ADD COLUMN IF NOT EXISTS data_entrega_real date,
ADD COLUMN IF NOT EXISTS categoria text DEFAULT 'Outros',
ADD COLUMN IF NOT EXISTS lote text,
ADD COLUMN IF NOT EXISTS notas text,
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Make tarefa_id nullable (materials can now belong directly to obra)
ALTER TABLE public.materiais ALTER COLUMN tarefa_id DROP NOT NULL;

-- Add check constraint for categoria
ALTER TABLE public.materiais ADD CONSTRAINT materiais_categoria_check 
CHECK (categoria IN ('Estrutura', 'Acabamento', 'Hidráulica', 'Elétrica', 'Outros'));

-- Add check constraint for status  
ALTER TABLE public.materiais DROP CONSTRAINT IF EXISTS materiais_status_check;
ALTER TABLE public.materiais ADD CONSTRAINT materiais_status_check 
CHECK (status IN ('solicitado', 'encomendado', 'em_transito', 'entregue', 'cancelado'));

-- Create index for obra_id for faster queries
CREATE INDEX IF NOT EXISTS idx_materiais_obra_id ON public.materiais(obra_id);
CREATE INDEX IF NOT EXISTS idx_materiais_categoria ON public.materiais(categoria);
CREATE INDEX IF NOT EXISTS idx_materiais_status ON public.materiais(status);
CREATE INDEX IF NOT EXISTS idx_materiais_nome ON public.materiais(nome);

-- Update RLS policy to allow direct obra access
DROP POLICY IF EXISTS "Users can view materiais from their obras" ON public.materiais;
CREATE POLICY "Users can view materiais from their obras" 
ON public.materiais 
FOR SELECT 
USING (
  (deleted = false OR deleted IS NULL) AND (
    -- Via tarefa
    EXISTS (
      SELECT 1 FROM tarefas t
      JOIN obras o ON t.obra_id = o.id
      WHERE t.id = materiais.tarefa_id AND o.user_id = auth.uid()
    )
    OR
    -- Direct to obra
    EXISTS (
      SELECT 1 FROM obras o
      WHERE o.id = materiais.obra_id AND o.user_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "Users can create materiais in their obras" ON public.materiais;
CREATE POLICY "Users can create materiais in their obras" 
ON public.materiais 
FOR INSERT 
WITH CHECK (
  -- Via tarefa
  (tarefa_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM tarefas t
    JOIN obras o ON t.obra_id = o.id
    WHERE t.id = materiais.tarefa_id AND o.user_id = auth.uid()
  ))
  OR
  -- Direct to obra
  (obra_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM obras o
    WHERE o.id = materiais.obra_id AND o.user_id = auth.uid()
  ))
);

DROP POLICY IF EXISTS "Users can update materiais from their obras" ON public.materiais;
CREATE POLICY "Users can update materiais from their obras" 
ON public.materiais 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM tarefas t
    JOIN obras o ON t.obra_id = o.id
    WHERE t.id = materiais.tarefa_id AND o.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM obras o
    WHERE o.id = materiais.obra_id AND o.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete materiais from their obras" ON public.materiais;
CREATE POLICY "Users can delete materiais from their obras" 
ON public.materiais 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM tarefas t
    JOIN obras o ON t.obra_id = o.id
    WHERE t.id = materiais.tarefa_id AND o.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM obras o
    WHERE o.id = materiais.obra_id AND o.user_id = auth.uid()
  )
);