# Presentation Deck Outline (15 Slides)

**Project:** Shiprocket-Style Logistics Platform Demo (`shiprocket-style-demo`)

For each slide: **Visual content** (on-slide bullets) and **Speaker notes** (what to say).

---

## Slide 1: Title and project name

**Visual content**

- Title: Shiprocket-Style Logistics Platform Demo
- Subtitle: Static UX prototype with optional InsForge-backed demo data
- Your name, institution, date

**Speaker notes**

Introduce the repository name `shiprocket-style-demo`. Clarify this is a Shiprocket-inspired logistics UI demonstration, not the commercial Shiprocket product. State the dual mode: static mock by default, optional database-backed demo rows when InsForge is configured.

---

## Slide 2: Agenda

**Visual content**

- Problem and motivation
- Solution overview
- Technology stack and architecture
- Core implementation: tracking, client, database
- Local setup and demo
- Challenges, future scope, Q&A

**Speaker notes**

Give a roadmap: problem first, then architecture diagram, then three implementation clusters (tabs and validation, InsForge client, schema), then commands from `docs/INSFORGE_LOCAL.md`, then honest limitations and extensions, end with questions.

---

## Slide 3: Problem statement

**Visual content**

- Logistics UIs need believable flows and copy
- Full custom backend increases scope for a college project
- Static-only mocks can feel obviously fake
- Browsers block many `fetch` calls from `file://`; HTTP server required

**Speaker notes**

Anchor on the tension between **UI fidelity** and **backend realism**. Mention that the documentation explicitly recommends serving over HTTP, not opening HTML from the filesystem, so evaluators understand you followed web platform constraints.

---

## Slide 4: Proposed solution and objectives

**Visual content**

- Vanilla static frontend: homepage (`index.html`) and shipping page (`shipping.html`)
- Optional InsForge: REST plus PostgreSQL `demo_shipments`
- Graceful fallback: built-in steps plus user-visible fallback notes
- Objectives: multi-tab tracking, input validation, accessible modal, seeded demo references

**Speaker notes**

Emphasize **optional** InsForge: the same page works without it. Objectives map directly to `shipping.js` (tabs, `tryInsForgeThenMock`, `setFallbackNote`) and migrations (seed data).

---

## Slide 5: Technology stack (categorized)

**Visual content**

- **Frontend:** HTML, CSS, JS (`index.html`, `shipping.html`, `script.js`, `shipping.js`)
- **Data access:** `insforge-client.js` (fetch, Bearer token, response normalization)
- **Database:** PostgreSQL via SQL files in `migrations/`
- **Tools:** `npm run serve`, `npm run insforge:anon-token`, InsForge CLI (`npx @insforge/cli`)
- **Note:** `package.json` defines scripts only, no listed npm `dependencies`

**Speaker notes**

State clearly there is **no React or Vue** in `package.json` dependencies: intentional simplicity. Database is applied through InsForge CLI against the SQL migrations in the repo.

---

## Slide 6: System architecture (part 1)

**Visual content**

- Diagram: Browser box containing `shipping.html`, `insforge-config.js`, `insforge-client.js`, `shipping.js`
- Optional box: InsForge REST to PostgreSQL
- Legend: optional path only when `insforgeIsEnabled()` is true

**Speaker notes**

Walk the arrow from config plus client into `shipping.js` decision logic. Use the same Mermaid diagram as in `docs/ACADEMIC_PROJECT_REPORT.md` if the deck tool supports it, or redraw as boxes.

---

## Slide 7: System architecture (part 2, data flow)

**Visual content**

- Happy path: validate input → query by `reference` and `tab_key` → render `steps` from JSONB
- Alternate path: no row, offline, or error → `MOCK_STEPS` + `setFallbackNote` modes
- Special case: AWB tab + `ORD-` prefix → retry with `order` tab key

**Speaker notes**

Stress **transparency**: when data is generic mock, the UI tells the user via fallback note text. Mention `pickDemoShipmentRow` for exact matching.

---

## Slide 8: Core feature: multi-tab tracking

