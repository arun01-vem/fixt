# FIXT Current Status Documentation

Version: v1.0  
Prepared on: May 11, 2026  
Workspace: `C:\Users\LENOVO\Desktop\fixt`  
Project stage: MVP complete locally, preparing for production launch

---

## 1. Short Summary

FIXT is a hyper-local doorstep mobile repair booking MVP for Jagtial district, Telangana. The product lets a customer book a phone repair, choose a service location on a free OpenStreetMap map, receive a human-readable order number, track the order, and lets an admin manage orders from a protected admin panel.

The project has completed the main product-building phases:

- Backend API and database models are implemented.
- Frontend customer booking, success, tracking, and admin screens are implemented.
- Admin login, protected order management, status changes, status timeline, and delete flow exist.
- Frontend lint and production build pass as of May 11, 2026.
- Existing backend test file exists, but pytest could not be re-run today because the local backend virtualenv Python launcher points to a blocked WindowsApps Python path.

Current phase: **Phase 7 - production launch preparation**.

Important Phase 7 note: before deploying, add or verify an Alembic migration for the `order_status_events` table, because the model exists in runtime code but the checked migration files currently do not include that table.

---

## 2. Product Goal

The main goal of FIXT is to validate demand for doorstep phone repair before spending heavily on automation, paid APIs, or complex infrastructure.

The MVP is intentionally simple:

- Customer books repair through the website.
- Customer gives phone, device, issue, address, map pin, area, and slot.
- Backend creates a customer and order.
- Customer receives an order number like `FIXT-YYYYMMDD-0001`.
- FIXT team manually calls the customer to verify details.
- Admin updates status as the order moves through operations.
- Customer tracks current status from the website.

The product is built for a low-cost pilot:

- No paid SMS OTP.
- No paid Google Maps API.
- No payment gateway in MVP.
- No external admin auth provider.
- Manual verification and pay-after-service.
- Target hosting: Vercel frontend, Render backend, Neon PostgreSQL.

---

## 3. Current Phase

## Phase Status

| Phase | Name | Status |
|---|---|---|
| Phase 1 | Environment and scaffolding | Complete |
| Phase 2 | Backend, database, and core API | Complete |
| Phase 3 | Frontend booking experience | Complete |
| Phase 4 | Frontend-backend integration | Complete |
| Phase 5 | Admin authentication and order operations | Complete |
| Phase 6 | Testing and staging checklist | Mostly complete locally |
| Phase 7 | Production launch, CI/CD, domain, live smoke test | Current phase |

## What "current phase" means

The project is no longer mainly in feature-building mode. The core MVP is already usable. The next work is operational launch work:

- make production database migrations safe,
- deploy backend,
- deploy frontend,
- configure production environment variables,
- connect domain,
- add CI checks,
- smoke test live booking and admin flows,
- start pilot operations.

---

## 4. Directory Structure

```text
fixt/
  backend/
    main.py
    models.py
    schemas.py
    database.py
    requirements.txt
    pytest.ini
    fixt_local.db
    alembic.ini
    alembic/
      env.py
      versions/
        3ef4f2659119_create_customers_and_orders_tables.py
        bbe9ae349aa5_add_order_number_to_orders.py
        7c9d2f4a1b20_add_booking_integration_fields.py
    tests/
      test_api_phase6.py

  frontend/
    app/
      layout.tsx
      page.tsx
      booking/page.tsx
      booking/success/page.tsx
      track/page.tsx
      admin/page.tsx
      admin/orders/page.tsx
      globals.css
    components/
      SiteLogo.tsx
      booking/MapPicker.tsx
    lib/
      api.ts
    public/
      logo.png
    package.json
    package-lock.json
    next.config.ts
    tsconfig.json
    eslint.config.mjs

  FIXT_PROJECT_DOCUMENTATION.md
  FIXT_TECHNICAL_HANDOVER.md
  FIXT_INVESTOR_CLIENT_OVERVIEW.md
  PHASE6_STAGING_CHECKLIST.md
  FIXT_CURRENT_STATUS_DOCUMENTATION.md
```

---

## 5. Backend Explanation

The backend is a FastAPI application in `backend/main.py`.

## Backend stack

- FastAPI for API routes.
- SQLAlchemy ORM for database models.
- Alembic for migrations.
- Uvicorn for local server.
- Pydantic schemas for request and response models.
- HMAC-signed custom token for admin login.
- PostgreSQL target through `DATABASE_URL`.
- SQLite used in local/test contexts when configured.

## Backend startup behavior

`main.py` calls:

```python
Base.metadata.create_all(bind=engine)
```

This creates tables automatically for the connected database if they do not already exist. This is helpful locally, but production should still rely on Alembic migrations so schema changes are controlled and repeatable.

## Environment variables

Backend expects:

