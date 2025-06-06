# Legacy Pro V6.7

**Legacy Pro** is an all-in-one digital estate planning and legacy management platform. It provides users with:
- **Trust Builder** (AI-generated, state-compliant documents)
- **Entity Builder** (AI-driven business formation documents)
- **Smart Vault** (secure file storage on AWS S3 with preset folder tree functionality)
- **Ava AI Advisor** (real-time AI-powered legal and financial guidance)
- **Legacy Letter** (sentimental AI-drafted letters)
- **Protection Score** (assesses user’s digital asset security health)
- **Subscriptions & Billing** (Stripe integration)
- **Notifications & Admin Dashboard**
- **Admin Functions** (user management, metrics)

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Getting Started](#getting-started)
   1. [Prerequisites](#prerequisites)
   2. [Cloning & Installing Dependencies](#cloning--installing-dependencies)
   3. [Environment Variables](#environment-variables)
   4. [Database Setup](#database-setup)
   5. [Running Locally](#running-locally)
4. [Backend Structure & Implementation](#backend-structure--implementation)
   1. [Prisma & Database Models](#prisma--database-models)
   2. [Configuration & Utilities](#configuration--utilities)
   3. [Authentication & Authorization](#authentication--authorization)
   4. [Subscriptions & Stripe Integration](#subscriptions--stripe-integration)
   5. [Trust Builder Service](#trust-builder-service)
   6. [Entity Builder Service](#entity-builder-service)
   7. [Smart Vault (File Storage)](#smart-vault-file-storage)
   8. [Ava AI Advisor](#ava-ai-advisor)
   9. [Legacy Letter Service](#legacy-letter-service)
   10. [Protection Score Calculation](#protection-score-calculation)
   11. [Dashboard & Admin APIs](#dashboard--admin-apis)
   12. [Notifications & Audit Logs](#notifications--audit-logs)
5. [Frontend Structure & Implementation](#frontend-structure--implementation)
   1. [Next.js Configuration](#nextjs-configuration)
   2. [Layout, Navbar & Footer](#layout-navbar--footer)
   3. [Authentication & NextAuth](#authentication--nextauth)
   4. [Subscriptions UI](#subscriptions-ui)
   5. [Trust Builder UI](#trust-builder-ui)
   6. [Entity Builder UI](#entity-builder-ui)
   7. [Smart Vault UI](#smart-vault-ui)
   8. [Ava AI Advisor UI](#ava-ai-advisor-ui)
   9. [Legacy Letter UI](#legacy-letter-ui)
   10. [Protection Score Chart](#protection-score-chart)
   11. [Dashboard Pages](#dashboard-pages)
   12. [Notifications Panel](#notifications-panel)
   13. [Admin Dashboard UI](#admin-dashboard-ui)
6. [Testing & QA](#testing--qa)
7. [Deployment](#deployment)
   1. [Backend Deployment](#backend-deployment)
   2. [Frontend Deployment](#frontend-deployment)
   3. [DNS & SSL Configuration](#dns--ssl-configuration)
8. [Maintenance & Monitoring](#maintenance--monitoring)
9. [Appendices](#appendices)
   1. [Appendix A: API Reference Summary](#appendix-a-api-reference-summary)
   2. [Appendix B: Prisma Schema Overview](#appendix-b-prisma-schema-overview)
   3. [Appendix C: Useful Prisma Queries](#appendix-c-useful-prisma-queries)

---

## Features

- **User Authentication**: Email/password and OAuth (Google, GitHub).
- **Subscriptions & Billing**: Stripe Checkout, Webhooks, subscription management.
- **Trust Builder**: AI-generated trust documents with streaming and PDF export.
- **Entity Builder**: AI-generated business formation documents with streaming and PDF export.
- **Smart Vault**: 
  - Hierarchical folder tree (preset folder structure can be created on user onboarding).
  - File upload/download via AWS S3 pre-signed URLs.
  - File deletion and metadata management.
- **Ava AI Advisor**: Real-time AI chat using OpenAI GPT-4 Turbo (SSE).
- **Legacy Letter**: AI-generated personalized letters with streaming preview and PDF download.
- **Protection Score**: Calculates user's digital security health score based on vault usage, trust/entity presence, and 2FA.
- **Dashboard Metrics**: Displays user count, active subscriptions, vault usage, monthly revenue, and protection score chart.
- **Notifications**: In-app notification panel and email alerts.
- **Admin Functions**: Admin dashboard for user growth, churn rate, API request logs, and audit logs.
- **Audit Logging**: Records API calls (user, route, method, payload, IP, timestamp).

---

## Tech Stack

- **Backend**: Node.js, TypeScript, Express (or Next.js API), Prisma ORM, PostgreSQL
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, SWR, Recharts
- **AI Services**: OpenAI GPT-4 Turbo (SSE streaming)
- **Billing**: Stripe Checkout & Webhooks
- **Storage**: AWS S3 (pre-signed URLs)
- **Email/SMS**: Nodemailer, SendGrid/Mailgun, Twilio
- **Monitoring**: Sentry, LogRocket
- **Version Control & CI/CD**: Git, Vercel (frontend), Heroku/AWS (backend)

---

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or Yarn
- PostgreSQL (v12+)
- AWS CLI (for S3)
- Stripe CLI (for webhook testing)

---

### Cloning & Installing Dependencies

```bash
git clone git@github.com:your-org/legacy-pro.git
cd legacy-pro

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### Environment Variables

#### Backend

1. Copy `.env.example` to `.env`:
   ```bash
   cd backend
   cp .env.example .env
   ```
2. Update `backend/.env`:
   - `DATABASE_URL`: Local Postgres URI (e.g., `postgresql://postgres:password@localhost:5432/legacy_pro_dev`)
   - `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
   - OAuth (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_ID`, `GITHUB_SECRET`)
   - Stripe (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`)
   - `OPENAI_API_KEY`
   - AWS (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET_NAME`)
   - Email (`EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`, `SENDGRID_API_KEY`, `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`)
   - Twilio (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`)
   - Plaid (`PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENV`)
   - Monitoring (`SENTRY_DSN`, `LOGROCKET_APP_ID`)
   - `FRONTEND_URL` (e.g., `http://localhost:3000`)

#### Frontend

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cd ../frontend
   cp .env.local.example .env.local
   ```
2. Update `frontend/.env.local`:
   - `NEXT_PUBLIC_API_URL`: `http://localhost:4000/api`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
   - OAuth client IDs
   - `OPENAI_API_KEY`
   - AWS (if uploading directly from client)
   - Monitoring (`SENTRY_DSN`, `LOGROCKET_APP_ID`)
   - `FIREBASE_SERVICE_ACCOUNT_KEY_JSON` (if needed)

> **Important:** Do not commit credentials. Use environment variables in CI/CD for production.

---

### Database Setup

1. Ensure PostgreSQL is running locally.
2. Run Prisma migrations:
   ```bash
   cd backend
   npx prisma migrate dev --name init
   npx prisma generate
   ```
3. (Optional) Seed data if available:
   ```bash
   npm run seed
   ```
4. Verify tables via Prisma Studio:
   ```bash
   npx prisma studio
   ```

---

### Running Locally

1. **Backend** (http://localhost:4000):
   ```bash
   cd backend
   npm run dev
   ```
2. **Frontend** (http://localhost:3000):
   ```bash
   cd ../frontend
   npm run dev
   ```
3. Access the application at `http://localhost:3000`.

---

## Backend Structure & Implementation

### Prisma & Database Models

- **Prisma schema**: `backend/prisma/schema.prisma` defines:
  - `User`, `Subscription`, `Trust`, `TrustClause`, `Entity`, `VaultFolder`, `VaultFile`, `LegacyLetter`, `Notification`, `AuditLog`.
- Run `npx prisma generate` after schema changes.

### Configuration & Utilities

- **`src/config/index.ts`**: Loads environment variables into a `config` object.
- **`src/config/stripe.ts`**: Exports a configured Stripe client.
- **`src/config/plaid.ts`, `sms.ts`, `email.ts`**: Initialize Plaid, Twilio, and Nodemailer.
- **`src/lib/prisma.ts`**: Singleton PrismaClient instance.
- **`src/utils/ApiError.ts`**: Custom error class with status codes.
- **`src/utils/logger.ts`**: Winston logger for structured logging.

### Authentication & Authorization

- **Password Hashing**: Use `bcrypt` to hash passwords in `/src/routes/auth.ts`.
- **JWT Middleware**: `src/middleware/auth.ts` verifies tokens and attaches `req.user`.
- **Rate Limiting**: `src/middleware/rateLimiter.ts` sets request limits.
- **CSRF Protection**: `src/middleware/csrfProtection.ts` applies `csurf` to routes.
- **Audit Logging**: `src/middleware/auditLogger.ts` logs API calls to `AuditLog`.
- **Error Handling**: `src/middleware/errorHandler.ts` captures and responds to errors.

### Subscriptions & Stripe Integration

- **GET `/api/subscriptions/plans`**: Returns available plans.
- **POST `/api/subscriptions/subscribe`**: Creates a Stripe Checkout session.
- **POST `/api/stripe-webhook`**: Handles `checkout.session.completed`, `invoice.payment_failed`, `customer.subscription.deleted` events; updates `Subscription` status in the database.

### Trust Builder Service

- **GET `/api/trusts/clauses?state=<STATE_CODE>`**: Returns optional clauses for the specified state.
- **POST `/api/trusts/generate`**: Initiates SSE streaming of AI-generated trust document:
  - Creates a `Trust` record.
  - Streams chunks of text from OpenAI GPT-4 Turbo.
  - Generates PDF and uploads to S3 under `trusts/<trustId>.pdf`.
  - Updates `Trust.documentKey`.
- **GET `/api/trusts/:trustId/download`**: Returns a pre-signed S3 URL for downloading the PDF.

### Entity Builder Service

- **POST `/api/entities/generate`**: Similar to Trust Builder, creates an `Entity` record, streams AI output for formation document, generates PDF, uploads to S3 under `entities/<entityId>.pdf`.
- **GET `/api/entities/:entityId/download`**: Returns pre-signed S3 URL for entity PDF.

### Smart Vault (File Storage)

- **Data Models**:
  - `VaultFolder`: id, userId, name, parentId (nullable), children relation.
  - `VaultFile`: id, folderId, name, key (S3 key), fileType, sizeMB.
- **POST `/api/vault/folders`**: Creates a new folder (with optional `parentId`) for the authenticated user.
- **GET `/api/vault/folders`**: Retrieves nested folder tree for the user.
- **POST `/api/vault/upload-url`**: Returns a pre-signed S3 `PUT` URL given `{ folderId, fileName, fileType }`.
- **POST `/api/vault/confirm-upload`**: After client uploads to S3, confirm upload:
  - Call `headObject` to get `ContentLength`.
  - Create `VaultFile` record with `sizeMB`.
- **GET `/api/vault/folders/:folderId/documents`**: Lists files in a folder; returns pre-signed S3 `GET` URLs.
- **DELETE `/api/vault/documents/:fileId`**: Deletes file from S3 and removes `VaultFile` record.

**Preset Folder Tree Functionality**:  
On user onboarding, you can create a default folder structure (e.g., `Estate Documents`, with subfolders `Trusts`, `Entities`, `Letters`) by calling the `POST /api/vault/folders` endpoint multiple times to seed the folder tree.

### Ava AI Advisor

- **POST `/api/ai/advisor`**: Uses SSE to stream AI responses:
  - Accepts `{ prompt }`.
  - Streams from OpenAI GPT-4 Turbo.
  - Returns text chunks until `complete` event.

### Legacy Letter Service

- **POST `/api/legacy-letter/generate`**: Streams AI-generated letter:
  - Accepts `{ recipientName, relationship, message }`.
  - Creates a `LegacyLetter` record.
  - Streams AI output, generates PDF, uploads to S3 under `legacy-letters/<letterId>.pdf`.
  - Updates `LegacyLetter.documentKey`.
- **GET `/api/legacy-letter/:legacyLetterId/download`**: Returns pre-signed S3 URL for letter PDF.

### Protection Score Calculation

- **GET `/api/protection-score`**: Calculates a score out of 100 based on:
  - 2FA enabled (20 points).
  - Number of vault files (up to 30 points).
  - Presence of trusts (25 points) and entities (25 points).
  - Returns `{ score }`.

### Dashboard & Admin APIs

- **GET `/api/dashboard/metrics`**: Returns:
  - `totalUsers`, `totalSubscriptions`, `totalVaultStorageMB`, `monthlyRevenue`.
- **GET `/api/admin/metrics`**: Requires `ADMIN` role; returns:
  - `userGrowth` array (date, count).
  - `churnRate`, `activeUsers`, `archivedUsers`, `apiRequestsLast24H`.

### Notifications & Audit Logs

- **GET `/api/notifications`**: Retrieves all notifications for user.
- **PATCH `/api/notifications/:notificationId/read`**: Marks a notification as read.
- **Audit Logging**: Middleware records each API call to `AuditLog`.

---

## Frontend Structure & Implementation

### Next.js Configuration

- **`next.config.js`**: Sets `images.domains` for S3 and GitHub avatars; exposes `NEXT_PUBLIC_API_URL`.
- **`tailwind.config.js`**: Configures Tailwind CSS.
- **`postcss.config.js`**: Sets up PostCSS with Tailwind and autoprefixer.
- **`tsconfig.json`**: TypeScript configuration.

---

### Layout, Navbar & Footer

- **`components/layout/Layout.tsx`**: Wraps content with `Navbar` and `Footer`.
- **`components/navbar/Navbar.tsx`**: Links to main sections; shows Sign In/Sign Out.
- **`components/footer/Footer.tsx`**: Shows copyright, Terms, Privacy, Help links.

---

### Authentication & NextAuth

- **Install**: `next-auth`, `@next-auth/prisma-adapter`.
- **`pages/api/auth/[...nextauth].ts`**: Configures providers (Google, GitHub), Prisma adapter, JWT sessions.
- **Session Handling**: Use `useSession()` in components; protect pages by redirecting unauthenticated users.

---

### Subscriptions UI

- **`components/subscriptions/PlanCard.tsx`**: Displays plan details and Subscribe button.
- **`pages/subscriptions.tsx`**: Fetches plans via `GET /subscriptions/plans`, renders `PlanCard`s, handles `POST /subscriptions/subscribe` to redirect to Stripe Checkout.

---

### Trust Builder UI

- **`hooks/useSSE.ts`**: Custom hook to connect to SSE endpoints and capture streaming data.
- **`components/trust-builder/ClauseMatrix.tsx`**: Fetches clauses for selected state; allows selecting multiple clauses.
- **`components/trust-builder/TrustBuilder.tsx`**:
  - Multi-step form:
    1. Select trust type and state.
    2. Select clauses.
    3. Initiate generation via `POST /trusts/generate`, handle SSE, display streaming text.
    4. Download PDF via `GET /trusts/:trustId/download`.

---

### Entity Builder UI

- **`components/entity-builder/EntityBuilder.tsx`**:
  - Multi-step:
    1. Enter entity name and type.
    2. Generate document via `POST /entities/generate`, handle SSE, display streaming text.
    3. Download PDF via `GET /entities/:entityId/download`.

---

### Smart Vault UI

- **Preset Folder Tree**: On user onboarding, call `POST /vault/folders` to create default folders: `Estate Documents`, `Trusts`, `Entities`, `Legacy Letters`.
- **`components/smart-vault/FolderTree.tsx`**: Fetches folder tree via `GET /vault/folders`; renders nested structure; allows folder selection.
- **`components/smart-vault/UploadBox.tsx`**: Uploads files:
  1. `POST /vault/upload-url` to get pre-signed `PUT` URL.
  2. `PUT` file to S3.
  3. `POST /vault/confirm-upload` to record in DB.
- **`components/smart-vault/DocumentPreview.tsx`**: Lists files in selected folder via `GET /vault/folders/:folderId/documents`; displays download link (pre-signed `GET` URL) and Delete button (`DELETE /vault/documents/:fileId`).

---

### Ava AI Advisor UI

- **`components/ai-advisor/AvaChat.tsx`**:
  - Text input and message list.
  - Sends prompt via `POST /ai/advisor` with `Accept: text/event-stream`.
  - Streams AI response chunks, appends to message list.

---

### Legacy Letter UI

- **`components/legacy-letter/LegacyLetter.tsx`**:
  - Input fields: Recipient Name, Relationship, Message.
  - On “Generate Letter”:
    1. `POST /legacy-letter/generate` with SSE.
    2. Streams AI-generated text.
    3. Extract `legacyLetterId` and display Download link (`GET /legacy-letter/:id/download`).

---

### Protection Score Chart

- **`components/protection-score/ProtectionScoreChart.tsx`**:
  - Fetches historical data via `GET /protection-score/historical`.
  - Uses Recharts `LineChart` to plot score over time (domain 0–100).

---

### Dashboard Pages

- **`components/dashboard/SummaryCard.tsx`**: Displays a title and value.
- **`components/dashboard/Dashboard.tsx`**:
  - Fetches metrics via `GET /dashboard/metrics`.
  - Renders `SummaryCard` for Users, Subscriptions, Vault Usage.
  - Renders `ProtectionScoreChart`.
  - Displays Monthly Revenue.
- **`pages/dashboard/index.tsx`**: Renders `Dashboard` component.

---

### Notifications Panel

- **`components/notifications/NotificationList.tsx`**:
  - Fetches notifications via `GET /notifications`.
  - Displays list with “Mark Read” button for unread notifications (`PATCH /notifications/:id/read`).
- **`pages/notifications/index.tsx`**: Renders `NotificationList`.

---

### Admin Dashboard UI

- **`components/admin/AdminDashboard.tsx`**:
  - Fetches admin metrics via `GET /admin/metrics`.
  - Displays cards for Active Users, Archived Users, Churn Rate, API Requests.
  - Plots User Growth over time with Recharts `LineChart`.
- **`pages/admin/dashboard.tsx`**: Renders `AdminDashboard`.

---

## Testing & QA

### Unit & Integration Tests

- **Jest** (backend and frontend).
- **SuperTest** for backend route testing (e.g., `/auth/signup`, `/trusts/clauses`).
- **React Testing Library** for frontend component tests (e.g., Trust Builder form renders correctly).

### Manual Smoke Tests

1. **User Auth**: Register, login, logout, profile.
2. **Subscriptions**: View plans, complete Stripe Checkout (use test cards), webhook handling.
3. **Trust Builder**: Select type/state/clauses, stream document, download PDF, verify S3 upload.
4. **Entity Builder**: Generate entity doc, download PDF, verify S3 upload.
5. **Smart Vault**: Create folders, upload files, list/download files, delete files.
6. **Ava Advisor**: Chat prompt, SSE streaming responses.
7. **Legacy Letter**: Generate letter, stream text, download PDF, verify S3 upload.
8. **Protection Score**: View current score, verify calculation logic.
9. **Dashboard Metrics**: Verify displayed metrics match database.
10. **Notifications**: Receive notifications (e.g., subscription renewals), mark as read.
11. **Admin Dashboard**: View user growth, churn rate, API request logs.

### Stripe CLI & Webhooks

- **Stripe CLI**:
  ```bash
  stripe listen --forward-to localhost:4000/api/stripe-webhook
  ```
- Trigger events:
  - `stripe trigger checkout.session.completed`
  - `stripe trigger invoice.payment_failed`
- Verify database `Subscription` updates.

---

## Deployment

### Backend Deployment

1. Choose hosting: Heroku, AWS EC2/Elastic Beanstalk, DigitalOcean, etc.
2. Set environment variables on host (use `backend/.env.example`).
3. Build & Migrate:
   - If using TypeScript build:
     ```bash
     npm ci
     npm run build
     npx prisma migrate deploy
     npx prisma generate
     npm run start
     ```
   - If JavaScript:
     ```bash
     npm ci
     npx prisma migrate deploy
     npx prisma generate
     npm run start
     ```
4. Configure Stripe Webhook (Production mode):
   ```
   https://api.yourdomain.com/stripe-webhook
   ```
5. Verify endpoint responses and S3 connectivity.

### Frontend Deployment

1. Host on Vercel (recommended). Connect `frontend/` directory.
2. Set environment variables in Vercel using `frontend/.env.local.example`.
   - `NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api`
3. Vercel auto-runs `npm install && npm run build`.
4. (Optional) Add `vercel.json` for rewrites:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/(.*)",
         "destination": "https://api.yourdomain.com/api/$1"
       }
     ]
   }
   ```
5. Verify app at `https://app.yourdomain.com`.

### DNS & SSL Configuration

1. DNS Records:
   - `app.yourdomain.com` → Vercel
   - `api.yourdomain.com` → Backend host
2. SSL Certificates:
   - Vercel provisions Let’s Encrypt for frontend.
   - Backend host provisions SSL automatically (Heroku/AWS) or via Let’s Encrypt integration.

---

## Maintenance & Monitoring

### Error Logging & Performance Monitoring

- **Sentry**: Ensure `SENTRY_DSN` for frontend and backend. Monitor errors in dashboard.
- **LogRocket**: Confirm sessions recorded in LogRocket for frontend errors and user behavior.

### Database Backups & S3 Lifecycle

- **PostgreSQL**:
  - Use AWS RDS automated snapshots or `pg_dump` cron jobs.
- **S3 Lifecycle**:
  - Transition objects older than 90 days to Glacier.
  - Delete objects older than 365 days based on retention policy.

### Dependency Updates & Security Audits

- Run `npm audit` regularly in both `backend/` and `frontend/`.
- Update dependencies quarterly or upon high-severity vulnerabilities.
- Conduct automated scans (e.g., OWASP ZAP) bi-annually.

---

## Appendices

### Appendix A: API Reference Summary

Key endpoints:

- **Auth**:
  - `POST /api/auth/signup`
  - `POST /api/auth/signin`
  - `GET /api/users/me`
  - `PATCH /api/users/me`

- **Subscriptions**:
  - `GET /api/subscriptions/plans`
  - `POST /api/subscriptions/subscribe`
  - `POST /api/stripe-webhook`

- **Trust Builder**:
  - `GET /api/trusts/clauses?state=<STATE>`
  - `POST /api/trusts/generate` (SSE)
  - `GET /api/trusts/:trustId/download`

- **Entity Builder**:
  - `POST /api/entities/generate` (SSE)
  - `GET /api/entities/:entityId/download`

- **Smart Vault**:
  - `POST /api/vault/folders`
  - `GET /api/vault/folders`
  - `POST /api/vault/upload-url`
  - `POST /api/vault/confirm-upload`
  - `GET /api/vault/folders/:folderId/documents`
  - `DELETE /api/vault/documents/:fileId`

- **Ava AI Advisor**:
  - `POST /api/ai/advisor` (SSE)

- **Legacy Letter**:
  - `POST /api/legacy-letter/generate` (SSE)
  - `GET /api/legacy-letter/:legacyLetterId/download`

- **Protection Score**:
  - `GET /api/protection-score`

- **Dashboard**:
  - `GET /api/dashboard/metrics`

- **Admin**:
  - `GET /api/admin/metrics`

- **Notifications**:
  - `GET /api/notifications`
  - `PATCH /api/notifications/:notificationId/read`

---

### Appendix B: Prisma Schema Overview

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id                String       @id @default(uuid())
  email             String       @unique
  name              String
  passwordHash      String
  locale            String       @default("en-US")
  role              Role         @default(USER)
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  subscriptions     Subscription[]
  trusts            Trust[]
  entities          Entity[]
  vaultFolders      VaultFolder[]
  vaultFiles        VaultFile[]
  notifications     Notification[]
  legacyLetters     LegacyLetter[]
  auditLogs         AuditLog[]
}

enum Role {
  USER
  ADMIN
}

model Subscription {
  id                     String   @id @default(uuid())
  user                   User     @relation(fields: [userId], references: [id])
  userId                 String
  stripeCustomerId       String   @unique
  stripeSubscriptionId   String   @unique
  status                 String
  planId                 String
  startedAt              DateTime @default(now())
  lastPaymentDate        DateTime
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt
}

model Trust {
  id                 String        @id @default(uuid())
  user               User          @relation(fields: [userId], references: [id])
  userId             String
  type               String
  stateOfResidence   String
  documentKey        String?
  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt

  clauses            TrustClause[]
}

model TrustClause {
  id        String   @id @default(uuid())
  trust     Trust    @relation(fields: [trustId], references: [id])
  trustId   String
  title     String
  text      String
}

model Entity {
  id                 String   @id @default(uuid())
  user               User     @relation(fields: [userId], references: [id])
  userId             String
  name               String
  type               String
  documentKey        String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}

model VaultFolder {
  id        String        @id @default(uuid())
  user      User          @relation(fields: [userId], references: [id])
  userId    String
  name      String
  parentId  String?
  children  VaultFolder[] @relation("FolderChildren", fields: [id], references: [parentId])
  files     VaultFile[]
  createdAt DateTime      @default(now())
}

model VaultFile {
  id         String   @id @default(uuid())
  folder     VaultFolder @relation(fields: [folderId], references: [id])
  folderId   String
  name       String
  key        String   @unique
  fileType   String
  sizeMB     Float
  createdAt  DateTime @default(now())
}

model LegacyLetter {
  id            String   @id @default(uuid())
  user          User     @relation(fields: [userId], references: [id])
  userId        String
  recipientName String
  relationship  String
  documentKey   String?
  createdAt     DateTime @default(now())
}

model Notification {
  id         String   @id @default(uuid())
  user       User     @relation(fields: [userId], references: [id])
  userId     String
  message    String
  read       Boolean  @default(false)
  createdAt  DateTime @default(now())
}

model AuditLog {
  id        String   @id @default(uuid())
  user      User?    @relation(fields: [userId], references: [id])
  userId    String?
  route     String
  method    String
  payload   String
  ip        String
  timestamp DateTime @default(now())
}
```

---

### Appendix C: Useful Prisma Queries

#### Fetch All Users (Admin)
```ts
import prisma from "../lib/prisma";

export async function getAllUsers() {
  return prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
}
```

#### Create a Vault Folder
```ts
import prisma from "../lib/prisma";

export async function createVaultFolder(userId: string, name: string, parentId?: string) {
  return prisma.vaultFolder.create({
    data: { userId, name, parentId: parentId || null },
  });
}
```

#### Record a File After Upload
```ts
import prisma from "../lib/prisma";

export async function recordVaultFile(
  folderId: string,
  name: string,
  key: string,
  fileType: string,
  sizeInBytes: number
) {
  const sizeMB = sizeInBytes / (1024 * 1024);
  return prisma.vaultFile.create({
    data: { folderId, name, key, fileType, sizeMB },
  });
}
```

#### Mark Notification as Read
```ts
import prisma from "../lib/prisma";

export async function markNotificationRead(notificationId: string) {
  return prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
}
```

#### Add Clause to Trust
```ts
import prisma from "../lib/prisma";

export async function addClauseToTrust(trustId: string, title: string, text: string) {
  return prisma.trustClause.create({
    data: { trustId, title, text },
  });
}
```

#### Fetch Dashboard Metrics
```ts
import prisma from "../lib/prisma";

export async function getDashboardMetrics() {
  const totalUsers = await prisma.user.count();
  const totalSubscriptions = await prisma.subscription.count({ where: { status: "active" } });
  const vaultAggregate = await prisma.vaultFile.aggregate({ _sum: { sizeMB: true } });
  const totalVaultStorageMB = vaultAggregate._sum.sizeMB || 0;

  const revenueAggregate = await prisma.subscription.aggregate({
    _sum: { priceCents: true },
    where: {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });
  const monthlyRevenue = (revenueAggregate._sum.priceCents || 0) / 100;

  return { totalUsers, totalSubscriptions, totalVaultStorageMB, monthlyRevenue };
}
```

---

## Summary

This README provides comprehensive information on setting up, running, and maintaining **Legacy Pro V6.7** with full feature coverage, including Smart Vault preset folder tree, AI-powered document generation, subscriptions, and admin functionality. For additional details, review the codebase, API reference, and Prisma schema.
