
CREATE TABLE public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  action text not null,
  target_type text,
  target_id text,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff view audit" ON public.audit_log FOR SELECT USING (is_staff(auth.uid()));
CREATE POLICY "staff insert audit" ON public.audit_log FOR INSERT WITH CHECK (is_staff(auth.uid()));

CREATE TABLE public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  audience text not null default 'public',
  pinned boolean not null default false,
  published boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone view announcements" ON public.announcements FOR SELECT USING (published = true OR is_staff(auth.uid()));
CREATE POLICY "staff insert announcements" ON public.announcements FOR INSERT WITH CHECK (is_staff(auth.uid()));
CREATE POLICY "staff update announcements" ON public.announcements FOR UPDATE USING (is_staff(auth.uid()));
CREATE POLICY "staff delete announcements" ON public.announcements FOR DELETE USING (is_staff(auth.uid()));
CREATE TRIGGER ann_updated BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.lab_assets (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  prompt text not null,
  image_data text not null,
  notes text,
  created_by uuid,
  created_at timestamptz not null default now()
);
ALTER TABLE public.lab_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff view lab" ON public.lab_assets FOR SELECT USING (is_staff(auth.uid()));
CREATE POLICY "staff insert lab" ON public.lab_assets FOR INSERT WITH CHECK (is_staff(auth.uid()));
CREATE POLICY "staff update lab" ON public.lab_assets FOR UPDATE USING (is_staff(auth.uid()));
CREATE POLICY "staff delete lab" ON public.lab_assets FOR DELETE USING (is_staff(auth.uid()));

ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.collaborations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
