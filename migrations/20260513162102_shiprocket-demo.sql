-- Demo tracking rows for the shipping page (InsForge REST: /api/database/records/demo_shipments)

CREATE TABLE public.demo_shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL,
  tab_key text NOT NULL CHECK (tab_key IN ('awb', 'order', 'mobile')),
  courier text NOT NULL,
  id_label text NOT NULL,
  status_text text NOT NULL,
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX demo_shipments_reference_tab_idx ON public.demo_shipments (reference, tab_key);

ALTER TABLE public.demo_shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY demo_shipments_anon_select ON public.demo_shipments
  FOR SELECT TO anon USING (true);

CREATE POLICY demo_shipments_anon_insert ON public.demo_shipments
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY demo_shipments_auth_select ON public.demo_shipments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY demo_shipments_auth_insert ON public.demo_shipments
  FOR INSERT TO authenticated WITH CHECK (true);

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT ON public.demo_shipments TO anon, authenticated;

INSERT INTO public.demo_shipments (reference, tab_key, courier, id_label, status_text, steps) VALUES
(
  'SRDEMO123',
  'awb',
  'Blue Dart (demo)',
  'Reference',
  'Latest scan: out for delivery',
  $json$[
    {"title":"Order received","time":"May 10, 2026 · 9:12 AM","detail":"Manifest created at origin hub."},
    {"title":"Picked up","time":"May 10, 2026 · 2:40 PM","detail":"Courier collected from seller."},
    {"title":"In transit","time":"May 11, 2026 · 6:05 AM","detail":"In sort facility, moving to destination city."},
    {"title":"Out for delivery","time":"May 11, 2026 · 12:30 PM","detail":"Delivery executive assigned."}
  ]$json$::jsonb
),
(
  'ORD-2026-1001',
  'order',
  'Delhivery (demo)',
  'Order ID',
  'Latest update: packed at seller hub (demo)',
  $json$[
    {"title":"Order received","time":"May 10, 2026 · 9:12 AM","detail":"Manifest created at origin hub."},
    {"title":"Picked up","time":"May 10, 2026 · 2:40 PM","detail":"Courier collected from seller."},
    {"title":"In transit","time":"May 11, 2026 · 6:05 AM","detail":"In sort facility, moving to destination city."},
    {"title":"Out for delivery","time":"May 11, 2026 · 12:30 PM","detail":"Delivery executive assigned."}
  ]$json$::jsonb
),
(
  '9876543210',
  'mobile',
  'Xpressbees (demo)',
  'Mobile',
  'Multi-order lookup: 3 active parcels (demo)',
  $json$[
    {"title":"Order received","time":"May 10, 2026 · 9:12 AM","detail":"Manifest created at origin hub."},
    {"title":"Picked up","time":"May 10, 2026 · 2:40 PM","detail":"Courier collected from seller."},
    {"title":"In transit","time":"May 11, 2026 · 6:05 AM","detail":"In sort facility, moving to destination city."},
    {"title":"Out for delivery","time":"May 11, 2026 · 12:30 PM","detail":"Delivery executive assigned."}
  ]$json$::jsonb
);
