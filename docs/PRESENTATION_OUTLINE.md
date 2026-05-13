# Presentation Deck Outline (15 Slides)

**Project:** Shiprocket-Style Logistics Platform (Static UI Prototype)

Each slide lists **Visual content** (bullets for the slide) and **Speaker notes** (script for delivery).

---

## Slide 1: Title Slide and Project Name

**Visual content**

- Project title: Shiprocket-Style Logistics Platform (Static UI Prototype)
- Subtitle: Static front-end demonstration for logistics and eCommerce UX
- Your name, institution, course, date

**Speaker notes**

Introduce the submission as a Shiprocket-inspired logistics **user interface** prototype for academic evaluation. State clearly that the work focuses on presentation-layer design and client-side behaviour, not on operating a live courier or order-management backend.

---

## Slide 2: Agenda

**Visual content**

- Problem statement
- Proposed solution and objectives
- Technology stack
- System architecture and data flow
- Core features and implementation
- Client-side data structures (no database)
- Setup and environment
- Challenges and mitigations
- Future scope
- Q&A and conclusion

**Speaker notes**

Explain that you will move from motivation to concrete implementation evidence in the codebase, then acknowledge limitations and credible extensions. This sets expectations for evaluators who might assume a full stack.

---

## Slide 3: Problem Statement

**Visual content**

- Logistics platforms combine marketing, tracking, and integrations in one narrative
- Full enterprise stacks are out of scope for many academic projects
- Need: a tangible artifact that still teaches UX, responsiveness, and front-end patterns

**Speaker notes**

Position the problem as **communicating** complex logistics value without building servers, databases, or paid API integrations. The gap you fill is a disciplined static prototype with documentation.

---

## Slide 4: Proposed Solution and Objectives

**Visual content**

- Solution: multi-page static site (HTML, CSS, vanilla JavaScript)
- Token-based design system (`style.css`, `RULEBOOK.md`)
- Mock tracking with modal timeline (`shipping.js`)
- Phased delivery tracked in `TASKS.md`

**Speaker notes**

State objectives: credible visual design, responsive navigation, documented shipping sections, demo auth and tracking flows. Emphasise feasibility and clarity of learning outcomes over feature parity with production Shiprocket.

---

## Slide 5: Tech Stack (Categorised)

**Visual content**

- **Frontend:** HTML5, CSS3, vanilla JS, Google Fonts (Manrope, Sora), WebP and SVG assets
- **Backend:** not in repository
- **Database:** not in repository
- **Deployment:** any static file host or local HTTP server; no `package.json` evidenced

**Speaker notes**

Stress **evidence-based** reporting: dependencies are not declared in a manifest file; the stack is what the HTML links and scripts actually load. This is intentional minimalism for the submission, with a known trade-off (no bundled build pipeline in repo).

---

## Slide 6: System Architecture (Overview)

**Visual content**

- Diagram: Browser loads HTML, `style.css`, and page scripts
- Shared `script.js`; page-specific `shipping.js`, `auth-demo.js`
- Static assets under `assets/`

**Speaker notes**

Describe a **single-tier, client-only** architecture. Scripts query the DOM by stable IDs and classes; one stylesheet enforces visual consistency across pages.

---

## Slide 7: System Architecture (Data Flow)

**Visual content**

- User input → client validation → outcomes:
  - Mock result in `<dialog>` with staggered step highlights (`shipping.js`)
  - Or redirect to `shipping.html?prefill=…&type=…` (`auth-demo.js`)
- Order-status section: CSS keyframes on a **10 s** master loop, independent of tracking modal timers

**Speaker notes**

Draw a sharp distinction: the **order status** animation is CSS-synchronised; the **tracking modal** timeline uses JavaScript `setTimeout` staggering. Evaluators often conflate the two; separating them shows depth of understanding.

---

## Slide 8: Core Feature (Navigation and Hero)

**Visual content**

- Mobile drawer: backdrop, body scroll lock, `aria-expanded`
- Hero image slider: four slides, 5 s auto-advance, prev or next and dots
- File: `script.js`

**Speaker notes**

Mention accessibility-minded patterns where implemented, and that the hero content is data-driven via the `heroSlides` array for maintainability.

---

## Slide 9: Core Feature (Shipping Tracking Demo)

**Visual content**

- Tabs: AWB, Order ID, Mobile (placeholders and `inputmode` from `TAB_CONFIG`)
- Validation: empty field; 10-digit rule for mobile
- Native `<dialog>` with mock courier and `MOCK_STEPS` timeline
- Stagger: 580 ms between step state updates

**Speaker notes**

Clarify that all tracking outcomes are **demonstration data**, not live API responses. This is a teaching and portfolio pattern, not production integration.

---

## Slide 10: Core Feature (Auth Demo and Deep Link)

**Visual content**

- Login: business form phone validation; demo modal after valid submit
- Login page track widget: radios switch placeholder; valid input redirects with query params
- Signup: name, email regex, phone; demo modal
- File: `auth-demo.js`, `data-auth-page` on `<body>`

**Speaker notes**

Stress **no** session cookies, JWT, or server session in this repository. Deep linking to shipping prefill is a small UX touch that shows URL design awareness.

---

## Slide 11: Database Schema and Data Models

**Visual content**

- **No relational or document database** in the project
- **Client-side structures:** `heroSlides`, `TAB_CONFIG`, `TAB_PRESENTATION`, `MOCK_STEPS`
- No ERD; extension would add users, shipments, and events behind an API

**Speaker notes**

Answer the database question honestly: out of scope. If the rubric expects schema design, describe how you would add normalized tables for users and shipment events in a future backend without claiming they exist today.

---

## Slide 12: Setup and Environment

**Visual content**

- No install command for project dependencies
- Run: `python -m http.server 8080` then open `http://localhost:8080/index.html`
- Alternative: `npx --yes serve .`
- No `.env` file required

**Speaker notes**

Explain why a local HTTP server is preferable to `file://` for consistent asset and script behaviour. Keep commands copy-pasteable for the demo machine.

---

## Slide 13: Challenges Faced and Overcome

**Visual content**

- Animation sync across many elements: unified **10 s** keyframes in `style.css`
- Modal timer leaks: `clearStaggerTimers` on close in `shipping.js`
- Mobile navigation state: backdrop, overflow, dropdown reset on link click in `script.js`
- FAQ: single-open accordion to reduce visual noise

**Speaker notes**

Tie each bullet to a **file and mechanism** so the panel sees traceability from problem to implementation.

---

## Slide 14: Future Scope and Enhancements

**Visual content**

- Real tracking API and authenticated backend
- Build tooling (for example Vite) and lint or test pipeline
- Component framework if the UI grows further
- CMS or data files for long-form marketing copy
- Automated accessibility and visual regression tests

**Speaker notes**

Frame future work as **natural evolution** of the same information architecture, not a critique of the current scope. None of the listed items are claimed as delivered in the repository.

---

## Slide 15: Q&A and Conclusion

**Visual content**

- Summary: static, tokenised, multi-page logistics UI prototype with mock flows and strong documentation
- Thank you; questions welcome

**Speaker notes**

Close by restating the **contribution**: a reproducible front-end artifact plus section-level documentation suitable for academic evaluation. Invite technical questions on CSS synchronisation, validation logic, and extension paths.

---

*End of presentation outline.*
