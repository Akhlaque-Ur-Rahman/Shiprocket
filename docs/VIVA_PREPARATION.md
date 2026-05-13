# Viva Preparation

**Project:** Shiprocket-Style Logistics Platform Demo (`shiprocket-style-demo`)

Five challenging technical questions an external evaluator might ask, with concise answers grounded in this repository only.

---

## Question 1

**Q:** You enabled Row Level Security on `demo_shipments`, but the migration defines `FOR SELECT TO anon USING (true)` (and similar insert policies). What is the security implication, and how do you justify that for a demo?

**A:** `USING (true)` means any client holding the `anon` role can read (and, where granted, insert) **all** rows in that table: there is no per-user or per-tenant isolation. For a **public demo dataset**, that reduces friction and matches the goal of sharable sample AWB or order references. In production you would replace this with predicates tied to identity (for example `auth.uid()`), tighter grants, separate schemas, or non-public demo environments. RLS remains useful as a **structural hook** for later hardening.

---

## Question 2

**Q:** Why does `insforge-client.js` normalize the HTTP JSON body into an array using `body.value`, `body.data`, or a raw array?

**A:** The InsForge REST layer may wrap row lists in different envelope shapes across versions or endpoints. Normalizing in one place avoids brittle assumptions in `shipping.js` and returns a predictable empty array when the shape is unknown, while still throwing on non-OK HTTP so real failures are visible.

---

## Question 3

**Q:** In `applyStepProgress` inside `shipping.js`, why is the last index branch different when assigning `tracking-mock-step--current` versus `tracking-mock-step--done`?

**A:** The loop marks completed stages as `done` and pending as `pending`. For the active index, if it is the **last** step in the list, the code adds `current` instead of `done` so the final milestone reads as the **in-progress or current** stage in the UI. This matches the migration comment: after the stagger animation, the UI treats the **last** element of the `steps` array as the highlighted current stage, which is why a later SQL migration aligns `steps` with `status_text`.

---

## Question 4

**Q:** If the user enters a mobile number with country code or spaces, for example `+91 98765 43210`, what happens?

**A:** On the mobile tab, `shipping.js` strips non-digit characters and requires **exactly ten** digits. If the count is not ten, validation shows an error and the InsForge path is not called. If ten digits remain after stripping, that string is used as `reference` for the query. Seed mobile references in the migrations and documentation are stored as ten-digit strings, so normalization is the **intended contract** between UI and database.

---

## Question 5

**Q:** If InsForge is enabled but the server returns HTTP 500, what does the user see?

**A:** `tryInsForgeThenMock` wraps the fetch path in `try/catch`. On failure it logs a console warning, calls `showMock(reference, undefined, "error")`, renders the built-in `MOCK_STEPS`, and sets `setFallbackNote("error")` so the user is told the timeline is a built-in sample and to check network or InsForge settings. That is **graceful degradation**, not a silent fallback.

---

## Quick file map (for viva)

| Topic | Path |
|--------|------|
| Tracking and modal logic | `shipping.js` |
| HTTP client and row normalization | `insforge-client.js` |
| Browser-side InsForge flags and URL | `insforge-config.js` |
| Schema, RLS, seed data | `migrations/*.sql` |
| Local InsForge steps | `docs/INSFORGE_LOCAL.md` |
| Full written report | `docs/ACADEMIC_PROJECT_REPORT.md` |
| Slide outline | `docs/PRESENTATION_DECK_OUTLINE.md` |
