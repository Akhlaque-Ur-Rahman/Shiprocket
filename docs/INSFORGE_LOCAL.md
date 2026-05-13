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

Optional: keep secrets out of git by copying `insforge-config.example.js` to `insforge-config.local.js` (gitignored), filling values, adding `<script src="insforge-config.local.js"></script>` **before** `insforge-client.js` on pages that use InsForge. The committed [`insforge-config.js`](../insforge-config.js) ships with `enabled: false` and placeholder `baseUrl` / `anonAccessToken` so the repo stays token-free; turn InsForge on only in your local file or local edits you do not commit.

## Email sign up and sign in (InsForge Auth REST)

When `enabled` is `true` and `baseUrl` is set, the site calls InsForge native auth endpoints (see [Authentication API](https://docs.insforge.dev/sdks/rest/auth.md)):

- **Register:** `POST /api/auth/users?client_type=mobile` with `email`, `password` (minimum 8 characters), and `name`. The `mobile` client type returns `accessToken` and `refreshToken` in the JSON body (good for static hosting without relying on httpOnly cookies).
- **Sign in:** `POST /api/auth/sessions?client_type=mobile` with `email` and `password`.
- **Tokens** are stored in `sessionStorage` under `insforge_access_token`, `insforge_refresh_token`, and `insforge_user`.

Implementation files: [`insforge-auth-client.js`](../insforge-auth-client.js), [`auth-demo.js`](../auth-demo.js), [`insforge-client.js`](../insforge-client.js) (database calls use the user access token when present, otherwise the anon token for public `demo_shipments` reads).

If your InsForge project requires **email verification**, the register response can set `requireEmailVerification: true` and omit tokens until the user verifies. The UI shows a short message in that case.

## User orders table

Migration [`migrations/20260515120000_user_orders.sql`](../migrations/20260515120000_user_orders.sql) creates `user_orders` with RLS so the **authenticated** role can only read and write rows where `user_id = auth.uid()`. After applying migrations, new sign ups insert one sample order row via the browser (see `auth-demo.js`).

The **Orders** page ([`orders.html`](../orders.html)) loads `GET /api/database/records/user_orders` with the signed-in user JWT.

## CORS and origins

Your InsForge project must allow the origin you use to serve this static site (for example `http://localhost:3000`). Configure allowed origins in the InsForge dashboard if browser requests are blocked by CORS.

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
