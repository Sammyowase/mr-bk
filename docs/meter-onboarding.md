# Meter Onboarding Design

## Purpose

This document describes the ideal onboarding flow for prepaid meters in the Miraton backend.

Goal:

- allow residents to vend electricity without Miraton installing meters itself
- onboard properties that already have prepaid meters
- make meter assignment easy for managers and support teams
- reduce failed vending attempts caused by missing or badly linked meters

## Core Product Assumption

Miraton does not need to install prepaid meters for a property.

Miraton only needs the property or resident to already have a valid prepaid meter that can be:

- verified externally
- registered in Miraton
- linked to the correct property
- linked to the correct house or unit
- linked to the correct resident

Once that mapping exists, vending can begin.

## What The Current Backend Requires

The current resident vending flow depends on a meter already existing in Miraton's database.

`VendingService.makePayment()` requires:

- a meter record found by `meterNumber`
- that the meter has a `propertyId`
- that the meter has a `houseId`

If any of those are missing, vending is blocked.

Relevant code:

- `src/services/vending.service.ts`
- `src/services/user.service.ts`
- `src/routes/user.routes.ts`

## Current Backend Flow

Today the backend supports this basic onboarding path:

1. Create the property.
2. Create the house or unit under the property.
3. Create or invite the resident.
4. Call `POST /v1/users/add-meter` with:
   - `propertyId`
   - `houseId`
   - `email`
   - `number`
5. The backend verifies the meter externally.
6. The backend creates or updates the meter record and links it to the resident, house, and property.
7. The resident can then call the vending payment flow.

## Ideal User Experience

The best onboarding experience should be role-based.

### 1. Manager Onboarding Flow

Manager journey:

1. Create the property.
2. Bulk add or create houses or units.
3. Invite residents into the property.
4. Open a "Meter Onboarding" screen for each unit.
5. Enter:
   - resident email
   - unit
   - meter number
6. System verifies meter ownership details from the external meter service.
7. System shows a confirmation screen:
   - meter number
   - customer name returned by provider
   - property
   - unit
   - resident
8. Manager confirms assignment.
9. System stores the mapping and marks the unit as vend-ready.

Manager success state:

- unit has resident
- unit has meter
- meter is verified
- vending is enabled

### 2. Resident Self-Service Flow

Resident journey:

1. Resident signs up or accepts invite.
2. Resident sees onboarding checklist:
   - complete profile
   - verify account
   - link meter
3. Resident enters meter number.
4. System verifies the meter externally.
5. Resident selects or confirms:
   - property
   - house or unit
6. If the meter is not yet linked elsewhere, the resident submits.
7. Manager reviews and approves if approval mode is enabled.
8. Meter is linked and resident can vend.

Resident success state:

- "Meter linked successfully"
- "You can now buy electricity tokens"

### 3. Support or Admin Assisted Flow

This is the fallback path for difficult cases.

Use when:

- resident entered the wrong meter number
- resident exists but unit is not yet created
- meter is already linked to another user
- provider verification succeeds but returned customer name looks suspicious
- the property has a meter migration from another platform

Support journey:

1. Search property.
2. Search resident.
3. Search existing meter by number.
4. Resolve conflicts.
5. Reassign or attach the meter.
6. Leave an audit trail.

## Recommended Product States

Each unit should expose a clear onboarding state in the frontend.

Suggested states:

- `no_resident`
- `resident_invited`
- `resident_registered`
- `meter_missing`
- `meter_pending_review`
- `meter_verified`
- `vend_ready`
- `vend_blocked`

This makes operations much easier than relying on trial-and-error vending attempts.

## Recommended Screens

### Property Setup Screen

Show:

- property details
- number of units
- units with resident assigned
- units with verified meter
- units ready for vending

### Unit Detail Screen

Show:

- unit name
- resident name and email
- meter number
- external meter customer name
- onboarding status
- last verification time
- actions:
  - add meter
  - replace meter
  - unlink meter
  - retry verification

### Meter Review Queue

Show:

- all unverified or conflicted meter assignments
- duplicate meter numbers
- units without meters
- residents without assigned units

## Recommended Business Rules

These rules fit the current backend and should be enforced clearly in product UX.

### Required before vending

- property must exist
- house or unit must exist
- resident must exist
- meter must exist in Miraton
- meter must be linked to the correct property
- meter must be linked to the correct house

### Strongly recommended

- meter should also be linked to the correct resident owner
- meter customer name from provider should be shown before final confirmation
- one active house should have one active prepaid meter unless the business model changes

### Operational rules

- do not allow silent meter reassignment between users
- do not allow the same meter to be attached to multiple houses
- require audit logs for meter replacement
- require explicit review when provider name and resident name do not roughly match

## Recommended End-to-End Onboarding Flow

This is the version I would ship first.

1. Manager creates property.
2. Manager creates units.
3. Manager invites resident.
4. Resident registers.
5. Manager or resident enters meter number.
6. Backend verifies meter externally.
7. System checks conflicts:
   - already assigned to another house
   - already assigned to another owner
   - invalid meter
8. System presents a confirmation summary.
9. Assignment is saved.
10. Resident sees "vend ready".
11. Resident buys token through `/v1/vend/pay`.

## API Touchpoints Already Present

The current backend already gives you most of the skeleton for this:

- property creation and updates
- house creation and updates
- resident registration
- resident invitation
- meter assignment through `POST /v1/users/add-meter`
- meter verification utilities
- vending payment through `POST /v1/vend/pay`

## Gaps In The Current Backend

These are the main issues to fix before relying on this flow in production.

### 1. `add-meter` is not protected

`POST /v1/users/add-meter` currently has validation but no `Authorize` middleware in `src/routes/user.routes.ts`.

That means meter assignment should be locked down before launch.

Recommended fix:

- require authentication
- restrict to `super_admin`, `admin`, and `manager`
- optionally allow resident self-service behind a separate reviewed endpoint

### 2. Vending does not strictly verify the caller owns the meter

`makePayment()` finds the meter by number and checks restrictions, property, and house linkage, but it does not strictly enforce that the logged-in user is the assigned owner of that meter.

Recommended fix:

- require `userMeter.ownerId === userId` for resident vending
- optionally allow admins and managers to bypass that rule

### 3. No explicit meter onboarding status model

The backend stores linked data, but it does not appear to store a first-class onboarding state like:

- pending
- verified
- conflicted
- rejected

Recommended fix:

- add meter verification and onboarding status fields
- store last verified time and verifier

### 4. No dedicated approval flow

The current flow writes the assignment immediately once checks pass.

Recommended fix:

- if residents can self-link meters, add manager approval for higher trust

## Suggested Future Enhancements

- bulk CSV upload for unit-to-meter mapping
- bulk meter verification before resident move-in
- dashboard showing vending readiness by property
- duplicate/conflict warning center
- meter replacement workflow for changed meters
- resident-facing "why can't I vend?" troubleshooting view

## Recommended Launch Strategy

To help this idea succeed operationally:

1. Target properties that already use prepaid meters.
2. Start with manager-assisted onboarding instead of full resident self-service.
3. Make "vend readiness" visible at unit level.
4. Lock down meter assignment permissions.
5. Add ownership checks before payment initialization.

## Summary

Miraton does not need to install prepaid meters itself.

Miraton needs a reliable process for onboarding prepaid meters that already exist.

The winning operational model is:

- properties already have prepaid meters
- managers or support link each meter to the correct unit and resident
- the platform verifies and stores that mapping
- residents can immediately start vending once the unit is marked vend-ready
