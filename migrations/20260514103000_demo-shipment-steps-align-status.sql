-- Align demo_shipments steps with status_text so the timeline "current" step matches the header line.
-- The UI treats the last step in the array as the highlighted current stage after the intro animation.

UPDATE public.demo_shipments
SET steps = $json$[
  {"title":"Order received","time":"May 13, 2026 · 8:05 AM","detail":"Marketplace sent order to seller (demo)."},
  {"title":"Picklist ready","time":"May 13, 2026 · 10:20 AM","detail":"SKU scan complete at warehouse (demo)."},
  {"title":"Packing at seller hub","time":"May 13, 2026 · 2:40 PM","detail":"Label and invoice ready; awaiting courier pickup (demo)."}
]$json$::jsonb
WHERE reference = 'ORD-2026-1001' AND tab_key = 'order';

UPDATE public.demo_shipments
SET steps = $json$[
  {"title":"Order received","time":"May 13, 2026 · 6:00 AM","detail":"Packing list verified."},
  {"title":"Picklist in progress","time":"May 13, 2026 · 9:30 AM","detail":"Items being picked from bins (demo)."},
  {"title":"Packing at seller hub","time":"May 13, 2026 · 1:45 PM","detail":"Awaiting pickup window; courier not yet assigned (demo)."}
]$json$::jsonb
WHERE reference = 'ORD-2026-4011' AND tab_key = 'order';

UPDATE public.demo_shipments
SET steps = $json$[
  {"title":"Order received","time":"Apr 20, 2026 · 11:00 AM","detail":"Original forward journey started."},
  {"title":"Picked up","time":"Apr 20, 2026 · 4:00 PM","detail":"First mile complete."},
  {"title":"In transit","time":"Apr 22, 2026 · 9:30 AM","detail":"Customer refused; RTO triggered (demo)."},
  {"title":"Out for delivery","time":"Apr 24, 2026 · 8:00 AM","detail":"RTO shipment moving back to seller (demo)."}
]$json$::jsonb
WHERE reference = 'ORD-2026-3050' AND tab_key = 'order';
