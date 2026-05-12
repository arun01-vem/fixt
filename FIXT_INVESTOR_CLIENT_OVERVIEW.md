# FIXT - Investor / Client Overview

Version: v1.0  
Date: May 2026  
Project: FIXT - Hyper-Local Mobile Repair Service (MVP)

## Executive Summary

FIXT is a doorstep mobile repair booking platform built to validate demand in Jagtial district before scaling.  
The product is intentionally optimized for low burn: customers can book repairs online, track status, and receive service with manual verification workflow.

The MVP is now functionally complete through core operations and admin control, with launch readiness in progress.

## Problem Being Solved

Customers need quick, trustworthy mobile repair without traveling to service centers.  
Local repair is often fragmented, price transparency is poor, and booking/tracking workflows are missing.

## FIXT Solution

- Simple web booking flow
- Transparent estimate range before booking
- Doorstep-first service model
- Human-readable order tracking ID
- Admin panel for real-time operational control

## Current Product Capabilities

- Landing page and conversion funnel
- Structured multi-step booking
- Live success + order tracking pages
- Admin login and order management panel
- Order status workflow from pending to completed

## Business Model (Pilot Stage)

- Hyper-local district launch (Jagtial first)
- Manual phone verification for early users
- Pay-after-service model
- Low operational overhead and fast feedback cycles

## Technology + Cost Strategy

- Frontend: Next.js + TypeScript + Tailwind
- Backend: FastAPI + SQLAlchemy + Alembic
- Database: Neon PostgreSQL
- Hosting: Vercel (frontend) + Render (backend), free tiers

Current strategy avoids paid APIs and keeps recurring platform cost near zero (excluding domain purchase).

## Development Progress

- Phase 1: Environment/Scaffolding - Complete
- Phase 2: Backend/API/DB - Complete
- Phase 3: Frontend booking journey - Complete
- Phase 4: System integration - Complete
- Phase 5: Admin operations - Complete
- Phase 6: Tests/staging checklist - Complete (engineering side)
- Phase 7: Production launch execution - In progress

## Validation Readiness

The platform is suitable for pilot launch and real-user testing in one district.  
Key infrastructure, booking flow, admin control, and core test coverage are in place.

## Next Milestone (Phase 7)

- Deploy production stack
- Connect custom domain
- Enable CI/CD checks
- Execute final live smoke test
- Start pilot user acquisition and track conversion metrics

## Key Metrics for Pilot Decision

- Booking leads/day
- Contactable customer %
- Confirmed booking %
- Job completion %
- Average order value
- Cancellation reasons

## Strategic Outcome

FIXT has moved from concept to a working, test-backed MVP with operational admin controls.  
The next step is controlled market validation, not additional feature complexity.
