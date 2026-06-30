
CREATE TABLE IF NOT EXISTS public.inventory_adjustment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  reviewed_by UUID REFERENCES auth.users(id),
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('remove','add')),
  quantity NUMERIC(12,3) NOT NULL CHECK (quantity > 0),
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_adjustment_requests TO authenticated;
GRANT ALL ON public.inventory_adjustment_requests TO service_role;

ALTER TABLE public.inventory_adjustment_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Requesters and admins can view requests"
  ON public.inventory_adjustment_requests FOR SELECT TO authenticated
  USING (requested_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Inventory and admin can create requests"
  ON public.inventory_adjustment_requests FOR INSERT TO authenticated
  WITH CHECK (
    requested_by = auth.uid()
    AND (public.has_role(auth.uid(), 'inventory') OR public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Only admin can review requests"
  ON public.inventory_adjustment_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_iar_updated_at
  BEFORE UPDATE ON public.inventory_adjustment_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.apply_inventory_adjustment()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  prev_stock NUMERIC(12,3);
  delta NUMERIC(12,3);
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    SELECT stock INTO prev_stock FROM public.products WHERE id = NEW.product_id FOR UPDATE;
    delta := CASE WHEN NEW.adjustment_type = 'remove' THEN -NEW.quantity ELSE NEW.quantity END;
    UPDATE public.products SET stock = stock + delta WHERE id = NEW.product_id;

    INSERT INTO public.inventory_movements
      (product_id, movement_type, quantity, previous_stock, new_stock, reference_id, reference_type, user_id, notes)
    VALUES
      (NEW.product_id, 'adjustment', delta, prev_stock, prev_stock + delta,
       NEW.id, 'adjustment_request', NEW.reviewed_by,
       COALESCE(NEW.review_notes, NEW.reason));

    NEW.reviewed_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_apply_inventory_adjustment ON public.inventory_adjustment_requests;
CREATE TRIGGER trg_apply_inventory_adjustment
  BEFORE UPDATE ON public.inventory_adjustment_requests
  FOR EACH ROW EXECUTE FUNCTION public.apply_inventory_adjustment();

CREATE POLICY "Inventory can insert products"
  ON public.products FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'inventory'));

CREATE POLICY "Inventory can update products"
  ON public.products FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'inventory'))
  WITH CHECK (public.has_role(auth.uid(), 'inventory'));