- `DATABASE_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_TOKEN_SECRET`
- `ADMIN_TOKEN_TTL_SECONDS` optional, default `86400`

Default development values exist for admin credentials and token secret, but those must be changed before production.

---

## 6. Database Models

## Customer

Defined in `backend/models.py`.

Fields:

- `id`: UUID string primary key.
- `name`: customer name.
- `phone`: unique phone number.
- `is_verified`: boolean, defaults to false.
- `created_at`: timestamp.

Relationship:

- One customer can have many orders.

## Order

Fields:

- `id`: UUID string primary key.
- `order_number`: human-readable order number, nullable for older records.
- `customer_id`: foreign key to customer.
- `device`: combined device display string.
- `brand`: selected brand.
- `model`: selected model.
- `issue`: selected issue.
- `issue_details`: optional detailed issue text.
- `estimated_price`: old/general estimate field.
- `price_min`: lower estimate.
- `price_max`: upper estimate.
- `district`: currently Jagtial.
- `village`: selected town/village.
- `address_line`: full address.
- `pincode`: 6-digit pincode.
- `nearby_location`: nearby point.
- `landmark`: optional landmark.
- `latitude`: map pin latitude.
- `longitude`: map pin longitude.
- `alternate_phone`: optional alternate number.
- `status`: current order status.
- `slot`: selected arrival slot.
- `created_at`: order created timestamp.
- `updated_at`: updated timestamp.

Relationship:

- Order belongs to customer.
- Order has many status events.

## OrderStatusEvent

This records the history of order status changes.

Fields:

- `id`: UUID string primary key.
- `order_id`: foreign key to order.
- `status`: status value recorded at that time.
- `changed_at`: timestamp.

Important: this model exists in code, and frontend/admin uses it. A production migration should be added for this table before live deployment if not already applied elsewhere.

---

## 7. Backend API Routes

## Public routes

`GET /health`

Returns service health:

```json
{ "status": "FIXT API is running" }
```

`POST /customers/`

Creates a customer or returns an existing customer with the same phone number.

Validation:

- Phone must be a 10-digit Indian mobile number.
- Must start with 6, 7, 8, or 9.
- Known dummy values and repeated-digit values are rejected.

`POST /orders/`

Creates an order.

Important behavior:

- Customer must exist.
- Customer phone is validated again.
- Alternate phone is validated if present.
- Rate limit is applied by phone and IP.
- Customer cannot create another active order while one is already active.
- Order number is generated as `FIXT-YYYYMMDD-NNNN`.
- First status is `pending_verification`.
- Initial status event is created.

`GET /orders/{order_number}`

Fetches an order by order number. Used by success and track pages.

`GET /orders/{order_number}/timeline`

Fetches status history for an order.

## Admin routes

`POST /admin/login`

Validates admin username/password and returns a signed bearer token.

`GET /admin/orders`

Protected route. Lists admin orders. Can filter by status with `?status=...`.

`PATCH /orders/{order_id}/status`

Protected route. Updates order status and creates a status timeline event.

`DELETE /orders/{order_id}`

Protected route. Permanently deletes an order.

---

## 8. Order Status Workflow

Supported statuses in current code:

- `pending_verification`
- `confirmed`
- `in_progress`
- `ready_to_deliver`
- `delivered`
- `completed`
- `cancelled`

Active statuses used to block duplicate bookings:

- `pending_verification`
- `confirmed`
- `in_progress`
- `ready_to_deliver`

Meaning:

- A customer cannot create another active booking while one of these statuses exists.
- Once an order is `delivered`, `completed`, or `cancelled`, the customer can book again.

---

## 9. Admin Authentication

Admin auth is custom and lightweight.

How it works:

- Admin sends username and password to `/admin/login`.
- Backend checks against environment variables.
- Backend creates a payload with subject, role, issue time, and expiry.
- Payload is signed with HMAC SHA256 using `ADMIN_TOKEN_SECRET`.
- Frontend sends `Authorization: Bearer <token>` for admin calls.
- Backend verifies signature, expiry, and `role=admin`.

This is acceptable for an MVP admin panel, but production must use:

- strong admin password,
- strong random token secret,
- HTTPS-only deployment,
- limited access to admin URL where possible.

---

## 10. Frontend Explanation

The frontend is a Next.js app in `frontend/`.

## Frontend stack

- Next.js 16.2.4.
- React 19.2.4.
- TypeScript.
- Tailwind CSS v4.
- Leaflet and React Leaflet for free map pinning.
- App Router pages.

## Frontend environment variables

- `NEXT_PUBLIC_API_URL`: backend API URL.
- `NEXT_PUBLIC_SITE_URL`: site URL used for metadata.

Fallback:

- API base URL defaults to `http://localhost:8000`.
- Site URL defaults to `http://localhost:3000`.

---

## 11. Frontend Pages

## `/`

Landing page.

