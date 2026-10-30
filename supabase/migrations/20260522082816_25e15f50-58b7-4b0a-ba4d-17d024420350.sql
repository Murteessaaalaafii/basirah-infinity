-- Fix overly permissive public insert policies and restrict admin-only resources

-- Ensure notification delivery tracking exists
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS campaign_id uuid,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'queued',
  ADD COLUMN IF NOT EXISTS sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS failed_at timestamptz,
  ADD COLUMN IF NOT EXISTS error_message text,
  ADD COLUMN IF NOT EXISTS retry_count integer NOT NULL DEFAULT 0;

-- Keep legacy sent flag aligned for old UI/data
UPDATE public.notifications
SET status = CASE WHEN sent THEN 'sent' ELSE COALESCE(NULLIF(status, ''), 'queued') END
WHERE status IS DISTINCT FROM CASE WHEN sent THEN 'sent' ELSE COALESCE(NULLIF(status, ''), 'queued') END;

-- Add safe validation constraints for delivery tracking values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'notifications_status_valid'
  ) THEN
    ALTER TABLE public.notifications
      ADD CONSTRAINT notifications_status_valid
      CHECK (status IN ('queued', 'sending', 'sent', 'failed'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notifications_campaign_id ON public.notifications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);

-- Admin-only policies for audit log
DROP POLICY IF EXISTS "staff insert audit" ON public.audit_log;
DROP POLICY IF EXISTS "staff view audit" ON public.audit_log;
CREATE POLICY "admins insert audit"
ON public.audit_log
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins view audit"
ON public.audit_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Admin-only policies for lab assets
DROP POLICY IF EXISTS "staff view lab" ON public.lab_assets;
DROP POLICY IF EXISTS "staff insert lab" ON public.lab_assets;
DROP POLICY IF EXISTS "staff update lab" ON public.lab_assets;
DROP POLICY IF EXISTS "staff delete lab" ON public.lab_assets;
CREATE POLICY "admins view lab assets"
ON public.lab_assets
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins create lab assets"
ON public.lab_assets
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins update lab assets"
ON public.lab_assets
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins delete lab assets"
ON public.lab_assets
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Announcement policies: public may read published items; only admins manage them
DROP POLICY IF EXISTS "anyone view announcements" ON public.announcements;
DROP POLICY IF EXISTS "staff insert announcements" ON public.announcements;
DROP POLICY IF EXISTS "staff update announcements" ON public.announcements;
DROP POLICY IF EXISTS "staff delete announcements" ON public.announcements;
CREATE POLICY "public view published announcements"
ON public.announcements
FOR SELECT
TO public
USING (published = true OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins create announcements"
ON public.announcements
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins update announcements"
ON public.announcements
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins delete announcements"
ON public.announcements
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Replace always-true public insert checks with basic validity checks
DROP POLICY IF EXISTS "anyone submit collab" ON public.collaborations;
CREATE POLICY "public submit valid collaboration"
ON public.collaborations
FOR INSERT
TO public
WITH CHECK (
  length(trim(name)) BETWEEN 1 AND 100
  AND email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  AND type IN ('agency', 'freelancer', 'partner', 'investor', 'creator')
  AND length(trim(proposal)) BETWEEN 20 AND 3000
);

DROP POLICY IF EXISTS "anyone create lead" ON public.leads;
CREATE POLICY "public create valid lead"
ON public.leads
FOR INSERT
TO public
WITH CHECK (
  length(trim(name)) BETWEEN 1 AND 120
  AND email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  AND (message IS NULL OR length(message) <= 3000)
  AND status = 'new'
);

DROP POLICY IF EXISTS "anyone send message" ON public.messages;
CREATE POLICY "public send valid message"
ON public.messages
FOR INSERT
TO public
WITH CHECK (
  length(trim(body)) BETWEEN 1 AND 3000
  AND (sender_email IS NULL OR sender_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$')
  AND (auth.uid() IS NULL OR sender_id IS NULL OR sender_id = auth.uid())
);

DROP POLICY IF EXISTS "anyone create notification" ON public.notifications;
CREATE POLICY "authenticated queue own/system notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  to_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  AND length(trim(subject)) BETWEEN 1 AND 200
  AND length(trim(body)) BETWEEN 1 AND 10000
);
CREATE POLICY "public queue website autoresponders"
ON public.notifications
FOR INSERT
TO anon
WITH CHECK (
  kind IN ('lead-welcome', 'lead-admin', 'collab-welcome', 'collab-admin', 'order')
  AND to_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  AND length(trim(subject)) BETWEEN 1 AND 200
  AND length(trim(body)) BETWEEN 1 AND 10000
);

-- Notifications are campaign delivery records; admins can update status after an email worker sends them
DROP POLICY IF EXISTS "admins update notifications" ON public.notifications;
CREATE POLICY "admins update notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Avoid SECURITY DEFINER functions being directly callable through the API.
-- RLS policies can still invoke these functions internally.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
