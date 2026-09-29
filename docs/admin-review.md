# Human Review & Admin Decision Layer

## Overview
The Admin Review & Decision Layer provides an auditable, human-in-the-loop workflow for resolving listings flagged by automated screening or requiring manual evaluation before publication.

## Core Tenets
1. **Human Authority**: Automated systems generate risk scores and recommendations; only authorized human reviewers can approve, hold, escalate, or restrict listings.
2. **Mandatory Justification**: Any non-trivial or restrictive action requires a reviewer reason.
3. **Atomic Audit Logging**: Status updates and audit log entries occur within the same PostgreSQL transaction (`BeginTx` / `Commit`).

## API Endpoints

### 1. `GET /api/v1/admin/reviews`
Fetches current queue of listings pending review.

### 2. `GET /api/v1/admin/reviews/:listingId`
Retrieves aggregated listing details, AI enrichment metadata, risk signals, and prior audit history.

### 3. `POST /api/v1/admin/reviews/:listingId/decision`
Submits an administrative decision.

**Request Payload:**
```json
{
  "action": "APPROVE" | "REQUEST_INFORMATION" | "HOLD" | "ESCALATE_AUTHENTICATION" | "RESTRICT",
  "reason": "String justification (required for all actions except APPROVE)"
}
```

**Response Payload:**
```json
{
  "listingId": "listing-001",
  "previousStatus": "ADMIN_REVIEW",
  "newStatus": "APPROVED",
  "action": "APPROVE",
  "reason": "Meets quality criteria.",
  "auditLogId": "a50cbe91-45da-48c0-8fe6-b33df19f5647",
  "timestamp": "2026-09-29T16:55:00Z"
}
```

### 4. `GET /api/v1/listings/:listingId/audit-log`
Returns the chronological audit log entries for a given listing.
