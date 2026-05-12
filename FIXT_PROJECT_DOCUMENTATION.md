# FIXT - Project Development Documentation

Version: v1.1  
Last Updated: May 2026  
Project Type: MVP Web Application  
Deployment Goal: Zero recurring cost pilot (domain cost only)  
Primary Pilot Location: Jagtial District, Telangana, India

---

## 1) Project Overview

FIXT is a hyper-local doorstep mobile repair booking platform.  
The MVP validates demand before investment by keeping infra and integrations minimal while still delivering a complete booking-to-tracking-to-admin workflow.

### Core business model

- Customer books repair on website.
- FIXT team manually verifies by phone.
- Technician is assigned and status is updated in admin panel.
- Customer tracks order status using order number.
- Customer pays after service.

### Cost-first product decisions

- No SMS OTP integration in MVP.
- No paid Maps APIs (Google Maps skipped).
- OpenStreetMap/Leaflet used for location pinning (free).
- Infra on free tiers (Vercel + Render + Neon).
- Manual verification flow for early users.

---

## 2) Current Project Status

### Phase completion status

- Phase 1 (Environment + Scaffolding): **Complete**
- Phase 2 (Backend + DB + API): **Complete**
- Phase 3 (Frontend booking UX): **Complete**
- Phase 4 (Integration + error handling): **Complete**
- Phase 5 (Admin auth + order operations): **Complete**
- Phase 6 (Testing + staging checklist): **Complete (code/testing side)**
- Phase 7 (Production launch + CI/CD + domain routing): **Pending**

### Current MVP readiness

- Local app is end-to-end functional.
- Backend and frontend builds pass.
- Backend test suite exists and passes.
- Admin workflow is functional with protected endpoints.
- Branding/logo integration is completed across UI and metadata.

---

## 3) Technology Stack

## Frontend

- Next.js `16.2.4`
- React `19.2.4`
- TypeScript
- Tailwind CSS v4
- Leaflet + React Leaflet (free map pinning)
- ESLint

## Backend

- FastAPI
- Uvicorn
- SQLAlchemy ORM
- Alembic migrations
- Psycopg2 (PostgreSQL driver)
- Python dotenv
- Simple custom HMAC-based admin token auth (no external auth provider)

## Testing

- Pytest
- FastAPI TestClient
- HTTPX

## Database

- PostgreSQL (Neon in cloud)
- SQLite used locally as fallback when DNS/network issues block Neon access

---

## 4) Repository Structure (Key Areas)

```text
fixt/
  backend/
    main.py
    models.py
    schemas.py
    database.py
    alembic/
    tests/
      test_api_phase6.py
    requirements.txt
    pytest.ini

  frontend/
    app/
      page.tsx
      booking/page.tsx
      booking/success/page.tsx
      track/page.tsx
      admin/orders/page.tsx
      layout.tsx
      icon.png
    components/
      SiteLogo.tsx
    lib/
      api.ts
    public/
      logo.png

  PHASE6_STAGING_CHECKLIST.md
  FIXT_PROJECT_DOCUMENTATION.md
```

---

## 5) Implemented Features

## Customer flow

- Landing page with service messaging and CTA.
- Multi-step booking flow:
  - device
  - issue
  - estimate
  - map + address details
  - area + slot
  - contact + final confirmation
- Success page with order summary and order ID.
- Track page to check order status using order number.

## Backend order flow

- Create customer endpoint.
- Create order endpoint with generated human-friendly order number:
  - `FIXT-YYYYMMDD-NNNN`
- Fetch order by order number.
- Health endpoint.

## Data captured in orders

- Device, brand, model, issue, issue details
- Estimated price min/max
- District, village, full address, pincode
- Nearby location, landmark
- Latitude/longitude
- Alternate phone
- Slot
- Status

## Admin flow (Phase 5)

- Admin login endpoint (`/admin/login`)
- Token-protected admin orders endpoint (`/admin/orders`)
- Token-protected status update endpoint (`/orders/{id}/status`)
- Admin UI:
  - login
  - list/filter orders
  - update order status from dropdown

## Branding

- New circular logo integrated in:
  - top navigation
  - hero
  - booking
  - success
  - track
  - admin
  - footer
- Site icon and metadata images point to logo.

---

