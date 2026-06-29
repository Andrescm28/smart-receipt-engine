
-- =========================================================
-- PROFILES
-- =========================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins manage profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile + default role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'cashier'::public.app_role)
  )
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- CATEGORIES
-- =========================================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories readable by authenticated" ON public.categories
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage categories" ON public.categories
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- PRODUCTS
-- =========================================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  cost NUMERIC(12,2) DEFAULT 0 CHECK (cost >= 0),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  category TEXT,
  unit TEXT NOT NULL DEFAULT 'Unidad',
  stock NUMERIC(12,3) NOT NULL DEFAULT 0,
  min_stock NUMERIC(12,3) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 13,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products readable by authenticated" ON public.products
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage products" ON public.products
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_products_code ON public.products(code);
CREATE INDEX idx_products_category ON public.products(category_id);

-- =========================================================
-- INVOICES
-- =========================================================
CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq START 1000;

CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE DEFAULT ('F-' || lpad(nextval('public.invoice_number_seq')::text, 6, '0')),
  cashier_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  customer_name TEXT,
  customer_id_number TEXT,
  customer_email TEXT,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cash', -- cash | card | split
  status TEXT NOT NULL DEFAULT 'paid', -- paid | cancelled | pending
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cashiers read own invoices, admins all" ON public.invoices
  FOR SELECT TO authenticated
  USING (cashier_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated create own invoices" ON public.invoices
  FOR INSERT TO authenticated
  WITH CHECK (cashier_id = auth.uid());
CREATE POLICY "Admins update invoices" ON public.invoices
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete invoices" ON public.invoices
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER invoices_updated_at BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_invoices_cashier ON public.invoices(cashier_id);
CREATE INDEX idx_invoices_created ON public.invoices(created_at DESC);

-- =========================================================
-- INVOICE ITEMS
-- =========================================================
CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_code TEXT,
  product_name TEXT NOT NULL,
  unit TEXT,
  quantity NUMERIC(12,3) NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12,2) NOT NULL,
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 13,
  tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  line_total NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_items TO authenticated;
GRANT ALL ON public.invoice_items TO service_role;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Items follow invoice access" ON public.invoice_items
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.invoices i WHERE i.id = invoice_id
    AND (i.cashier_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  ));
CREATE POLICY "Insert items on own invoices" ON public.invoice_items
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.invoices i WHERE i.id = invoice_id AND i.cashier_id = auth.uid()
  ));
CREATE POLICY "Admins manage items" ON public.invoice_items
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_invoice_items_invoice ON public.invoice_items(invoice_id);

-- =========================================================
-- PAYMENT DETAILS
-- =========================================================
CREATE TABLE public.payment_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  method TEXT NOT NULL, -- cash | card
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  received NUMERIC(12,2),
  change NUMERIC(12,2),
  reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_details TO authenticated;
GRANT ALL ON public.payment_details TO service_role;
ALTER TABLE public.payment_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Payments follow invoice access" ON public.payment_details
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.invoices i WHERE i.id = invoice_id
    AND (i.cashier_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  ));
CREATE POLICY "Insert payments on own invoices" ON public.payment_details
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.invoices i WHERE i.id = invoice_id AND i.cashier_id = auth.uid()
  ));
CREATE POLICY "Admins manage payments" ON public.payment_details
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- CASH CUTS
-- =========================================================
CREATE TABLE public.cash_cuts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cashier_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  opened_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  system_cash NUMERIC(12,2) NOT NULL DEFAULT 0,
  system_card NUMERIC(12,2) NOT NULL DEFAULT 0,
  system_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  counted_cash NUMERIC(12,2) NOT NULL DEFAULT 0,
  difference NUMERIC(12,2) NOT NULL DEFAULT 0,
  invoice_count INTEGER NOT NULL DEFAULT 0,
  denominations JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cash_cuts TO authenticated;