Includes:

- FIXT brand/logo.
- Hero section.
- Booking call-to-action.
- Services section.
- Technician/service explanation.
- Service area section for Jagtial district.
- FAQ.
- Footer links.
- Quick track form in menu.

## `/booking`

Customer booking wizard.

The wizard collects:

- brand,
- model,
- issue,
- issue details,
- estimate,
- map pin,
- address,
- pincode,
- nearby location,
- landmark,
- district,
- village/town,
- slot,
- customer name,
- phone,
- alternate phone.

Booking steps:

1. Device selection.
2. Issue selection.
3. Price estimate.
4. Map and address.
5. Location and slot.
6. Contact and confirmation.

Note: the progress variable currently uses 7 as the denominator, but the UI flow submits at step 6. This is not blocking launch, but the progress math can be cleaned up.

## `/booking/success`

Confirmation page after order creation.

Shows:

- order number,
- current status,
- device,
- issue,
- location,
- slot,
- estimate.

It can load live details from the backend using the order number.

Note: the current checkmark character appears garbled in the source as `âœ“`. This should be replaced with a clean ASCII/HTML-safe check mark or icon before polishing production UI.

## `/track`

Customer order tracking page.

Customer enters order number and sees:

- current status,
- device,
- issue,
- area,
- slot,
- status timeline.

## `/admin/orders`

Admin order management page.

Includes:

- admin login form,
- order status filter,
- load orders button,
- table of orders,
- customer phone and alternate phone,
- repair details,
- estimate,
- address and coordinates,
- status dropdown,
- status timeline,
- permanent delete action with typed confirmation.

---

## 12. Frontend API Layer

The file `frontend/lib/api.ts` centralizes API calls.

Functions:

- `createCustomer`
- `createOrder`
- `getOrder`
- `getOrderTimeline`
- `getHealth`
- `adminLogin`
- `listAdminOrders`
- `updateOrderStatus`
- `deleteOrder`

It also defines typed response shapes for:

- customer,
- order,
- status timeline event,
- health response,
- admin login response.

Error handling:

- If backend cannot be reached, a user-friendly connection error is thrown.
- Non-OK HTTP responses are converted to error messages.

---

## 13. Map and Location

Location picking uses:

- `frontend/components/booking/MapPicker.tsx`
- Leaflet
- OpenStreetMap tiles

Why this was chosen:

- It avoids paid Google Maps API costs.
- It supports the MVP goal of near-zero recurring software cost.
- It captures latitude and longitude accurately enough for manual technician coordination.

Default map center:

- Jagtial coordinates: `18.7909, 78.9132`

---

## 14. Branding

Branding work completed:

- Shared logo component: `frontend/components/SiteLogo.tsx`.
- Public logo: `frontend/public/logo.png`.
- App icon: `frontend/app/icon.png`.
- Metadata uses logo for icon, Apple icon, Open Graph, and Twitter image.
- Logo appears across landing, booking, success, tracking, admin, and footer areas.

---

## 15. Testing and Verification

## Existing backend tests

Backend tests are in:

```text
backend/tests/test_api_phase6.py
```

Covered areas:

- health endpoint,
- customer creation,
- duplicate phone reuse,
- order creation,
- order fetch by order number,
- admin login,
- admin order listing,
- status update,
- invalid status rejection.

## Verification run on May 11, 2026

Frontend lint:

```powershell
cd frontend
npm.cmd run lint
```

Result: passed.

Frontend production build:

```powershell
cd frontend
npm.cmd run build
```

Result: passed.

Backend tests:

```powershell
cd backend
.\venv\Scripts\python.exe -m pytest
```

Result: could not run in this environment because the venv Python launcher pointed to:

```text
C:\Users\LENOVO\AppData\Local\Microsoft\WindowsApps\PythonSoftwareFoundation.Python.3.13_qbz5n2kfra8p0\python.exe
```

The machine returned:

```text
Access is denied.
```

This is an environment/tooling problem, not a confirmed application test failure.

---

## 16. What We Have Done Till Now

## Foundation

- Created backend and frontend project folders.
- Set up FastAPI backend.
- Set up Next.js frontend.
- Added project formatting/editor configuration.
- Added dependencies for backend and frontend.

## Backend

- Created database connection layer.
- Created SQLAlchemy models.
- Created Pydantic schemas.
- Created API routes.
- Added Alembic migration setup.
- Added migrations for customers, orders, order number, and booking fields.
- Added order number generation.
- Added admin login and bearer token auth.
- Added protected admin order list and status update routes.
- Added Indian mobile validation.
- Added basic dummy phone rejection.
- Added duplicate active booking protection.
- Added simple per-phone and per-IP booking rate limit.
- Added status timeline event creation.
- Added admin delete route.

## Frontend