**Visual content**

- Tabs: AWB, Order ID, Mobile (`TAB_CONFIG`, `TAB_PRESENTATION`)
- Mobile: strip non-digits, require length 10
- Reject pasted URLs: `isLikelyPastedUrl`
- Query prefill: `prefill` and `type` URL parameters
- File: `shipping.js`

**Speaker notes**

Give one live example per tab from `docs/INSFORGE_LOCAL.md` if you demo with InsForge enabled.

---

## Slide 9: Core feature: InsForge integration

**Visual content**

- `GET` with `Authorization: Bearer <anon token>`
- Filters: PostgREST-style, e.g. `reference=eq...`, `tab_key=eq...`
- `normalizeRows`: array, `value`, or `data`
- Config: `window.__INSFORGE_CONFIG` in `insforge-config.js`
- File: `insforge-client.js`

**Speaker notes**

Explain why normalization exists: tolerate small API envelope differences without breaking the demo. Token obtained via `scripts/print-insforge-anon-token.cjs` reading `.insforge/project.json`.

---

## Slide 10: Core feature: timeline UX and animation

**Visual content**

- Native `<dialog>` modal for results
- CSS states: pending, done, current (`applyStepProgress`)
- Stagger: `STEP_MS = 580`, timeouts cleared on close
- `createStepLi` builds DOM structure for each step

**Speaker notes**

Connect to migration comment: after the intro animation, the **last** step in the array is treated as the highlighted current stage, which motivated SQL updates to align `steps` with `status_text`.

---

## Slide 11: Database schema and data models

**Visual content**

- Table: `demo_shipments`
- Key columns: `reference`, `tab_key` (check constraint), `courier`, `id_label`, `status_text`, `steps` (jsonb array of objects with title, time, detail)
- RLS enabled; policies for `anon` and `authenticated` as in migration
- Index on `(reference, tab_key)`
- Files: `migrations/20260513162102_shiprocket-demo.sql` and related migrations

**Speaker notes**

Clarify this is a **demo denormalized** model: full timeline embedded in JSONB, not a normalized scan history table. Appropriate for seed data, not a claim of production schema.

---

## Slide 12: Setup and environment

**Visual content**

- Mock path: `npm run serve` or `npx --yes serve .`
- InsForge path: `link` → `db migrations up --all -y` → `npm run insforge:anon-token` → edit config
- Demo IDs: table from `docs/INSFORGE_LOCAL.md`

**Speaker notes**

Run through commands once slowly. Mention optional local config file pattern to avoid committing secrets.

---

## Slide 13: Challenges faced and overcome

**Visual content**

- HTTP vs `file://` for `fetch` (documented in `INSFORGE_LOCAL.md`)
- User trust: explicit fallback notes for `no_match`, `offline`, `error`
- AWB vs Order ID ambiguity: automatic order-tab refetch for `ORD-` pattern
- Header and timeline alignment: SQL `UPDATE` migration

**Speaker notes**

Frame challenges as **engineering communication** and **edge cases**, not only bugs. Show you read the SQL comment about last step semantics.

---

## Slide 14: Future scope and enhancements

**Visual content**

- Real carrier APIs and webhook ingestion (not in current repo)
- Replace demo `sessionStorage` auth with real IdP or InsForge user JWTs; server-side session cookies
- Normalized event or scan tables instead of single JSONB blob
- Automated tests and CI for migrations and client
- Secrets only in gitignored local config or build-time injection

**Speaker notes**

Keep future work **credible**: do not claim features that are not implemented. Position the project as a strong UI plus optional BaaS demo, not a production logistics engine.

---

## Slide 15: Q&A and conclusion

**Visual content**

- Summary: static UX plus optional InsForge and PostgreSQL demo data
- Key files: `shipping.js`, `insforge-client.js`, `migrations/*.sql`
- Thank you / Questions

**Speaker notes**

One-sentence recap. Invite technical questions on RLS, fallback logic, or migration design. Refer to `docs/VIVA_PREPARATION.md` for sample hard questions.
