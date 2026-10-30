CREATE SCHEMA IF NOT EXISTS app_private;

CREATE OR REPLACE FUNCTION app_private.has_role(_user_id uuid, _role public.app_role)
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
  );
$$;

CREATE OR REPLACE FUNCTION app_private.is_staff(_user_id uuid)
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
      AND role IN ('admin'::public.app_role, 'assistant'::public.app_role)
  );
$$;

REVOKE ALL ON SCHEMA app_private FROM PUBLIC;
GRANT USAGE ON SCHEMA app_private TO anon, authenticated;
REVOKE ALL ON FUNCTION app_private.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.is_staff(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_private.has_role(uuid, public.app_role) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_private.is_staff(uuid) TO anon, authenticated, service_role;

-- user_roles
DROP POLICY IF EXISTS "admins manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "users view own role" ON public.user_roles;
CREATE POLICY "admins manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (app_private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (app_private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "users view own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR app_private.has_role(auth.uid(), 'admin'::public.app_role));

-- profiles
DROP POLICY IF EXISTS "users view own profile" ON public.profiles;
CREATE POLICY "users view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR app_private.is_staff(auth.uid()));

-- leads
DROP POLICY IF EXISTS "admins delete leads" ON public.leads;
DROP POLICY IF EXISTS "staff update leads" ON public.leads;
DROP POLICY IF EXISTS "staff view leads" ON public.leads;
CREATE POLICY "admins delete leads"
ON public.leads
FOR DELETE
TO authenticated
USING (app_private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins update leads"
ON public.leads
FOR UPDATE
TO authenticated
USING (app_private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (app_private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins view leads"
ON public.leads
FOR SELECT
TO authenticated
USING (app_private.has_role(auth.uid(), 'admin'::public.app_role));

-- messages
DROP POLICY IF EXISTS "staff update messages" ON public.messages;
DROP POLICY IF EXISTS "staff view messages" ON public.messages;
CREATE POLICY "admins update messages"
ON public.messages
FOR UPDATE
TO authenticated
USING (app_private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (app_private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "users and admins view messages"
ON public.messages
FOR SELECT
TO authenticated
USING (app_private.has_role(auth.uid(), 'admin'::public.app_role) OR auth.uid() = sender_id);

-- collaborations
DROP POLICY IF EXISTS "staff update collabs" ON public.collaborations;
DROP POLICY IF EXISTS "staff view collabs" ON public.collaborations;
CREATE POLICY "admins update collaborations"
ON public.collaborations
FOR UPDATE
TO authenticated
USING (app_private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (app_private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins view collaborations"
ON public.collaborations
FOR SELECT
TO authenticated
USING (app_private.has_role(auth.uid(), 'admin'::public.app_role));

-- notifications
DROP POLICY IF EXISTS "staff view notifications" ON public.notifications;
DROP POLICY IF EXISTS "admins update notifications" ON public.notifications;
CREATE POLICY "admins view notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (app_private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins update notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (app_private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (app_private.has_role(auth.uid(), 'admin'::public.app_role));

-- audit log
DROP POLICY IF EXISTS "admins insert audit" ON public.audit_log;
DROP POLICY IF EXISTS "admins view audit" ON public.audit_log;
CREATE POLICY "admins insert audit"
ON public.audit_log
FOR INSERT
TO authenticated
WITH CHECK (app_private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins view audit"
ON public.audit_log
FOR SELECT
TO authenticated
USING (app_private.has_role(auth.uid(), 'admin'::public.app_role));

-- lab assets
DROP POLICY IF EXISTS "admins view lab assets" ON public.lab_assets;
DROP POLICY IF EXISTS "admins create lab assets" ON public.lab_assets;
DROP POLICY IF EXISTS "admins update lab assets" ON public.lab_assets;
DROP POLICY IF EXISTS "admins delete lab assets" ON public.lab_assets;
CREATE POLICY "admins view lab assets"
ON public.lab_assets
FOR SELECT
TO authenticated
USING (app_private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins create lab assets"
ON public.lab_assets
FOR INSERT
TO authenticated
WITH CHECK (app_private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins update lab assets"
ON public.lab_assets
FOR UPDATE
TO authenticated
USING (app_private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (app_private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins delete lab assets"
ON public.lab_assets
FOR DELETE
TO authenticated
USING (app_private.has_role(auth.uid(), 'admin'::public.app_role));

-- announcements
DROP POLICY IF EXISTS "public view published announcements" ON public.announcements;
DROP POLICY IF EXISTS "admins create announcements" ON public.announcements;
DROP POLICY IF EXISTS "admins update announcements" ON public.announcements;
DROP POLICY IF EXISTS "admins delete announcements" ON public.announcements;
CREATE POLICY "public view published announcements"
ON public.announcements
FOR SELECT
TO public
USING (published = true OR app_private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins create announcements"
ON public.announcements
FOR INSERT
TO authenticated
WITH CHECK (app_private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins update announcements"
ON public.announcements
FOR UPDATE
TO authenticated
USING (app_private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (app_private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins delete announcements"
ON public.announcements
FOR DELETE
TO authenticated
USING (app_private.has_role(auth.uid(), 'admin'::public.app_role));

-- orders
DROP POLICY IF EXISTS "admins insert orders" ON public.orders;
DROP POLICY IF EXISTS "admins update orders" ON public.orders;
DROP POLICY IF EXISTS "admins delete orders" ON public.orders;
CREATE POLICY "admins insert orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (app_private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins update orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (app_private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (app_private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins delete orders"
ON public.orders
FOR DELETE
TO authenticated
USING (app_private.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "client view own orders" ON public.orders;
CREATE POLICY "client/admin view orders"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() = client_id OR app_private.has_role(auth.uid(), 'admin'::public.app_role));
