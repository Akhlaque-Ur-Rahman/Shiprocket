-- Extra demo_shipments: multiple references and order lifecycle statuses (demo only)

INSERT INTO public.demo_shipments (reference, tab_key, courier, id_label, status_text, steps) VALUES
(
  'BD1122334455',
  'awb',
  'Blue Dart (demo)',
  'Reference',
  'Delivered: signed by customer (demo)',
  $json$[
    {"title":"Order received","time":"May 8, 2026 · 8:05 AM","detail":"Seller handed over to courier partner."},
    {"title":"Picked up","time":"May 8, 2026 · 3:20 PM","detail":"First mile scan at origin city."},
    {"title":"In transit","time":"May 9, 2026 · 11:10 AM","detail":"Linehaul reached sort hub near destination."},
    {"title":"Out for delivery","time":"May 10, 2026 · 9:45 AM","detail":"Rider assigned for last mile."},
    {"title":"Delivered","time":"May 10, 2026 · 4:18 PM","detail":"Signed. OTP verified at door (demo)."}
  ]$json$::jsonb
),
(
  'XP9988776655',
  'awb',
  'Xpressbees (demo)',
  'Reference',
  'Latest scan: in transit to destination hub',
  $json$[
    {"title":"Order received","time":"May 12, 2026 · 7:40 AM","detail":"Manifest created at seller warehouse."},
    {"title":"Picked up","time":"May 12, 2026 · 5:15 PM","detail":"Pickup completed from seller address."},
    {"title":"In transit","time":"May 13, 2026 · 6:30 AM","detail":"Mid mile movement between hubs (demo)."},
    {"title":"Out for delivery","time":"May 13, 2026 · 2:00 PM","detail":"Pending: not yet out on vehicle."}
  ]$json$::jsonb
),
(
  'DT5544332211',
  'awb',
  'Delhivery (demo)',
  'Reference',
  'Awaiting courier pickup from seller',
  $json$[
    {"title":"Order received","time":"May 13, 2026 · 10:00 AM","detail":"Label generated, pickup scheduled (demo)."},
    {"title":"Picked up","time":"May 13, 2026 · 12:00 PM","detail":"Awaiting first pickup scan."},
    {"title":"In transit","time":"May 13, 2026 · 12:00 PM","detail":"Not started until pickup completes."},
    {"title":"Out for delivery","time":"May 13, 2026 · 12:00 PM","detail":"Not started until pickup completes."}
  ]$json$::jsonb
),
(
  'ORD-2026-2040',
  'order',
  'Blue Dart (demo)',
  'Order ID',
  'Delivered: closed successfully (demo)',
  $json$[
    {"title":"Order received","time":"May 1, 2026 · 9:00 AM","detail":"Order confirmed by marketplace."},
    {"title":"Picked up","time":"May 1, 2026 · 6:30 PM","detail":"Handover from seller to courier."},
    {"title":"In transit","time":"May 2, 2026 · 8:20 AM","detail":"Regional hub processing."},
    {"title":"Out for delivery","time":"May 3, 2026 · 10:05 AM","detail":"Rider out with parcel."},
    {"title":"Delivered","time":"May 3, 2026 · 3:40 PM","detail":"Customer received (demo)."}
  ]$json$::jsonb
),
(
  'ORD-2026-3050',
  'order',
  'Delhivery (demo)',
  'Order ID',
  'Return to origin in progress (demo)',
  $json$[
    {"title":"Order received","time":"Apr 20, 2026 · 11:00 AM","detail":"Original forward journey started."},
    {"title":"Picked up","time":"Apr 20, 2026 · 4:00 PM","detail":"First mile complete."},
    {"title":"In transit","time":"Apr 22, 2026 · 9:30 AM","detail":"Customer refused; RTO triggered (demo)."},
    {"title":"Out for delivery","time":"Apr 24, 2026 · 8:00 AM","detail":"RTO shipment moving back to seller."},
    {"title":"Delivered","time":"Apr 25, 2026 · 2:10 PM","detail":"Returned to seller hub (demo)."}
  ]$json$::jsonb
),
(
  'ORD-2026-4011',
  'order',
  'Xpressbees (demo)',
  'Order ID',
  'Latest update: packed at seller hub (demo)',
  $json$[
    {"title":"Order received","time":"May 13, 2026 · 6:00 AM","detail":"Packing list verified."},
    {"title":"Picked up","time":"May 13, 2026 · 11:00 AM","detail":"Awaiting pickup window."},
    {"title":"In transit","time":"May 13, 2026 · 11:00 AM","detail":"Not started until pickup."},
    {"title":"Out for delivery","time":"May 13, 2026 · 11:00 AM","detail":"Not started until pickup."}
  ]$json$::jsonb
),
(
  '9123456789',
  'mobile',
  'Blue Dart (demo)',
  'Mobile',
  '2 parcels: one delivered, one out for delivery (demo)',
  $json$[
    {"title":"Order received","time":"May 11, 2026 · 8:15 AM","detail":"Multi-piece order under this mobile (demo)."},
    {"title":"Picked up","time":"May 11, 2026 · 4:00 PM","detail":"Both units collected from seller."},
    {"title":"In transit","time":"May 12, 2026 · 7:50 AM","detail":"Unit A delivered; unit B still on vehicle (demo)."},
    {"title":"Out for delivery","time":"May 12, 2026 · 1:20 PM","detail":"Unit B expected today (demo)."},
    {"title":"Delivered","time":"May 11, 2026 · 6:05 PM","detail":"Unit A delivered earlier same day (demo)."}
  ]$json$::jsonb
),
(
  '9988776655',
  'mobile',
  'Xpressbees (demo)',
  'Mobile',
  'Single parcel: exception at hub (demo)',
  $json$[
    {"title":"Order received","time":"May 9, 2026 · 5:30 PM","detail":"Booking created."},
    {"title":"Picked up","time":"May 10, 2026 · 11:45 AM","detail":"Pickup done."},
    {"title":"In transit","time":"May 11, 2026 · 3:00 PM","detail":"Delayed scan: address clarification needed (demo)."},
    {"title":"Out for delivery","time":"May 12, 2026 · 9:00 AM","detail":"On hold until support resolves (demo)."}
  ]$json$::jsonb
);
