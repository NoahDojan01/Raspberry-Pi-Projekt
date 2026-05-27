-- User ban
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS banned_until timestamptz DEFAULT NULL;

-- Name change requests
CREATE TABLE IF NOT EXISTS public.name_change_requests (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  old_name    text NOT NULL,
  new_name    text NOT NULL,
  status      text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
ALTER TABLE public.name_change_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert own" ON public.name_change_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own"   ON public.name_change_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- App settings (singleton row, id always = 1)
CREATE TABLE IF NOT EXISTS public.app_settings (
  id                  int PRIMARY KEY DEFAULT 1,
  maintenance_enabled boolean NOT NULL DEFAULT false,
  maintenance_until   timestamptz DEFAULT NULL,
  maintenance_message text NOT NULL DEFAULT 'Wartungsarbeiten'
);
INSERT INTO public.app_settings (id) VALUES (1) ON CONFLICT DO NOTHING;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.app_settings FOR SELECT USING (true);
