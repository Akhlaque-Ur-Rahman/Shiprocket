# Viva Preparation

**Project:** Shiprocket-Style Logistics Platform (Static UI Prototype)

Five challenging technical questions an external evaluator may ask, with concise answers grounded in this repository.

---

## Question 1

**Why is there no `package.json`, and is that a weakness?**

**Answer**

The repository is built as a **dependency-free static front-end**: pages link directly to `style.css` and plain `.js` files without a Node or Python application manifest. That reduces toolchain overhead for academic submission and review. The trade-off is the absence of an evidenced bundler, tree-shaking, or static type checking in the repo; those could be added later without changing the core HTML structure.

---

## Question 2

**How does the order-status animation remain synchronised across steps and connectors?**

**Answer**

In `style.css`, the flow steps, connectors, travelling dots (`::before`), and badges use **keyframes that share a 10 second duration** and `infinite` iteration. The design avoids relying on many independent `animation-delay` values that could drift relative to one another. Documentation in `SHIPPING_PAGE_SECTIONS.md` records this as a deliberate synchronisation strategy.

---

## Question 3

**What happens if the user closes the tracking modal while the step animation is still running?**

**Answer**

`shipping.js` maintains an array of timeout identifiers (`staggerTimers`). `clearStaggerTimers` runs when the modal is closed, when closing handlers fire, and on the dialog `close` event, so pending `setTimeout` callbacks are cancelled. That prevents step classes from updating after the dialog is no longer visible.

---

## Question 4

**Does this project integrate with real Shiprocket or courier APIs?**

**Answer**

**No.** Tracking results are **mock data** assembled from `MOCK_STEPS` and `TAB_PRESENTATION` in `shipping.js`. Marketing copy on some HTML pages may mention APIs in a product sense, but the reviewed scripts do not perform `fetch` or similar calls to external logistics endpoints.

---

## Question 5

**How would you extend this prototype toward a production-grade system?**

**Answer**

Introduce a backend with authentication and rate-limited APIs, persist users and shipments in a database, replace the mock timeline with **server-sourced** status events, secure secrets via environment configuration, add a build and test pipeline, and deploy the static front-end to a CDN or static host in front of the API. The current HTML and CSS could remain as a shell while data binding moves from hard-coded objects to API responses.

---

*End of viva preparation document.*
