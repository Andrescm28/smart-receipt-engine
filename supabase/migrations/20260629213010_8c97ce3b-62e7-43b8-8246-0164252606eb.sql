
-- Tighten inventory_movements insert
DROP POLICY IF EXISTS "Authenticated insert movements" ON public.inventory_movements;
CREATE POLICY "Authenticated insert own movements" ON public.inventory_movements
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Revoke execute on internal trigger functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_invoice_item_stock() FROM PUBLIC, anon, authenticated;
