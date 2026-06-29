
-- Roles infrastructure
CREATE TYPE public.app_role AS ENUM ('admin', 'cashier');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Tighten emisor_config policies: only admins can write
DROP POLICY "Authenticated users can insert emisor config" ON public.emisor_config;
DROP POLICY "Authenticated users can update emisor config" ON public.emisor_config;
DROP POLICY "Authenticated users can delete emisor config" ON public.emisor_config;

CREATE POLICY "Admins insert emisor" ON public.emisor_config
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update emisor" ON public.emisor_config
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete emisor" ON public.emisor_config
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Tighten comprobantes: only admins can update; inserts must have created_by = self
DROP POLICY "Authenticated users can insert comprobantes" ON public.comprobantes_electronicos;
DROP POLICY "Authenticated users can update comprobantes" ON public.comprobantes_electronicos;

CREATE POLICY "Users insert own comprobantes" ON public.comprobantes_electronicos
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Admins update comprobantes" ON public.comprobantes_electronicos
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Logs: tighten insert to authenticated linked to a comprobante (keep simple)
DROP POLICY "Authenticated users can insert logs" ON public.comprobantes_logs;
CREATE POLICY "Authenticated insert logs" ON public.comprobantes_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
