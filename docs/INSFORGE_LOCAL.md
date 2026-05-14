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

4. Prefer copying [`insforge-config.example.js`](../insforge-config.example.js) to `insforge-config.local.js` (gitignored): set `enabled` to `true`, set `baseUrl` to your InsForge OSS host (same as `oss_host` in `.insforge/project.json`), paste the token into `anonAccessToken`, and add `<script src="insforge-config.local.js"></script>` **before** `insforge-client.js` on pages that use InsForge. For a quick local test only, you may edit [`insforge-config.js`](../insforge-config.js) instead, but do not commit real tokens.

## Live versus local

Use the same **local override file** pattern on your laptop and on your production static host:

- **Repository default:** keep [`insforge-config.js`](../insforge-config.js) with `enabled: false` and placeholders so forks stay token-free.
- **Local dev:** `insforge-config.local.js` points at your trial or dev InsForge project; allow `http://localhost:PORT` in CORS.
- **Live site:** build or deploy injects `insforge-config.local.js` (or an equivalent first script) with production `baseUrl` and fresh tokens. Rotate `anonAccessToken` when you rotate keys.

## Email sign up and sign in (InsForge Auth REST)

When `enabled` is `true` and `baseUrl` is set, the site calls InsForge native auth endpoints (see [Authentication API](https://docs.insforge.dev/sdks/rest/auth.md)):

- **Register:** `POST /api/auth/users?client_type=mobile` with `email`, `password` (minimum 8 characters), and `name`. The `mobile` client type returns `accessToken` and `refreshToken` in the JSON body (good for static hosting without relying on httpOnly cookies).
- **Sign in:** `POST /api/auth/sessions?client_type=mobile` with `email` and `password`.
- **Tokens** are stored in `sessionStorage` under `insforge_access_token`, `insforge_refresh_token`, and `insforge_user`.

Implementation files: [`insforge-auth-client.js`](../insforge-auth-client.js), [`auth-demo.js`](../auth-demo.js), [`insforge-client.js`](../insforge-client.js) (database calls use the user access token when present, otherwise the anon token for public `demo_shipments` reads).

If your InsForge project requires **email verification**, the register response can set `requireEmailVerification: true` and omit tokens until the user verifies. The UI shows a short message in that case.

## User orders table

Migration [`migrations/20260515120000_user_orders.sql`](../migrations/20260515120000_user_orders.sql) creates `user_orders` with RLS so the **authenticated** role can only read and write rows where `user_id = auth.uid()`. **Sign up does not insert any rows:** new accounts see an empty Orders list until you seed data.

The **Orders** page ([`orders.html`](../orders.html)) loads `GET /api/database/records/user_orders` with the signed-in user JWT.

### Seeding orders for a user (manual)

1. Create the user (sign up in the app, or create the auth user in your InsForge project).
2. Copy their `user` id from the auth payload or dashboard.
3. Insert rows with that same `user_id` (must match `auth.uid()` when that user is signed in, or use a trusted SQL path your project allows):

```sql
INSERT INTO public.user_orders (user_id, order_ref, status_text, courier)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'ORD-2026-1001',
  'In transit',
  'Delhivery'
);
```

Replace the UUID with the real account id. Repeat `INSERT` for more orders. Align `order_ref` with `demo_shipments.reference` (and `tab_key`) if you want the Track dialog to resolve to seeded timeline rows instead of the generic mock.

### SQL batch: several users and matching order rows

End-user accounts (email, password) are created in **Authentication**, not inside `public.user_orders`. After each user exists, copy their **user id** from the Auth Users screen (same UUID the app stores as `user.id`).

`user_orders` uses RLS with `auth.uid()`. Running `INSERT` from a dashboard SQL editor often uses a role that must be allowed to bypass or satisfy those policies. Follow your host docs: typically a **service role** connection, or run inserts while authenticated as that user through the Records API.

For **Order ID** tracking, use `order_ref` values that already exist in `public.demo_shipments` with `tab_key = 'order'`: `ORD-2026-1001`, `ORD-2026-2040`, `ORD-2026-3050`, `ORD-2026-4011` (see migrations under `migrations/`).

```sql
INSERT INTO public.user_orders (user_id, order_ref, status_text, courier) VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 'ORD-2026-1001', 'Packed at seller hub', 'Delhivery'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'ORD-2026-2040', 'Delivered', 'Blue Dart'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'ORD-2026-3050', 'Return to origin in progress', 'Delhivery'),
  ('44444444-4444-4444-4444-444444444444'::uuid, 'ORD-2026-4011', 'Packed at seller hub', 'Xpressbees');
```

Replace each UUID with a real Auth user id. You can add more rows per user with additional `INSERT` statements. `status_text` and `courier` are what the Orders table shows; they do not have to equal `demo_shipments.status_text`, but matching `order_ref` helps the Track dialog load the seeded steps.

### Tracking dialog fallbacks

[`shipping.js`](../shipping.js) shows a demo timeline plus a short note when: InsForge is not configured for this build (`preview_disabled`), the browser is offline or the request looks like a network failure (`offline`), the API errors (`error`), or no `demo_shipments` row matches the input (`no_match`).

## Bulk test users (script)

Use [`scripts/seed-insforge-test-users.cjs`](../scripts/seed-insforge-test-users.cjs) to register several fictional `@example.com` accounts and insert `user_orders` rows whose `order_ref` values match existing `demo_shipments` order IDs (`ORD-2026-1001`, `ORD-2026-2040`, and so on). Re-runs skip rows that are already present for that user.

**Environment (do not commit secrets):**

- `INSFORGE_BASE_URL`: same host as `baseUrl` in [`insforge-config.js`](../insforge-config.js) (no trailing slash required).
- `SEED_USER_PASSWORD`: one shared password (minimum 8 characters) for every seed account.

Copy [`scripts/seed-env.example`](../scripts/seed-env.example) to a **gitignored** file at the repo root named `.env.seed`, fill real values, then export them in your shell before running the script (this repo does not load `.env` automatically). The file `.env.seed` is listed in [`.gitignore`](../.gitignore).

PowerShell example:

```powershell
$env:INSFORGE_BASE_URL="https://YOUR_APPKEY.YOUR_REGION.insforge.app"
$env:SEED_USER_PASSWORD="YourStrongPass123"
node scripts/seed-insforge-test-users.cjs
```

**Requirements:** InsForge Auth must return tokens on register (turn off **email verification** for this dev flow, or verify in the dashboard first). If the script exits with a verification message, fix project settings and run again.

**Security:** The script prints emails and display names to the terminal only. It does **not** echo your password. Save the output somewhere private, or rotate `SEED_USER_PASSWORD` after demos.

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

Any other input falls back to the built-in mock timeline. The same mock path is used when InsForge is not configured for this build, or when the network cannot reach your project (see the note inside the tracking dialog).

## Claim trial project

Trial projects expire. Open the claim link from your InsForge signup or dashboard before the trial ends so data is kept.