## 6) API Summary

### Public endpoints

- `GET /health` - service health
- `POST /customers/` - create/get customer by phone
- `POST /orders/` - create order
- `GET /orders/{order_number}` - fetch order for success/track page

### Admin endpoints (protected)

- `POST /admin/login` - returns access token
- `GET /admin/orders?status=...` - list/filter orders
- `PATCH /orders/{order_id}/status` - update status

### Supported order statuses

- `pending_verification`
- `confirmed`
- `in_progress`
- `completed`
- `cancelled`

---

## 7) Testing and Validation Completed

## Backend tests

File: `backend/tests/test_api_phase6.py`

Covered scenarios:

- health endpoint returns expected payload
- customer creation and duplicate phone behavior
- order creation + fetch by order number
- admin login and protected orders list
- valid status updates
- invalid status rejection

Latest outcome:

- `6 passed` (pytest suite passing)

## Frontend validation

- `npm run lint` passing
- `npm run build` passing

---

## 8) Issues Faced and Resolutions

## Historical issues encountered during development

- Alembic command sequencing problems before core files existed.
- DNS resolution failures to Neon host (ISP DNS issue).
- `.env` formatting corruption for connection string.
- VS Code env injection inconsistency.
- Windows CRLF/encoding and copy-paste JSX corruption.
- PowerShell multi-line execution issues.
- Schema-model field mismatch and typing mismatches.
- Duplicate `get_db()` definition conflict in backend.
- User-facing UUID issue resolved by order number system.

## Issues solved in current implementation cycle

- Admin endpoint serialization failure on legacy rows with null order number; schema adjusted to nullable order number.
- TypeScript auth header typing issue fixed with `Headers` object usage.
- React lint violations from state updates inside effects removed/refactored.
- Logo replacement and circular rendering standardized via shared `SiteLogo` component.

## Current known operational risk

- Neon DNS resolution may fail in some local networks.  
  Temporary local fallback via SQLite is available for local testing.

---

## 9) Environment Variables

## Backend

- `DATABASE_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_TOKEN_SECRET`
- `ADMIN_TOKEN_TTL_SECONDS` (optional, default 86400)

## Frontend

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SITE_URL` (recommended for metadata URL generation)

---

## 10) What To Do Next (Phase 7 Plan)

Phase 7 is production launch and operationalization.

## 10.1 Deployment

- Deploy backend to Render free tier.
- Deploy frontend to Vercel free tier.
- Configure production env vars in both platforms.
- Ensure Alembic migrations run during backend deployment lifecycle.

## 10.2 Domain + routing

- Attach purchased domain to Vercel frontend.
- Configure backend subdomain (example: `api.yourdomain.com`).
- Set DNS records at registrar.

## 10.3 CI/CD pipeline

Create GitHub Actions workflow:

- On PR/push:
  - backend: pytest
  - frontend: lint + build
- Block merge/deploy on failing checks.

## 10.4 Production smoke test

- Create live booking.
- Validate success page shows order number.
- Validate track page fetches live status.
- Login admin and update status.
- Confirm track page reflects status update.

## 10.5 Launch metrics (manual tracking recommended)

- Visits/day
- Bookings/day
- Reachable calls %
- Confirmed bookings %
- Completed jobs %
- Avg ticket size
- Cancellation reasons

---

## 11) MVP Constraints and Non-Goals (Current)

- No paid SMS or OTP system.
- No paid maps/geocoding APIs.
- No external paid auth provider.
- No paid uptime/observability tooling yet.

These are intentional decisions until market validation is proven.

---

## 12) Recommended Immediate Actions

1. Set production-grade admin credentials and token secret.
2. Create and test staging deployment using `PHASE6_STAGING_CHECKLIST.md`.
3. Add CI workflow for backend tests + frontend lint/build.
4. Complete one full pre-launch runbook test on real domain.
5. Launch in Jagtial and monitor first 50 bookings manually.

---

## 13) Project Summary

The FIXT MVP is now a functional, test-backed, zero-cost-oriented platform with:

- a complete booking and tracking user experience,
- an admin operations panel with auth and status management,
- test coverage for core backend business paths,
- and a clear runway to production launch (Phase 7).

The next milestone is not feature development; it is deployment quality, domain setup, and launch operations.
