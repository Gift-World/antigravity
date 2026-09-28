-- Production identity bootstrap. Every new Supabase Auth account receives a
-- matching organisation and application profile. Existing seeded users remain
-- untouched and can be linked later by matching email during the pilot rollout.

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users(auth_user_id);

CREATE OR REPLACE FUNCTION public.bootstrap_auth_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  organisation_id UUID;
  display_name TEXT;
  organisation_name TEXT;
BEGIN
  display_name := COALESCE(NULLIF(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1));
  organisation_name := COALESCE(NULLIF(new.raw_user_meta_data ->> 'org_name', ''), display_name || '''s organisation');

  INSERT INTO public.organizations (name, email)
  VALUES (organisation_name, new.email)
  RETURNING id INTO organisation_id;

  INSERT INTO public.users (id, auth_user_id, organization_id, full_name, email, role)
  VALUES (new.id, new.id, organisation_id, display_name, new.email, 'org_admin');
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.bootstrap_auth_profile();

DROP POLICY IF EXISTS "Users can read their own authenticated profile" ON public.users;
CREATE POLICY "Users can read their own authenticated profile"
  ON public.users FOR SELECT
  USING (auth.uid() = auth_user_id);
