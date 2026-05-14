#!/usr/bin/env node
/**
 * Registers natural-looking test users on InsForge Auth and inserts user_orders
 * aligned with demo_shipments order IDs (tab_key = order).
 *
 * Required env:
 *   INSFORGE_BASE_URL  (same as insforge-config.js baseUrl, no trailing slash required)
 *   SEED_USER_PASSWORD (shared password for all seed accounts, min 8 chars)
 *
 * Usage:
 *   set INSFORGE_BASE_URL=https://...
 *   set SEED_USER_PASSWORD=YourStrongPass123
 *   node scripts/seed-insforge-test-users.cjs
 *
 * Do not commit real passwords. If the project requires email verification,
 * registration will not return a token; use a dev project with verification off
 * or verify emails in the dashboard first.
 */

const CLIENT_TYPE = "mobile";

/** Matches references in migrations demo_shipments (tab_key = order). */
const SEED_PERSONAS = [
  {
    name: "Meera Kapoor",
    email: "meera.kapoor@example.com",
    orders: [
      { order_ref: "ORD-2026-1001", status_text: "Packed at seller hub", courier: "Delhivery" },
    ],
  },
  {
    name: "Vikram Singh",
    email: "vikram.singh@example.com",
    orders: [
      { order_ref: "ORD-2026-2040", status_text: "Delivered", courier: "Blue Dart" },
    ],
  },
  {
    name: "Ananya Desai",
    email: "ananya.desai@example.com",
    orders: [
      { order_ref: "ORD-2026-3050", status_text: "Return to origin in progress", courier: "Delhivery" },
    ],
  },
  {
    name: "Rahul Menon",
    email: "rahul.menon@example.com",
    orders: [
      { order_ref: "ORD-2026-4011", status_text: "Packed at seller hub", courier: "Xpressbees" },
    ],
  },
  {
    name: "Priya Nair",
    email: "priya.nair@example.com",
    orders: [
      { order_ref: "ORD-2026-1001", status_text: "Packed at seller hub", courier: "Delhivery" },
      { order_ref: "ORD-2026-2040", status_text: "Delivered", courier: "Blue Dart" },
    ],
  },
];

function baseUrl() {
  const raw = process.env.INSFORGE_BASE_URL || "";
  return raw.replace(/\/$/, "");
}

function seedPassword() {
  return process.env.SEED_USER_PASSWORD || "";
}

async function parseJsonSafe(res) {
  const t = await res.text();
  if (!t) return null;
  try {
    return JSON.parse(t);
  } catch {
    return { raw: t };
  }
}

async function authSignIn(base, email, password) {
  const res = await fetch(`${base}/api/auth/sessions?client_type=${encodeURIComponent(CLIENT_TYPE)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || res.statusText;
    const err = new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
    err.status = res.status;
    throw err;
  }
  return data;
}

async function authRegister(base, email, password, name) {
  const res = await fetch(`${base}/api/auth/users?client_type=${encodeURIComponent(CLIENT_TYPE)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || res.statusText;
    const err = new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
    err.status = res.status;
    throw err;
  }
  if (data.requireEmailVerification) {
    const err = new Error(
      "Email verification is required for this project. Disable it for dev or verify the inbox, then re-run."
    );
    err.requireEmailVerification = true;
    throw err;
  }
  return data;
}

async function fetchUserOrders(base, token) {
  const url = `${base}/api/database/records/user_orders?limit=100`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || res.statusText;
    throw new Error(`List user_orders ${res.status}: ${typeof msg === "string" ? msg : JSON.stringify(msg)}`);
  }
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.value)) return data.value;
  if (Array.isArray(data.data)) return data.data;
  return [];
}

async function postUserOrders(base, token, userId, rows) {
  const url = `${base}/api/database/records/user_orders`;
  const body = rows.map((r) => ({
    user_id: userId,
    order_ref: r.order_ref,
    status_text: r.status_text,
    courier: r.courier,
  }));
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  });
  const data = await parseJsonSafe(res);
  if (res.ok) return { ok: true, data };
  return { ok: false, status: res.status, data };
}

