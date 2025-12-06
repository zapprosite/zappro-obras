-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'civil_engineer', 'team_leader');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'team_leader',
  assigned_by uuid REFERENCES auth.users(id),
  assigned_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user's role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Add team_leader_id to equipes table
ALTER TABLE public.equipes ADD COLUMN IF NOT EXISTS team_leader_id uuid REFERENCES auth.users(id);

-- Create team_assignments table for TL project access
CREATE TABLE public.team_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  obra_id uuid REFERENCES public.obras(id) ON DELETE CASCADE NOT NULL,
  equipe_id uuid REFERENCES public.equipes(id) ON DELETE CASCADE,
  assigned_at timestamp with time zone DEFAULT now(),
  assigned_by uuid REFERENCES auth.users(id),
  UNIQUE (user_id, obra_id)
);

ALTER TABLE public.team_assignments ENABLE ROW LEVEL SECURITY;

-- Team assignments RLS
CREATE POLICY "Users can view their assignments"
ON public.team_assignments
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "CE and Admin can manage assignments"
ON public.team_assignments
FOR ALL
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'civil_engineer')
);

-- Function to check if user has access to a project
CREATE OR REPLACE FUNCTION public.has_project_access(_user_id uuid, _obra_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- Admins and CEs have access to all projects they own
    EXISTS (
      SELECT 1 FROM public.obras 
      WHERE id = _obra_id 
      AND user_id = _user_id
    )
    OR
    -- Team Leaders only have access to assigned projects
    EXISTS (
      SELECT 1 FROM public.team_assignments 
      WHERE user_id = _user_id 
      AND obra_id = _obra_id
    )
    OR
    -- Admins have access to everything
    public.has_role(_user_id, 'admin')
$$;

-- Update obras RLS to use role-based access
DROP POLICY IF EXISTS "Users can view their own obras" ON public.obras;

CREATE POLICY "Role-based project access"
ON public.obras
FOR SELECT
USING (
  (auth.uid() = user_id AND (deleted = false OR deleted IS NULL))
  OR public.has_project_access(auth.uid(), id)
);

-- Update tarefas RLS for team leaders
DROP POLICY IF EXISTS "Users can view tarefas from their obras" ON public.tarefas;

CREATE POLICY "Role-based task access"
ON public.tarefas
FOR SELECT
USING (
  ((deleted = false) OR (deleted IS NULL))
  AND public.has_project_access(auth.uid(), obra_id)
);

DROP POLICY IF EXISTS "Users can update tarefas from their obras" ON public.tarefas;

CREATE POLICY "Role-based task update"
ON public.tarefas
FOR UPDATE
USING (public.has_project_access(auth.uid(), obra_id));

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_assignments;