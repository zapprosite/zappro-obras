-- Add new columns to profissionais table for payment tracking
ALTER TABLE public.profissionais
ADD COLUMN IF NOT EXISTS tipo_contratacao text CHECK (tipo_contratacao IN ('clt', 'terceirizado')) DEFAULT 'clt',
ADD COLUMN IF NOT EXISTS salario_mensal numeric,
ADD COLUMN IF NOT EXISTS valor_hora numeric;

-- Create equipes table
CREATE TABLE IF NOT EXISTS public.equipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id uuid NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  nome text NOT NULL,
  horario_inicio time NOT NULL DEFAULT '08:00:00',
  horario_fim time NOT NULL DEFAULT '18:00:00',
  dias_trabalho text[] DEFAULT ARRAY['seg', 'ter', 'qua', 'qui', 'sex', 'sab'],
  descricao text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.equipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view equipes from their obras"
  ON public.equipes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.obras
    WHERE obras.id = equipes.obra_id
    AND obras.user_id = auth.uid()
  ));

CREATE POLICY "Users can create equipes in their obras"
  ON public.equipes FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.obras
    WHERE obras.id = equipes.obra_id
    AND obras.user_id = auth.uid()
  ));

CREATE POLICY "Users can update equipes from their obras"
  ON public.equipes FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.obras
    WHERE obras.id = equipes.obra_id
    AND obras.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete equipes from their obras"
  ON public.equipes FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.obras
    WHERE obras.id = equipes.obra_id
    AND obras.user_id = auth.uid()
  ));

-- Create equipe_profissionais junction table
CREATE TABLE IF NOT EXISTS public.equipe_profissionais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id uuid NOT NULL REFERENCES public.equipes(id) ON DELETE CASCADE,
  profissional_id uuid NOT NULL REFERENCES public.profissionais(id) ON DELETE CASCADE,
  data_entrada date NOT NULL DEFAULT CURRENT_DATE,
  data_saida date,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(equipe_id, profissional_id)
);

ALTER TABLE public.equipe_profissionais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view equipe_profissionais from their obras"
  ON public.equipe_profissionais FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.equipes e
    JOIN public.obras o ON e.obra_id = o.id
    WHERE e.id = equipe_profissionais.equipe_id
    AND o.user_id = auth.uid()
  ));

CREATE POLICY "Users can assign profissionais to equipes in their obras"
  ON public.equipe_profissionais FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.equipes e
    JOIN public.obras o ON e.obra_id = o.id
    WHERE e.id = equipe_profissionais.equipe_id
    AND o.user_id = auth.uid()
  ));

CREATE POLICY "Users can update equipe_profissionais from their obras"
  ON public.equipe_profissionais FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.equipes e
    JOIN public.obras o ON e.obra_id = o.id
    WHERE e.id = equipe_profissionais.equipe_id
    AND o.user_id = auth.uid()
  ));

CREATE POLICY "Users can remove profissionais from equipes in their obras"
  ON public.equipe_profissionais FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.equipes e
    JOIN public.obras o ON e.obra_id = o.id
    WHERE e.id = equipe_profissionais.equipe_id
    AND o.user_id = auth.uid()
  ));

-- Create tarefas table
CREATE TABLE IF NOT EXISTS public.tarefas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id uuid NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  equipe_id uuid REFERENCES public.equipes(id) ON DELETE SET NULL,
  titulo text NOT NULL,
  descricao text,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'cancelada')),
  prioridade text NOT NULL DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')),
  data_inicio timestamptz,
  data_fim timestamptz,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tarefas from their obras"
  ON public.tarefas FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.obras
    WHERE obras.id = tarefas.obra_id
    AND obras.user_id = auth.uid()
  ));

CREATE POLICY "Users can create tarefas in their obras"
  ON public.tarefas FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.obras
    WHERE obras.id = tarefas.obra_id
    AND obras.user_id = auth.uid()
  ));

CREATE POLICY "Users can update tarefas from their obras"
  ON public.tarefas FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.obras
    WHERE obras.id = tarefas.obra_id
    AND obras.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete tarefas from their obras"
  ON public.tarefas FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.obras
    WHERE obras.id = tarefas.obra_id
    AND obras.user_id = auth.uid()
  ));

