# FIXT

FIXT is a hyper-local doorstep mobile repair booking platform built as an MVP for Jagtial district, Telangana. The project is designed to validate demand for a local repair service before scaling into a larger operation. The core idea is simple: customers can book repairs from a website, the team verifies the request manually, and an admin can track and update the service status through a protected dashboard.

## Project goal

The main business goal was to test whether local customers are willing to use a doorstep repair service without building a fully automated system first. To keep costs low, the MVP avoids paid third-party services where possible and focuses on a practical workflow:

- customer books a repair online
- FIXT team verifies via phone call
- admin confirms and updates the order lifecycle
- customer tracks the order using a generated order number
- payment happens after the repair is complete

## What was developed

### Customer-facing website

The frontend is a Next.js application with a polished landing page and conversion-focused flow.

Key screens and features:

- landing page with hero content, service list, trust messaging, and CTA buttons
- booking flow for device type, issue, estimate, service location, address, slot selection, and final submission
- location selection using Leaflet/OpenStreetMap for map pinning
- success page showing the order number and summary
- order tracking page to look up status by order number
- admin login and management dashboard for operations

### Backend API

The backend is a FastAPI application that exposes public and admin endpoints for customer and order management.

Implemented backend capabilities:

- customer creation and lookup by phone number
- order creation with generated order IDs
- duplicate and active-order protection
- order tracking by order number
- order status timeline/history
- admin authentication with a signed bearer token
- admin access to list and filter orders
- status updates and deletion flows

### Database model

The project uses SQLAlchemy models with PostgreSQL as the target database and SQLite as a local fallback option when needed.

Data model includes:

- Customer
- Order
- OrderStatusEvent

The order model stores essential repair information such as:

- device, brand, model, issue, issue details
- estimate range and repair cost
- location data including district, village, address, landmark, pincode
- latitude and longitude from map selection
- alternate phone number, slot, and booking date
- current order status and status event history

### Admin operations

The admin panel supports:

- username/password login
- secure token-based requests
- order listing and filtering by status
- status change workflow
- repair cost capture when transitioning to active work
- deletion confirmation flow for cleanup
- order timeline view in the admin UI

## Tech stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Leaflet + react-leaflet
- OpenStreetMap tiles

### Backend

- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL
- SQLite for local fallback
- Pydantic validation
- custom HMAC-based admin token auth

### Testing and tooling

- pytest
- FastAPI TestClient
- HTTPX
- ESLint
- npm build validation

## Project structure

```text
fixt/
  README.md
  backend/
    main.py
    models.py
    schemas.py
    database.py
    requirements.txt
    pytest.ini
    alembic/
      env.py
      versions/
    tests/
      test_api_phase6.py
  frontend/
    app/
      page.tsx
      layout.tsx
      booking/
      track/
      admin/
    components/
      SiteLogo.tsx
      booking/
    lib/
      api.ts
    public/
    package.json
    next.config.ts
    tsconfig.json
    eslint.config.mjs
```

## Main user flows

### Customer flow

1. user lands on the homepage
2. user chooses the type of repair needed
3. user fills in issue details and location
4. user selects service area and preferred slot
5. order is created in the backend
6. customer sees a human-readable order ID like `FIXT-YYYYMMDD-0001`
7. order can be tracked using the order number

### Admin flow

1. admin logs in with username and password
2. backend returns an access token
3. admin loads list of orders
4. admin filters by status
5. admin updates progress or marks the order as completed/cancelled
6. status timeline is stored and displayed

## Key business decisions

This MVP deliberately kept the product lean:

- no paid OTP system
- no paid map provider
- no payment gateway in the early launch phase
- no external auth provider
- manual verification by phone call before scheduling/repair
- low-cost deployment approach through free-tier hosting and minimal integrations

This strategy was intentional to reduce risk for a pilot launch in a local geography.

## Issues we faced during development

Several practical issues were encountered while building and validating the product.

### Backend and database issues

- Alembic migration sequencing and setup issues during early project setup
- schema/model mismatches while aligning frontend and backend fields
- duplicate `get_db()` conflicts and other integration cleanups
- null order-number legacy data causing admin serialization problems
- environment variable issues and `.env` formatting errors
- connectivity issues with Neon DB hosted remotely, including DNS resolution problems

### Frontend and app issues

- TypeScript and auth-header handling issues on admin requests
- React lint problems caused by state updates inside effect logic
- JSX and encoding issues caused by Windows copy-paste/editor quirks
- map rendering and client-side Leaflet loading concerns
- admin and status-update flows needed multiple iterations to be stable

### Environment and deployment concerns

- local Windows PowerShell execution quirks for multi-line commands
- VS Code environment injection inconsistencies across terminals
- need to keep production credentials separate from local dev defaults
- local SQLite fallback was necessary to continue testing despite network/database connectivity instability

## How the project was resolved

The final implementation addressed the main issues by:

- standardizing backend schemas and order fields
- adding explicit order-number generation and filtering logic
- making admin API auth stronger and more consistent
- creating a shared logo component and cleaner branding layout
- handling legacy records safely while preserving compatibility
- using map-based location capture without requiring a paid provider
- validating the frontend and backend through tests and build checks

## Validation status

At the project level, the implementation reached a working MVP state:

- backend API routes operate and are connected to the database
- booking flow works end-to-end locally
- order tracking works using order numbers
- admin panel functionally supports status updates
- frontend lint and production build checks are in place
- backend tests exist and were passing in the working project cycle

## Current project phase

The MVP is effectively built and usable for a local pilot. The remaining work is mostly operational launch work rather than major feature development, such as:

- production migration safety
- deployment setup
- domain and hosting config
- CI/CD checks
- live smoke testing
- pilot launch and routine operations

## Summary

FIXT is a low-cost, locally focused mobile repair booking MVP. The project includes both the operational product and the supporting software stack needed to run it: a customer booking flow, a backend API, a database, a tracking experience, and an admin dashboard. It was built to validate demand in a restricted region while keeping infrastructure and third-party costs as low as possible.

The project is not just a codebase; it represents a practical pilot system for a local service business. The main value is that it can handle real customer booking, order tracking, and manual operational management with minimal infrastructure cost.
