# Leads Module Implementation Plan

## Overview
This plan implements a 3-layer lead capture and management system for the VilCom ISP platform.

---

## Phase 1: Backend - Database & Models ✅

### 1.1 Create Migration for Leads Table ✅
- **File**: `backend/database/migrations/2024_01_01_000029_create_leads_table.php`
- Fields implemented with all required columns

### 1.2 Create LeadVisit Migration ✅
- **File**: `backend/database/migrations/2024_01_01_000030_create_lead_visits_table.php`

### 1.3 Create Lead Model ✅
- **File**: `backend/app/Models/Lead.php`
- Constants for STATUSES, SOURCES, SCORING_POINTS
- Relationships: user, product, assignedStaff, visits
- Scopes for filtering
- Scoring calculation method

### 1.4 Create LeadVisit Model ✅
- **File**: `backend/app/Models/LeadVisit.php`

---

## Phase 2: Backend - Controllers & API ✅

### 2.1 Create LeadController ✅
- **File**: `backend/app/Http/Controllers/Api/LeadController.php`
- Public endpoints:
  - `POST /api/leads/track-visit` - track page visit (beacon)
  - `POST /api/leads/capture` - capture lead from CTA
  - `POST /api/leads/waitlist` - coverage waitlist signup
  - `POST /api/leads/newsletter` - newsletter signup
  - `POST /api/leads/abandonment` - booking abandonment
  - `GET /api/leads/visitor-id` - generate visitor ID

### 2.2 Create Admin LeadController ✅
- **File**: `backend/app/Http/Controllers/Api/Admin/LeadController.php`
- Full CRUD endpoints for admin management

### 2.3 Add Routes ✅
- **File**: `backend/routes/api.php`
- Added lead routes for public and admin

---

## Phase 3: Frontend - Lead Tracking ✅

### 3.1 Create Lead Service ✅
- **File**: `frontend/src/services/leads.ts`
- API functions for all endpoints

### 3.2 Create LeadTracker Hook ✅
- **File**: `frontend/src/hooks/useLeadTracker.ts`
- Initialize `vlc_vid` cookie on first visit
- Track page views with sendBeacon
- Capture UTM params from URL
- Track scroll depth
- Track time on page
- Detect device type

---

## Phase 4: Frontend - Components ✅

### 4.1 Create PlanCTAButton Component ✅
- **File**: `frontend/src/components/PlanCTAButton.tsx`
- Props: productId, children, variant, navigateTo
- On click: silently fire POST /api/leads/capture before navigating

### 4.2 Create NewsletterSignup Component ✅
- **File**: `frontend/src/components/NewsletterSignup.tsx`
- Minimal email capture with validation

---

## Phase 5: Frontend - Admin Lead Management ⏳
- LeadManagement page - Coming soon

---

## Phase 6: Lead Scoring Logic ✅

### Scoring Points System ✅:
| Signal | Points |
|--------|--------|
| Has email | +10 |
| Has phone | +10 |
| Source: booking_partial | +25 |
| Source: quote_form | +20 |
| Source: plan_cta | +15 |
| Has a product interest | +10 |
| Is a business | +5 |
| Left a message | +5 |
| UTM tracked (paid traffic) | +5 |
| Page views × 2 (up to 10) | +10 |

---

## Implementation Status

### Completed ✅
1. ✅ Backend migrations (leads, lead_visits)
2. ✅ Lead & LeadVisit models with scoring
3. ✅ Public LeadController (track-visit, capture, waitlist, newsletter, abandonment)
4. ✅ Admin LeadController (full CRM functionality)
5. ✅ API Routes
6. ✅ Frontend leads service
7. ✅ useLeadTracker hook
8. ✅ PlanCTAButton component
9. ✅ NewsletterSignup component

### To Do
- [ ] Integrate useLeadTracker in App.tsx
- [ ] Create CoverageWaitlistForm component
- [ ] Create useBookingAbandonment hook
- [ ] Create Admin LeadManagement page
- [ ] Add route for LeadManagement in App.tsx

---

## Dependencies
- Laravel 10+ (existing)
- React Router (existing)
- Axios (existing)

