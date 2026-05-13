-- Per-user orders for authenticated InsForge JWT (RLS uses auth.uid())

CREATE TABLE public.user_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  order_ref text NOT NULL,
  status_text text NOT NULL DEFAULT 'Processing',
  courier text NOT NULL DEFAULT 'Demo courier',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX user_orders_user_created_idx ON public.user_orders (user_id, created_at DESC);

ALTER TABLE public.user_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_orders_own_select ON public.user_orders
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY user_orders_own_insert ON public.user_orders
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY user_orders_own_update ON public.user_orders
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

REVOKE ALL ON public.user_orders FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE ON public.user_orders TO authenticated;
