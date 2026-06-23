# PrismSection — Technical Specification

## Overview

PrismSection wraps a Canon `Section` behind a one-time registration form. Visitors fill out the form once; the server sets a JWT-signed `HttpOnly` cookie so the gate never shows again. The section data is **not protected at the API level** — it loads normally and is present in `__INITIAL_STATE__`. The gate exists solely to collect visitor information; the signed cookie prevents trivial client-side bypass (e.g. manually setting a cookie in DevTools).

This system does not touch Canon's existing auth (`req.session`, `req.user`, Passport).

---

## Constraints

1. A registered visitor must not be prompted again on return visits.
2. The cookie must be server-verified so it cannot be faked in DevTools.

---

## Flow

```
Open page
    │
    ▼
GET /api/prism/status
    │
    ├─ 401 ─▶ render GateForm (section hidden)
    │              │
    │         visitor submits
    │              │
    │         POST /api/prism/register
    │              │
    │         set HttpOnly JWT cookie
    │              │
    └─ 200 ◀───────┘
    │
    ▼
Render section (data already in __INITIAL_STATE__)
```

---

## New Dependencies

Add `jsonwebtoken` and `cookie-parser` as direct dependencies (already present as transitive deps of canon-core).

---

## Database

New `prism_registrations` table — no relation to `users`. Fields: `id`, `email` (unique), `name`, `occupation`, `org`, `created_at`. Register the model in `canon.js`.

---

## Environment Variables

- `PRISM_JWT_SECRET` — 64-char random string. Rotating it invalidates all existing tokens.
- `PRISM_COOKIE_DAYS` — cookie TTL in days. No default; must be set before deploy.

---

## API Routes (`api/prismRoute.js`)

- `GET /api/prism/status` — returns `200` if the `HttpOnly` JWT cookie is valid, `401` otherwise. No body either way.
- `POST /api/prism/register` — validates fields, upserts into `prism_registrations`, signs a JWT, sets it as an `HttpOnly` cookie.

---

## PrismSection Component (`app/components/PrismSection.jsx`)

Props: `slug`, `profileId`, `sectionId` (required); `title`, `subtitle` (optional, with defaults).

On mount: call `GET /api/prism/status`. If `401`, render `<GateForm />`; if `200`, render the section from data already in the store. After successful form submission, re-check status and switch to the section view — no additional data fetch needed.

During SSR the component always renders the gate (no cookie access server-side). The client replaces it after hydration.

---

## No Changes to Profile Data Flow

Section data is **not stripped** from `__INITIAL_STATE__` and single-section fetches do not go through any auth middleware. `api/profileRoute.js` requires no changes.

---

## File Checklist

```
models/prism.js          ← Sequelize model
api/prismRoute.js        ← status + register routes
app/components/
  PrismSection.jsx       ← registration-gated section component
  GateForm.jsx           ← registration form
canon.js                 ← register model + route (2-line change)
.env                     ← PRISM_JWT_SECRET, PRISM_COOKIE_DAYS
```

See [prism-section-reference.md](./prism-section-reference.md) for implementation samples.
