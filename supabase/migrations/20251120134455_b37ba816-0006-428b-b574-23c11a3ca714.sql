-- Create enum types
CREATE TYPE user_plan AS ENUM ('free', 'basic', 'premium', 'enterprise');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE obra_status AS ENUM ('planning', 'in_progress', 'paused', 'completed', 'cancelled');

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nome TEXT NOT NULL,
  plano user_plan DEFAULT 'free' NOT NULL,
  status user_status DEFAULT 'active' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create obras (construction projects) table
CREATE TABLE public.obras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  status obra_status DEFAULT 'planning' NOT NULL,
  orcamento DECIMAL(12, 2),
  data_inicio DATE,
  data_fim DATE,
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create profissoes (professional roles) table
CREATE TABLE public.profissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  quantidade_necessaria INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create profissionais (professionals/workers) table
CREATE TABLE public.profissionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  profissao_principal TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  rating DECIMAL(3, 2) DEFAULT 0.0,
  telefone TEXT,
  email TEXT,
  disponivel BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT rating_range CHECK (rating >= 0 AND rating <= 5)
);

-- Create junction table for professionals assigned to projects
CREATE TABLE public.obra_profissionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  profissional_id UUID NOT NULL REFERENCES public.profissionais(id) ON DELETE CASCADE,
  profissao_id UUID REFERENCES public.profissoes(id) ON DELETE SET NULL,
  data_inicio DATE,
  data_fim DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(obra_id, profissional_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obra_profissionais ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for obras
CREATE POLICY "Users can view their own obras"
  ON public.obras FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own obras"
  ON public.obras FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own obras"
  ON public.obras FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own obras"
  ON public.obras FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for profissoes
CREATE POLICY "Users can view profissoes from their obras"
  ON public.profissoes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.obras
      WHERE obras.id = profissoes.obra_id
      AND obras.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create profissoes for their obras"
  ON public.profissoes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.obras
      WHERE obras.id = profissoes.obra_id
      AND obras.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update profissoes from their obras"
  ON public.profissoes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.obras
      WHERE obras.id = profissoes.obra_id
      AND obras.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete profissoes from their obras"
  ON public.profissoes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.obras
      WHERE obras.id = profissoes.obra_id
      AND obras.user_id = auth.uid()
    )
  );

-- RLS Policies for profissionais (public directory)
CREATE POLICY "Anyone can view available professionals"
  ON public.profissionais FOR SELECT
  USING (disponivel = true);

CREATE POLICY "Users can create professional profiles"
  ON public.profissionais FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own professional profile"
  ON public.profissionais FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for obra_profissionais
CREATE POLICY "Users can view professionals in their obras"
  ON public.obra_profissionais FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.obras
      WHERE obras.id = obra_profissionais.obra_id
      AND obras.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can assign professionals to their obras"
  ON public.obra_profissionais FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.obras
      WHERE obras.id = obra_profissionais.obra_id
      AND obras.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove professionals from their obras"
  ON public.obra_profissionais FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.obras
      WHERE obras.id = obra_profissionais.obra_id
      AND obras.user_id = auth.uid()
    )
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add update timestamp triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_obras_updated_at
  BEFORE UPDATE ON public.obras
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_profissoes_updated_at
  BEFORE UPDATE ON public.profissoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_profissionais_updated_at
  BEFORE UPDATE ON public.profissionais
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Create indexes for better query performance
CREATE INDEX idx_obras_user_id ON public.obras(user_id);
CREATE INDEX idx_profissoes_obra_id ON public.profissoes(obra_id);
CREATE INDEX idx_obra_profissionais_obra_id ON public.obra_profissionais(obra_id);
CREATE INDEX idx_obra_profissionais_profissional_id ON public.obra_profissionais(profissional_id);
CREATE INDEX idx_profissionais_disponivel ON public.profissionais(disponivel);