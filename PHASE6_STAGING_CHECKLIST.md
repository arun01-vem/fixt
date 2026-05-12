# Phase 6 - Testing and Staging Checklist

This checklist is for the zero-cost MVP launch setup.

## 1) Backend test suite

Run from `backend`:

```powershell
.\venv\Scripts\python.exe -m pytest
```

Expected: all tests pass.

## 2) Frontend quality checks

Run from `frontend`:

```powershell
npm.cmd run lint
npm.cmd run build
```

Expected: lint and build pass.

## 3) Staging environment setup (free tiers)

- Frontend staging: Vercel project (Preview or separate staging project)
- Backend staging: Render free web service
- Database staging: separate Neon free database/project

Do not reuse production database for staging.

## 4) Required staging env vars

Backend staging vars:

- `DATABASE_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_TOKEN_SECRET`
- `ADMIN_TOKEN_TTL_SECONDS`

Frontend staging vars:

- `NEXT_PUBLIC_API_URL` (pointing to staging backend URL)

## 5) Manual smoke test on staging

1. Open staging frontend landing page.
2. Complete booking flow end-to-end.
3. Confirm success page shows `order_number`.
4. Open track page and verify order status loads.
5. Login to `/admin/orders`.
6. Change status from `pending_verification` to `in_progress`.
7. Re-check track page and confirm status change is visible.

## 6) Exit criteria for Phase 6

- Backend tests pass locally.
- Frontend lint/build pass locally.
- One complete smoke flow passes on staging.
