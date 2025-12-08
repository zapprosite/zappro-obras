-- Create function to auto-assign role based on email domain on user signup
CREATE OR REPLACE FUNCTION public.assign_role_by_email_domain()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
  assigned_role app_role;
BEGIN
  user_email := NEW.email;
  
  -- Determine role based on email domain
  IF user_email LIKE '%@construccoes.com' THEN
    assigned_role := 'admin';
  ELSIF user_email LIKE '%@gmail.com' THEN
    assigned_role := 'civil_engineer';
  ELSIF user_email LIKE '%@obras.com.br' THEN
    assigned_role := 'team_leader';
  ELSE
    -- Default: civil_engineer for unknown domains (instant access)
    assigned_role := 'civil_engineer';
  END IF;
  
  -- Insert role (ignore if already exists)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-assign role on user creation
DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_role_by_email_domain();

-- Add unique constraint on user_id in user_roles to prevent duplicate roles
-- First, remove duplicates if any exist
DELETE FROM public.user_roles a USING public.user_roles b
WHERE a.id < b.id AND a.user_id = b.user_id;

-- Add unique constraint if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_user_id_unique'
  ) THEN
    ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_unique UNIQUE (user_id);
  END IF;
END $$;