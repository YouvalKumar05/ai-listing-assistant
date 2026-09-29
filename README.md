# AI Listing Assistant & Marketplace Risk Engine

An end-to-end, independent AI-powered marketplace platform that streamlines seller onboarding, enhances listings with multimodal intelligence, detects fraud and catalog anomalies, and provides an auditable human review & decision workflow.

> **Important:** This is an independent portfolio project. It does not reference, imitate, or use proprietary terminology, branding, or private systems of any real company.

---

## 🏛 Architecture Overview

```
[Seller Input] ──> [Data Ingestion & Preprocessing] ──> [PostgreSQL]
                                                            │
  ┌─────────────────────────────────────────────────────────┘
  ▼
[AI Assistant: Multimodal Product Understanding]
  ├── Attribute & Condition Extraction
  ├── Title & Description Generation
  └── Pricing Intelligence & Metadata
  ▼
[Marketplace Risk & Fraud Engine]
  ├── Image Integrity (pHash / duplicate checks)
  ├── Pricing Anomaly Detection
  ├── Text / Pattern Risk Signals
  └── Seller Reputation Scoring
  ▼
[Human Review & Admin Decision Layer]
  ├── Admin Review Queue
  ├── Evidence Dossier & AI Explanation
  ├── Governed Actions (Approve, Request Info, Hold, Escalate, Restrict)
  └── Immutable Audit Trail (PostgreSQL Transactions)
```

---

## 🚀 Key Modules

1. **Seller Intake & Preprocessing (Prompt 1)**:
   - Go backend accepting images, invoices, warranties, and product notes.
   - File validation, metadata normalization, and storage abstraction.

2. **Multimodal AI Assistant (Prompt 2)**:
   - High-precision attribute extraction, structured condition scoring, and SEO title/description generation.

3. **Fraud Detection & Risk Scoring (Prompt 3)**:
   - Heuristic and model-driven risk engine evaluating listing anomalies across images, text, price, and reputation.
   - Outputs composite risk bands: Low, Review, Suspicious, Critical.

4. **Admin Review & Decision Layer (Prompt 4)**:
   - Human-in-the-loop review workflow.
   - Strictly enforces that AI only recommends; final decisions require human review.
   - Full transactional integrity: decisions atomically update listing status and insert immutable audit logs.
   - Audit trail endpoint: `GET /api/v1/listings/{listingId}/audit-log`.
   - Admin decision endpoint: `POST /api/v1/admin/reviews/{listingId}/decision`.

---

## 🛠 Technology Stack

- **Backend**: Go (Gin framework), PostgreSQL (`pgx` / `database/sql`), SQL migrations.
- **Frontend**: Angular 19+ (Standalone components, reactive signals/RxJS, modern responsive CSS).
- **AI Service**: Python FastAPI / Multimodal inference layer.

---

## 🏃 Getting Started

### 1. Database Migrations
Run PostgreSQL migrations located in `database/migrations/`:
```bash
# Example using psql or migrate tool
psql $DATABASE_URL -f database/migrations/001_initial_schema.up.sql
psql $DATABASE_URL -f database/migrations/002_ai_analysis_schema.up.sql
psql $DATABASE_URL -f database/migrations/003_risk_engine_schema.up.sql
psql $DATABASE_URL -f database/migrations/004_admin_review_schema.up.sql
```

### 2. Run Go Backend
```bash
cd backend
go run cmd/main.go
```
The server will start on port `8080` (or `API_PORT`).

### 3. Run Angular Frontend
```bash
cd frontend
npm install
npm run start
```
Navigate to `http://localhost:4200`.

---

## 🧪 Testing

### Backend Unit Tests
```bash
cd backend
go test ./... -v
```

### Frontend Build Validation
```bash
cd frontend
npm run build
```