GRANT ALL ON public.cash_cuts TO service_role;
ALTER TABLE public.cash_cuts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cashiers see own cuts, admins all" ON public.cash_cuts
  FOR SELECT TO authenticated
  USING (cashier_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Cashiers create own cuts" ON public.cash_cuts
  FOR INSERT TO authenticated
  WITH CHECK (cashier_id = auth.uid());
CREATE POLICY "Admins manage cuts" ON public.cash_cuts
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- INVENTORY MOVEMENTS
-- =========================================================
CREATE TABLE public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL, -- sale | purchase | adjustment | return
  quantity NUMERIC(12,3) NOT NULL,
  previous_stock NUMERIC(12,3),
  new_stock NUMERIC(12,3),
  reference_id UUID,
  reference_type TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_movements TO authenticated;
GRANT ALL ON public.inventory_movements TO service_role;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Movements readable by authenticated" ON public.inventory_movements
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert movements" ON public.inventory_movements
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins manage movements" ON public.inventory_movements
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_inv_mov_product ON public.inventory_movements(product_id);

-- =========================================================
-- TRIGGER: auto-reduce stock + log movement on invoice item insert
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_invoice_item_stock()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  prev_stock NUMERIC(12,3);
BEGIN
  IF NEW.product_id IS NOT NULL THEN
    SELECT stock INTO prev_stock FROM public.products WHERE id = NEW.product_id FOR UPDATE;
    UPDATE public.products
      SET stock = stock - NEW.quantity
      WHERE id = NEW.product_id;

    INSERT INTO public.inventory_movements
      (product_id, movement_type, quantity, previous_stock, new_stock, reference_id, reference_type, user_id, notes)
    VALUES
      (NEW.product_id, 'sale', -NEW.quantity, prev_stock, prev_stock - NEW.quantity,
       NEW.invoice_id, 'invoice', auth.uid(), 'Venta automática');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_invoice_item_stock
  AFTER INSERT ON public.invoice_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_invoice_item_stock();

-- =========================================================
-- SEED DATA
-- =========================================================
INSERT INTO public.categories (name, description) VALUES
  ('Bebidas', 'Refrescos, agua, jugos'),
  ('Panadería', 'Pan y productos horneados'),
  ('Lácteos', 'Leche, yogurt, quesos'),
  ('Granos y Cereales', 'Arroz, frijoles, cereales'),
  ('Carnes', 'Pollo, res, cerdo'),
  ('Frutas y Verduras', 'Productos frescos'),
  ('Limpieza', 'Productos de limpieza'),
  ('Snacks', 'Galletas, papas, dulces'),
  ('Abarrotes', 'Aceites, salsas, condimentos')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.products (code, name, price, category, unit, stock, min_stock) VALUES
  ('BEB001','Coca Cola 500ml',1.25,'Bebidas','Unidad',120,20),
  ('BEB002','Agua Purificada 1L',0.75,'Bebidas','Unidad',200,30),
  ('PAN001','Pan Blanco Molde',2.50,'Panadería','Unidad',45,10),
  ('LAC001','Leche Entera 1L',3.20,'Lácteos','Unidad',60,15),
  ('LAC002','Yogurt Natural 500g',2.80,'Lácteos','Unidad',40,10),
  ('GRA001','Arroz Blanco 1kg',1.90,'Granos y Cereales','Kilogramo',85,20),
  ('GRA002','Frijoles Rojos 1kg',2.40,'Granos y Cereales','Kilogramo',70,15),
  ('CAR001','Pechuga de Pollo 1kg',5.50,'Carnes','Kilogramo',30,10),
  ('FRU001','Banano (Libra)',0.60,'Frutas y Verduras','Libra',150,30),
  ('LIM001','Detergente Líquido 1L',4.50,'Limpieza','Unidad',35,10),
  ('SNK001','Galletas Surtidas 400g',3.10,'Snacks','Paquete',55,15),
  ('ACE001','Aceite Vegetal 1L',3.75,'Abarrotes','Unidad',48,10)
ON CONFLICT (code) DO NOTHING;
