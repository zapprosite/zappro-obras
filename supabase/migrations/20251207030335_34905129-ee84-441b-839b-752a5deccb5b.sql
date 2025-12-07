-- Bootstrap admin user function (safe to run multiple times)
-- This creates a function that can be called to ensure an admin exists

CREATE OR REPLACE FUNCTION public.ensure_admin_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count integer;
BEGIN
  -- Check if any admin exists
  SELECT COUNT(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
  
  -- If no admin exists, we'll need to manually assign one via the profiles table
  -- This is logged for audit purposes
  IF admin_count = 0 THEN
    RAISE NOTICE 'No admin users found. First user to sign up should be assigned admin role manually.';
  END IF;
END;
$$;

-- Create a function to allow first user self-assignment as civil_engineer after 24 hours
CREATE OR REPLACE FUNCTION public.can_self_assign_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- User must not have a role yet
    NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id)
    AND
    -- User account must be older than 24 hours (anti-abuse)
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = _user_id 
      AND created_at < NOW() - INTERVAL '24 hours'
    )
$$;

-- Add policy for self-assignment of civil_engineer role (restricted)
CREATE POLICY "Users can self-assign civil_engineer after 24h if no role"
ON public.user_roles
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND role = 'civil_engineer'
  AND public.can_self_assign_role(auth.uid())
);

-- Update profiles to allow admins to view all profiles for user management
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow civil engineers to view profiles for team assignment
CREATE POLICY "Civil engineers can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'civil_engineer'));