async function postUserOrdersOne(base, token, userId, row) {
  return postUserOrders(base, token, userId, [row]);
}

async function ensureSession(base, email, password, name) {
  try {
    const data = await authSignIn(base, email, password);
    return { accessToken: data.accessToken, user: data.user };
  } catch (e) {
    const tryRegister =
      e.status === 401 ||
      e.status === 400 ||
      /not found|invalid|wrong|credentials|unauthorized/i.test(String(e.message || ""));
    if (!tryRegister) throw e;
    try {
      const data = await authRegister(base, email, password, name);
      if (!data.accessToken) {
        throw new Error("Register succeeded but no accessToken (check email verification settings).");
      }
      return { accessToken: data.accessToken, user: data.user };
    } catch (regErr) {
      if (/already exists|already registered|duplicate|409/i.test(String(regErr.message || ""))) {
        const data = await authSignIn(base, email, password);
        return { accessToken: data.accessToken, user: data.user };
      }
      throw regErr;
    }
  }
}

function isDuplicateError(status, body) {
  const s = JSON.stringify(body || {}).toLowerCase();
  if (status === 409) return true;
  if (/duplicate|unique|already exists/i.test(s)) return true;
  return false;
}

async function seedPersona(base, password, persona) {
  const { accessToken, user } = await ensureSession(base, persona.email, password, persona.name);
  const userId = user && user.id;
  if (!userId) throw new Error("No user.id on auth response");

  const existing = await fetchUserOrders(base, accessToken);
  const existingRefs = new Set(
    existing.map((r) => r.order_ref || r.orderRef).filter(Boolean)
  );

  const toInsert = persona.orders.filter((o) => !existingRefs.has(o.order_ref));
  if (!toInsert.length) {
    return { email: persona.email, name: persona.name, note: "orders already present" };
  }

  let inserted = 0;
  for (const row of toInsert) {
    const one = await postUserOrdersOne(base, accessToken, userId, row);
    if (one.ok) {
      inserted += 1;
      continue;
    }
    if (isDuplicateError(one.status, one.data)) {
      continue;
    }
    throw new Error(`POST user_orders failed: ${one.status} ${JSON.stringify(one.data)}`);
  }

  return {
    email: persona.email,
    name: persona.name,
    note: inserted ? `inserted ${inserted} order(s)` : "no new rows (duplicates skipped)",
  };
}

async function main() {
  const base = baseUrl();
  const password = seedPassword();
  if (!base) {
    console.error("Missing INSFORGE_BASE_URL.");
    process.exit(1);
  }
  if (!password || password.length < 8) {
    console.error("Missing or weak SEED_USER_PASSWORD (use at least 8 characters).");
    process.exit(1);
  }

  const results = [];
  for (const persona of SEED_PERSONAS) {
    try {
      const r = await seedPersona(base, password, persona);
      results.push(r);
    } catch (e) {
      console.error(`Failed for ${persona.email}:`, e.message || e);
      process.exit(1);
    }
  }

  console.log("\n--- Test accounts (copy for your records; do not commit) ---\n");
  console.log("| Display name      | Email                         | Password (env SEED_USER_PASSWORD) |");
  console.log("|-------------------|-------------------------------|-----------------------------------|");
  for (const p of SEED_PERSONAS) {
    const pad = (s, n) => (s + " ".repeat(n)).slice(0, n);
    console.log(`| ${pad(p.name, 17)} | ${pad(p.email, 29)} | (same for all rows)             |`);
  }
  console.log("\nShared password value you used: (from environment, not printed here)\n");
  console.log("Run log:");
  for (const r of results) {
    console.log(`  ${r.email}: ${r.note}`);
  }
  console.log("");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
