# Send Power Feature Spec

## Feature

`Send Power`

## Status

Idea / Feasibility stage

## Owner

TBD

## Summary

Allow User A to pay for electricity on behalf of User B.

The system should vend a fresh token directly to User B's target meter after successful payment.

This feature is intended to feel like:

- gifting power
- sponsoring a top-up
- helping another resident recharge quickly

## Problem

Users may want to help another resident, family member, tenant, friend, or neighbor with electricity without sending cash first.

Current Miraton flow is centered on buying power for the payer's own meter.

## Goal

Make it easy for a user to buy electricity for another user from within the platform.

## Non-Goal

This feature does not attempt true physical meter-to-meter unit transfer.

It does not move already loaded units from one prepaid meter to another.

## Feasibility

Feasible: `Yes`

Reason:

- the backend already supports user records
- meter lookup and meter linking already exist
- payment initialization already exists
- vending already exists
- transaction logging already exists
- notifications and audit logs already exist

The main work is new business logic and transaction ownership handling.

## Proposed User Story

As a user, I want to send electricity to another person so they can receive power directly on their own meter.

## Core User Flow

1. User A opens `Send Power`.
2. User A selects a recipient.
3. System resolves the recipient meter.
4. User A enters amount.
5. System shows confirmation.
6. User A pays.
7. System creates a pending transaction.
8. On payment success, system vends to recipient meter.
9. Sender and recipient are notified.

## Supported Recipient Modes

### MVP

- send to a registered resident in the same property

### Later

- send to any registered user across properties
- send by meter number
- send to external unsupported recipients after meter verification

## Why This Feature Is Interesting

- creates a social utility experience
- makes the product more than self-service vending
- can support family, welfare, landlord, and community use cases
- can differentiate Miraton from more standard estate apps

## Example Use Cases

- parent sends power to child
- spouse sends power to partner
- landlord helps a tenant temporarily
- estate welfare desk supports a vulnerable resident
- friend sends an emergency recharge

## Product Rules

### Required

- sender must be authenticated
- recipient must be valid
- recipient must have a vendable meter for MVP
- payment must succeed before vending
- transaction must capture sender and recipient context

### Recommended

- show recipient confirmation before payment
- mask full meter number in UI
- notify both sender and recipient
- keep an audit trail

## MVP Scope

- same-property resident-to-resident send power
- sender pays through existing payment flow
- recipient meter is derived from backend records
- token is vended to recipient meter
- both users receive notifications

## Out of Scope for MVP

- true unit transfer between physical meters
- recurring send power
- anonymous gifting
- split contributions from multiple senders
- internal wallet/credit system

## Backend Impact

### Likely Service Changes

- add new `Send Power` use case in `VendingService` or a dedicated service
- support sender != recipient in payment/vending pipeline
- update transaction creation logic
- add sender/recipient-aware notifications

### Likely Data Changes

Current transaction model assumes the paying user is also the beneficiary in most flows.

This feature will likely need fields such as:

- `initiatedByUserId`
- `recipientUserId`
- `recipientMeterId`
- `recipientHouseId`
- `recipientPropertyId`
- `isGift`
- `note`

Optional:

- a dedicated `PowerGift` model for cleaner analytics and history

## Suggested API Shape

### Preview

`POST /v1/vend/send-power/preview`

Purpose:

- validate recipient
- resolve target meter
- show summary before payment

### Pay

`POST /v1/vend/send-power/pay`

Purpose:

- initialize payment
- create pending send-power transaction

## Success Metrics

- send-power transactions completed
- repeat senders
- failed sends
- average time from payment to token delivery
- support tickets per send-power transaction

## Risks

- sending power to wrong recipient
- privacy leakage in recipient lookup
- fraud or abuse
- confusion over sender vs recipient receipts
- support disputes when token delivery fails

## Mitigations

- confirmation screen before payment
- limited recipient discovery for MVP
- strong audit trail
- sender and recipient receipts separated clearly
- rate limits and fraud checks

## Open Questions

- should MVP be same-property only?
- should admins/managers be allowed to send power operationally?
- should recipient identity be fully visible or partially masked?
- should sender be able to attach a message?
- should sender be able to send by meter number in v1?

## Notes For Future Ideas

Potential adjacent ideas to add later:

- emergency power request
- group-funded top-up
- scheduled family support
- employer-to-staff power disbursement
- estate-managed welfare credits