-- Create fornecedores table
CREATE TABLE IF NOT EXISTS public.fornecedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nome text NOT NULL,
  contato text,
  email text,
  telefone text,
  endereco text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their fornecedores"
  ON public.fornecedores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create fornecedores"
  ON public.fornecedores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their fornecedores"
  ON public.fornecedores FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their fornecedores"
  ON public.fornecedores FOR DELETE
  USING (auth.uid() = user_id);

-- Create materiais table
CREATE TABLE IF NOT EXISTS public.materiais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tarefa_id uuid NOT NULL REFERENCES public.tarefas(id) ON DELETE CASCADE,
  fornecedor_id uuid REFERENCES public.fornecedores(id) ON DELETE SET NULL,
  nome text NOT NULL,
  unidade text NOT NULL DEFAULT 'un',
  quantidade numeric NOT NULL DEFAULT 0,
  custo_unitario numeric DEFAULT 0,
  custo_total numeric GENERATED ALWAYS AS (quantidade * COALESCE(custo_unitario, 0)) STORED,
  status text NOT NULL DEFAULT 'solicitado' CHECK (status IN ('solicitado', 'recebido', 'usado')),
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.materiais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view materiais from their obras"
  ON public.materiais FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.tarefas t
    JOIN public.obras o ON t.obra_id = o.id
    WHERE t.id = materiais.tarefa_id
    AND o.user_id = auth.uid()
  ));

CREATE POLICY "Users can create materiais in their obras"
  ON public.materiais FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tarefas t
    JOIN public.obras o ON t.obra_id = o.id
    WHERE t.id = materiais.tarefa_id
    AND o.user_id = auth.uid()
  ));

CREATE POLICY "Users can update materiais from their obras"
  ON public.materiais FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.tarefas t
    JOIN public.obras o ON t.obra_id = o.id
    WHERE t.id = materiais.tarefa_id
    AND o.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete materiais from their obras"
  ON public.materiais FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.tarefas t
    JOIN public.obras o ON t.obra_id = o.id
    WHERE t.id = materiais.tarefa_id
    AND o.user_id = auth.uid()
  ));

-- Create registros_ponto table
CREATE TABLE IF NOT EXISTS public.registros_ponto (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id uuid NOT NULL REFERENCES public.profissionais(id) ON DELETE CASCADE,
  obra_id uuid NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  data date NOT NULL DEFAULT CURRENT_DATE,
  hora_entrada time,
  hora_saida time,
  horas_trabalhadas numeric GENERATED ALWAYS AS (
    CASE 
      WHEN hora_entrada IS NOT NULL AND hora_saida IS NOT NULL 
      THEN EXTRACT(EPOCH FROM (hora_saida - hora_entrada)) / 3600
      ELSE 0
    END
  ) STORED,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(profissional_id, obra_id, data)
);

ALTER TABLE public.registros_ponto ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view registros_ponto from their obras"
  ON public.registros_ponto FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.obras
    WHERE obras.id = registros_ponto.obra_id
    AND obras.user_id = auth.uid()
  ));

CREATE POLICY "Users can create registros_ponto in their obras"
  ON public.registros_ponto FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.obras
    WHERE obras.id = registros_ponto.obra_id
    AND obras.user_id = auth.uid()
  ));

CREATE POLICY "Users can update registros_ponto from their obras"
  ON public.registros_ponto FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.obras
    WHERE obras.id = registros_ponto.obra_id
    AND obras.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete registros_ponto from their obras"
  ON public.registros_ponto FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.obras
    WHERE obras.id = registros_ponto.obra_id
    AND obras.user_id = auth.uid()
  ));

-- Add triggers for updated_at
CREATE TRIGGER update_equipes_updated_at
  BEFORE UPDATE ON public.equipes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_tarefas_updated_at
  BEFORE UPDATE ON public.tarefas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_fornecedores_updated_at
  BEFORE UPDATE ON public.fornecedores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_materiais_updated_at
  BEFORE UPDATE ON public.materiais
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();