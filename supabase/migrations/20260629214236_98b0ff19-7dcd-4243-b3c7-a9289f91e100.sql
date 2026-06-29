-- Supermarkets table
CREATE TABLE public.supermarkets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.supermarkets TO authenticated;
GRANT ALL ON public.supermarkets TO service_role;
ALTER TABLE public.supermarkets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view supermarkets" ON public.supermarkets
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage supermarkets insert" ON public.supermarkets
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage supermarkets update" ON public.supermarkets
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage supermarkets delete" ON public.supermarkets
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_supermarkets_updated_at
  BEFORE UPDATE ON public.supermarkets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add supermarket_id to profiles
ALTER TABLE public.profiles ADD COLUMN supermarket_id UUID REFERENCES public.supermarkets(id) ON DELETE SET NULL;

-- Allow admins to view all profiles (in addition to existing self-view)
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Update handle_new_user to capture supermarket_id from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, supermarket_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    NULLIF(NEW.raw_user_meta_data->>'supermarket_id','')::uuid
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'cashier'::public.app_role)
  )
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$function$;