- Built landing page.
- Built multi-step booking wizard.
- Added brand/model selection.
- Added issue selection and estimate range.
- Added OpenStreetMap location pinning.
- Added district/village/slot form.
- Added customer contact validation.
- Connected booking form to backend.
- Built success page.
- Built track page.
- Built admin orders page.
- Added status dropdown operations.
- Added admin delete confirmation flow.
- Added timeline display.
- Added shared API client.
- Added shared logo component and metadata branding.

## Documentation

Existing docs created before this file:

- `FIXT_PROJECT_DOCUMENTATION.md`
- `FIXT_TECHNICAL_HANDOVER.md`
- `FIXT_INVESTOR_CLIENT_OVERVIEW.md`
- `PHASE6_STAGING_CHECKLIST.md`

This current document updates the status with newer implementation details found in the codebase.

---

## 17. Known Issues and Risks

## Must fix before production

1. Add Alembic migration for `order_status_events`.

The SQLAlchemy model exists, and the frontend/admin expects timeline data. The migration files currently do not show a migration creating this table. Production deployment should not rely only on `Base.metadata.create_all`.

2. Replace development admin defaults.

Current code has fallback defaults:

- username: `admin`
- password: `admin123`
- token secret: `change-this-secret`

Production must use secure environment variables.

3. Configure production CORS.

Current backend CORS allows:

```python
allow_origins=["http://localhost:3000"]
```

Production frontend domain must be added.

4. Fix local backend Python environment.

The current venv Python launcher failed with `Access is denied`. Recreate or repair the backend virtual environment before final backend verification.

## Should fix before production polish

1. Replace garbled success-page checkmark text.

Current source contains `âœ“`.

2. Clean booking progress step count.

The page calculates progress as step out of 7, but the active form flow submits at step 6.

3. Add tests for newer backend behavior.

Current tests do not cover:

- phone validation rejection,
- duplicate active booking rejection,
- rate limiting,
- timeline endpoint,
- delete endpoint,
- newer statuses like `ready_to_deliver` and `delivered`.

4. Decide how to handle rate limits in production.

Current rate limit is in memory. It resets when the backend restarts and is not shared across server instances. This is acceptable for a simple MVP, but not a long-term protection system.

---

## 18. Phase 7 Launch Checklist

## Backend deployment

- Create production Neon database.
- Set `DATABASE_URL`.
- Set secure admin credentials.
- Set secure `ADMIN_TOKEN_SECRET`.
- Add production frontend URL to CORS.
- Add missing Alembic migration for `order_status_events`.
- Run Alembic migrations.
- Deploy backend to Render.
- Check `/health`.
- Check `/docs` if enabled.

## Frontend deployment

- Deploy frontend to Vercel.
- Set `NEXT_PUBLIC_API_URL` to deployed backend URL.
- Set `NEXT_PUBLIC_SITE_URL` to live frontend URL.
- Run Vercel production build.
- Verify logo/metadata.

## Domain

- Connect custom domain to Vercel.
- Optional: configure backend subdomain like `api.fixt...`.
- Update DNS records.
- Update CORS after final domain is known.

## Live smoke test

1. Open production frontend.
2. Create a booking with real test details.
3. Confirm order number appears.
4. Open track page and fetch the same order.
5. Login to admin.
6. Load orders.
7. Change status.
8. Confirm track page shows updated status/timeline.
9. Test delete only on a disposable test order.

## CI/CD

Add GitHub Actions or equivalent checks:

- backend pytest,
- frontend lint,
- frontend build.

---

## 19. Current Readiness Decision

The MVP is **feature-ready for pilot testing**, but production launch should wait until the deployment-readiness items are handled.

In simple terms:

- Product flow: ready.
- Local frontend build: ready.
- Backend implementation: mostly ready.
- Production database migration safety: needs one check/fix.
- Production configuration: pending.
- Domain and CI/CD: pending.

Recommended current label:

```text
Phase 7: Production launch preparation
Status: In progress
Primary next task: migration + deployment hardening
```

---

## 20. Recommended Immediate Next Steps

1. Repair/recreate backend virtualenv and rerun pytest.
2. Add Alembic migration for `order_status_events`.
3. Add backend tests for timeline, delete, phone validation, duplicate booking, and rate limit.
4. Update CORS for deployed frontend domain.
5. Deploy backend to Render with production env vars.
6. Deploy frontend to Vercel with production API URL.
7. Run full live smoke test.
8. Start Jagtial pilot and track manual metrics.

---

## 21. Final Project State

FIXT has moved from idea to a working MVP. The important customer and admin journeys exist:

- customer can book,
- backend stores order,
- customer receives order number,
- customer can track status,
- admin can login,
- admin can manage orders,
- admin can update status,
- status history can be shown,
- frontend builds successfully.

The project is now in the launch-readiness phase. The next work is not adding many new features; it is making the production environment reliable enough for real users.
