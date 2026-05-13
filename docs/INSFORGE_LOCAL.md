# InsForge local setup (beginner)

## Why a static server

Browsers block many `fetch` calls from `file://`. Serve the folder over HTTP, for example:

```bash
npx --yes serve .
```

Then open the printed `http://localhost:...` URL and use the shipping page.

## Turn on DB-backed demo tracking

1. Link the project (once per machine), if not already:

```bash
npx @insforge/cli link --api-base-url "<your projectUrl>" --api-key "<accessApiKey>"
```

2. Apply migrations (already in `migrations/` in this repo):

```bash
npx @insforge/cli db migrations up --all -y
```

3. Print an anonymous JWT (safe for the browser with RLS):

```bash
node scripts/print-insforge-anon-token.cjs
```

4. Edit [`insforge-config.js`](../insforge-config.js): set `enabled` to `true`, set `baseUrl` to your InsForge OSS host (same as `oss_host` in `.insforge/project.json`), paste the token into `anonAccessToken`.

Optional: keep secrets out of git by copying `insforge-config.example.js` to `insforge-config.local.js`, filling values, adding `<script src="insforge-config.local.js"></script>` before `insforge-client.js` in `shipping.html`, and leaving the committed `insforge-config.js` with `enabled: false`.

## Seed demo tracking IDs

With InsForge enabled, these values load from the `demo_shipments` table. Pick the tab (AWB / Order ID / Mobile), enter the reference, then Track.

| Tab | Reference | Status line (demo) |
|-----|-----------|-------------------|
| AWB | `SRDEMO123` | Out for delivery |
| AWB | `BD1122334455` | Delivered: signed by customer |
| AWB | `XP9988776655` | In transit to destination hub |
| AWB | `DT5544332211` | Awaiting courier pickup |
| Order ID | `ORD-2026-1001` | Packed at seller hub |
| Order ID | `ORD-2026-2040` | Delivered: closed successfully |
| Order ID | `ORD-2026-3050` | Return to origin in progress |
| Order ID | `ORD-2026-4011` | Packed at seller hub |
| Mobile | `9876543210` | Multi-order / Xpressbees style |
| Mobile | `9123456789` | Mixed: delivered + out for delivery |
| Mobile | `9988776655` | Exception / delay at hub |

Any other input falls back to the built-in mock timeline.

## Claim trial project

Trial projects expire. Open the claim link from your InsForge signup or dashboard before the trial ends so data is kept.
