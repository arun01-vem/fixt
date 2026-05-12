# FIXT - Technical Handover Document

Version: v1.0  
Date: May 2026  
Audience: Developers / Technical Maintainers

## 1) System Overview

FIXT is a full-stack web MVP for doorstep mobile repair operations.

Core flows:

1. Customer booking (frontend wizard)
2. Order creation + persistence (backend API + DB)
3. Success/track via `order_number`
4. Admin authentication and status updates

## 2) Stack and Runtime

## Frontend

- Next.js 16.2.4 (App Router)
- React 19.2.4
- TypeScript
- Tailwind CSS v4
- Leaflet + react-leaflet (location pin map)

## Backend

- FastAPI
- SQLAlchemy
- Alembic
- Uvicorn
- psycopg2-binary

## Testing

- pytest
- httpx
- FastAPI TestClient

## 3) Repository Structure

```text
fixt/
  backend/
    main.py
    models.py
    schemas.py
    database.py
    alembic/
    tests/test_api_phase6.py
    requirements.txt
    pytest.ini

  frontend/
    app/
      layout.tsx
      page.tsx
      booking/page.tsx
      booking/success/page.tsx
      track/page.tsx
      admin/page.tsx
      admin/orders/page.tsx
      icon.png
    components/SiteLogo.tsx
    lib/api.ts
    public/logo.png
```

## 4) Backend Design

## Data model

`Customer`:

- `id` (uuid string PK)
- `name`
- `phone` (unique)
- `is_verified`
- `created_at`

`Order`:

- `id` (uuid string PK)
- `order_number` (nullable unique for legacy compatibility)
- `customer_id` (FK)
- `device`, `brand`, `model`
- `issue`, `issue_details`
- `estimated_price`, `price_min`, `price_max`
- `district`, `village`, `address_line`, `pincode`
- `nearby_location`, `landmark`
- `latitude`, `longitude`
- `alternate_phone`
- `status`
- `slot`
- `created_at`, `updated_at`

## Status values

- `pending_verification`
- `confirmed`
- `in_progress`
- `completed`
- `cancelled`

## API routes

Public:

- `GET /health`
- `POST /customers/`
- `POST /orders/`
- `GET /orders/{order_number}`

Admin (protected):

- `POST /admin/login`
- `GET /admin/orders`
- `PATCH /orders/{order_id}/status`

## Admin auth implementation

- Custom token (HMAC SHA256 signed payload)
- Claims include role + expiry
- Validated from `Authorization: Bearer <token>`
- Config via environment:
  - `ADMIN_USERNAME`
  - `ADMIN_PASSWORD`
  - `ADMIN_TOKEN_SECRET`
  - `ADMIN_TOKEN_TTL_SECONDS`

## 5) Frontend Design

## Main pages

- `/` - landing and conversion
- `/booking` - multi-step wizard
- `/booking/success` - confirmation + optional live fetch
- `/track` - order status lookup
- `/admin/orders` - login, list, filter, update status

## API layer

`frontend/lib/api.ts` exposes typed wrappers for:

- booking customer/order calls
- order fetch
- health check
- admin login
- admin order list
- admin status update

## Branding layer

- Shared component: `components/SiteLogo.tsx`
- Circular logo rendering is centralized here
- Metadata in `app/layout.tsx` points icon/open-graph/twitter to `/logo.png`

## 6) Local Development

## Backend

```powershell
cd backend
.\venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

## Frontend

```powershell
cd frontend
npm.cmd run dev
```

## URLs

- Frontend: `http://localhost:3000`
- Backend docs: `http://localhost:8000/docs`
- Admin UI: `http://localhost:3000/admin/orders`

## 7) Testing and Quality Commands

## Backend tests

```powershell
cd backend
.\venv\Scripts\python.exe -m pytest
```

## Frontend checks

```powershell
cd frontend
npm.cmd run lint
npm.cmd run build
```

## 8) Key Issues Encountered and Fixes

- Alembic sequencing and migration alignment issues resolved.
- Schema/model mismatch fixed for order fields.
- Legacy rows with null `order_number` caused admin serialization errors; schema adjusted.
- React/TypeScript lint/type issues fixed in success/track/admin integration.
- Windows clipboard/encoding problems bypassed with safer file workflows.
- Local Neon DNS resolution instability: fallback local SQLite runtime used for local-only sessions.

## 9) Environment Variables

## Backend required

- `DATABASE_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_TOKEN_SECRET`
- `ADMIN_TOKEN_TTL_SECONDS` (optional)

## Frontend required

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SITE_URL`

## 10) Deployment Notes (Phase 7)

Target:

- Frontend: Vercel
- Backend: Render
- DB: Neon

Required steps:

1. Set production env vars.
2. Ensure Alembic migrations are run during deploy/start.
3. Configure domain + optional API subdomain.
4. Add CI checks (pytest + frontend lint/build).
5. Perform full live smoke test.

## 11) Operational Recommendations

- Rotate default admin credentials immediately for production.
- Use strong random `ADMIN_TOKEN_SECRET`.
- Keep staging DB separate from production.
- Keep manual pilot metrics tracking for product-market validation.

## 12) Handover Summary

The platform is implemented and stable for MVP pilot operations.  
Remaining work is primarily deployment, CI/CD hardening, and launch operations rather than major feature development.
