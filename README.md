# 🗺️ Postcard Store

A production-grade full-stack ecommerce store for buying and sending postcards — built to demonstrate modern web development practices across frontend, backend, cloud infrastructure, security, testing, and AI integration.

> **Live demo:** [postcard-store.vercel.app](https://postcard-store.vercel.app/)
> **Built by:** [Yoo-Ran](https://github.com/yoo-ran)

---

## Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Local Setup](#-local-setup)
- [Authentication](#-authentication)
- [Payments](#-payments)
- [AWS Architecture](#-aws-architecture)
- [AI Recommender](#-ai-recommender)
- [Security Decisions](#-security-decisions)
- [Testing](#-testing)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Key Engineering Decisions](#-key-engineering-decisions)
- [Screenshots](#-screenshots)

---

## ✨ Features

|     | Feature                                                                                                                             |
| --- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 🛍️  | **Product catalogue** — browsable postcard grid with category filtering                                                             |
| 🤖  | **AI-powered recommender** — describe what you're looking for and get matched postcards (Anthropic API + Zod-validated JSON output) |
| 🔐  | **Authentication** — email/password and Google OAuth via NextAuth.js v5                                                             |
| 💳  | **Stripe payments** — hosted checkout with webhook signature verification and idempotency handling                                  |
| 📦  | **Order management** — full order history per user, real-time status updates                                                        |
| 📧  | **Order confirmation emails** — triggered via AWS SES on payment success                                                            |
| 🛡️  | **Security hardened** — AWS WAF, CSP headers, rate limiting, input validation, secrets management                                   |
| 🧪  | **Fully tested** — 44 unit tests (Vitest) + 21 end-to-end tests (Playwright) running in CI on every PR                              |

---

## 🧱 Tech Stack

### Frontend

| Tech                    | Purpose                     |
| ----------------------- | --------------------------- |
| Next.js 15 (App Router) | SSR, routing, API routes    |
| TypeScript              | End-to-end type safety      |
| Tailwind CSS            | Responsive styling          |
| Zustand                 | Typed cart state management |
| React Hook Form + Zod   | Type-safe form validation   |

### Backend & Database

| Tech                  | Purpose                                       |
| --------------------- | --------------------------------------------- |
| Next.js API Routes    | Serverless backend                            |
| Prisma ORM            | Type-safe DB queries + migrations             |
| Prisma Accelerate     | Connection pooling for serverless deployments |
| PostgreSQL on AWS RDS | Managed relational database                   |
| NextAuth.js v5        | Auth with JWT sessions                        |
| Stripe                | Payments + webhook handling                   |
| Upstash Redis         | Serverless rate limiting                      |

### Cloud (AWS)

| Service          | Purpose                                             |
| ---------------- | --------------------------------------------------- |
| RDS (PostgreSQL) | Managed DB with automated backups                   |
| S3               | Postcard image storage                              |
| CloudFront       | CDN for fast global image delivery                  |
| WAF              | Web Application Firewall — blocks SQLi, XSS at edge |
| SES              | Transactional order confirmation emails             |
| Secrets Manager  | Secure runtime secret injection                     |

### AI

| Tech                   | Purpose                                    |
| ---------------------- | ------------------------------------------ |
| Anthropic API (Claude) | AI postcard recommender                    |
| Zod                    | Validates AI JSON output before DB queries |

### DevOps & Testing

| Tech               | Purpose                                                |
| ------------------ | ------------------------------------------------------ |
| Vercel             | App hosting + edge deployment                          |
| GitHub Actions     | CI/CD — lint, type-check, unit + E2E tests on every PR |
| Vitest + happy-dom | Unit tests — cart store, Zod schemas, utilities        |
| Playwright         | End-to-end tests — cart, auth, and recommender flows   |

---

## 🏗️ Architecture Overview

```
Browser
  │
  ▼
Vercel (Next.js 15 App Router)
  ├── Server Components  →  Prisma Accelerate  →  AWS RDS (PostgreSQL)
  ├── API Routes         →  Stripe / Anthropic API / AWS SES / Upstash Redis
  └── Static Assets      →  AWS S3 + CloudFront CDN
                                    │
                              AWS WAF (edge firewall)
                                    │
                           AWS Secrets Manager
                        (injects secrets at runtime)
```

---

## 🚀 Local Setup

### Prerequisites

- Node.js 20+
- PostgreSQL (local or [Supabase](https://supabase.com) free tier)
- Stripe account (test mode)
- Anthropic API key

### 1. Clone and install

```bash
git clone https://github.com/yoo-ran/postcard-store.git
cd postcard-store
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local` — see `.env.example` for the full list. Locally, `DATABASE_URL` is a plain `postgresql://` connection string.

### 3. Set up the database

```bash
npx prisma migrate dev
npx prisma db seed
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Authentication

### Login Options

| Method       | Description                                                              |
| ------------ | ------------------------------------------------------------------------ |
| Credentials  | Email and password — password hashed with bcrypt before storing in RDS   |
| Google OAuth | One-click sign in via Google — credentials stored in AWS Secrets Manager |

Both providers are handled by **NextAuth.js v5** with JWT sessions. The session token is stored in a secure HTTP-only cookie (`authjs.session-token`).

### How It Works

1. User registers with email + password → password is hashed with bcrypt (`$2b$` prefix) and stored in RDS — plain text is never stored
2. User signs in → NextAuth validates credentials, issues a signed JWT session token
3. Session is available across the app via `useSession` (enabled by `SessionProvider` wrapping the root layout)
4. The Navbar reads session state and shows the user's name and "Sign out" when authenticated

### Protected Routes

The following routes are protected by `src/middleware.ts`. Unauthenticated users are redirected to `/login?callbackUrl=<original-path>`:

| Route         | Protection         |
| ------------- | ------------------ |
| `/checkout`   | Authenticated only |
| `/checkout/*` | Authenticated only |
| `/account/*`  | Authenticated only |
| `/orders/*`   | Authenticated only |

Public routes (`/`, `/shop`, `/login`, `/register`) are unaffected by the middleware.

### Environment Variables

| Variable             | Description                                                |
| -------------------- | ---------------------------------------------------------- |
| `AUTH_SECRET`        | Secret used to sign and verify NextAuth JWT tokens         |
| `NEXTAUTH_SECRET`    | Legacy NextAuth secret (kept for compatibility)            |
| `NEXTAUTH_URL`       | Base URL of the app (e.g. `http://localhost:3000`)         |
| `AUTH_GOOGLE_ID`     | Google OAuth client ID — stored in AWS Secrets Manager     |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret — stored in AWS Secrets Manager |

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project → Enable the **Google+ API**
3. Create OAuth 2.0 credentials → add `http://localhost:3000/api/auth/callback/google` as an authorised redirect URI
4. Copy the client ID and secret into AWS Secrets Manager under the secret name `postcard-store-google-oauth` with keys `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`

---

## 💳 Payments

This project uses **Stripe Checkout** for payments — the user is redirected to a Stripe-hosted page to complete the transaction. Raw card data never touches the server.

### Checkout Flow

1. User clicks **"Checkout"** → the client calls `POST /api/checkout`
2. The API route creates a Stripe Checkout Session with the cart items and redirects the user to Stripe's hosted checkout page
3. On success, Stripe redirects the user back to `/orders/success?session_id=...`
4. Stripe sends a `checkout.session.completed` webhook event to `POST /api/webhook`
5. The webhook handler verifies the signature, marks the order as **paid** in the database, and triggers the confirmation email via AWS SES

### Webhook Security

Stripe signs every webhook with a secret so the server can verify the request is genuinely from Stripe and not a spoofed request.

The handler uses `stripe.webhooks.constructEvent()` to verify the signature on every incoming event. Requests with an invalid or missing signature are rejected with a `400`.

```ts
const event = stripe.webhooks.constructEvent(
  rawBody,
  req.headers['stripe-signature'],
  process.env.STRIPE_WEBHOOK_SECRET,
);
```

> **Important:** the raw request body must be used for signature verification — not the parsed JSON. The webhook route opts out of Next.js body parsing for this reason.

### Running Payments Locally

**1. Install the Stripe CLI**

```bash
brew install stripe/stripe-cli/stripe
stripe login
```

**2. Forward webhooks to your local server**

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

The CLI will print a webhook signing secret starting with `whsec_` — copy it into `.env.local` as `STRIPE_WEBHOOK_SECRET`.

**3. Trigger a test event**

```bash
stripe trigger checkout.session.completed
```

**4. Use Stripe's test card**

| Field  | Value                 |
| ------ | --------------------- |
| Number | `4242 4242 4242 4242` |
| Expiry | Any future date       |
| CVC    | Any 3 digits          |

### Environment Variables

| Variable                        | Description                                                              |
| ------------------------------- | ------------------------------------------------------------------------ |
| `STRIPE_SECRET_KEY`             | Stripe secret API key — starts with `sk_test_` in test mode              |
| `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` | Stripe publishable key — starts with `pk_test_` in test mode             |
| `STRIPE_WEBHOOK_SECRET`         | Webhook signing secret from Stripe CLI (`whsec_...`) or Stripe Dashboard |

> See `.env.example` for the full list. Never commit real Stripe keys to source control.

---

## ☁️ AWS Architecture

### Diagram

```mermaid
flowchart LR
    User["👤 User / Browser"]
    Next["⚡ Next.js App\n(Vercel)"]
    CF["☁️ CloudFront\nCDN"]
    S3["🪣 S3 Bucket\nImage Storage"]
    RDS["🗄️ RDS PostgreSQL\nDatabase"]

    User -->|"Page request"| Next
    Next -->|"Prisma query"| RDS
    Next -->|"Image URL"| CF
    CF -->|"Cache miss → fetch"| S3
    CF -->|"Serve image"| User
```

### Services

**🪣 S3 — Image Storage**
Stores the postcard images under the `postcards/` prefix. Not accessed directly by the browser — CloudFront acts as the intermediary, caching and serving assets from the nearest edge location.

**☁️ CloudFront — CDN**
Sits in front of S3 and delivers images faster by serving from AWS edge locations closest to the user. The app constructs all image URLs using `NEXT_PUBLIC_CLOUDFRONT_URL`.

**🗄️ RDS PostgreSQL — Database**
Managed PostgreSQL instance (ca-central-1) storing all product, cart, and order data. Connected via Prisma — through Prisma Accelerate in production for connection pooling, and directly via `postgresql://` locally.

### Environment Variables

| Variable                     | Description                                                                                        |
| ---------------------------- | -------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_CLOUDFRONT_URL` | CloudFront URL including `/postcards` prefix — used to construct image URLs on the client          |
| `DATABASE_URL`               | Prisma connection string — `prisma://` (Accelerate) in production, `postgresql://` everywhere else |
| `DIRECT_DATABASE_URL`        | Raw RDS `postgresql://` connection string — used for migrations, bypassing the Accelerate pool     |

> See `.env.example` for the full list of required environment variables.

---

## 🤖 AI Recommender

Users describe what they're looking for in natural language and the recommender returns matched postcards from the catalogue.

### How It Works

1. User submits a query (e.g. "something funny for my mum's birthday")
2. `POST /api/recommend` injects the full product catalogue into the Claude system prompt — a lightweight Retrieval-Augmented Generation (RAG) pattern that grounds the model in real data rather than relying on training knowledge
3. Claude returns a JSON array of `{ productId, reason }` objects
4. The response is validated with Zod — any response that doesn't match the expected schema is discarded and returns an empty array
5. Each `productId` is cross-checked against the database — hallucinated IDs that don't exist are filtered out before any DB query runs
6. Matched products are returned to the UI

### Failure Handling

| Failure                           | Behaviour                                           |
| --------------------------------- | --------------------------------------------------- |
| AI returns malformed JSON         | Zod parse fails → empty array returned, never a 500 |
| AI hallucinates a product ID      | Filtered out before DB query                        |
| Anthropic API times out or errors | Outer catch returns empty array                     |
| Rate limit exceeded               | 429 returned — UI shows fallback message            |

### Environment Variables

| Variable                   | Description                           |
| -------------------------- | ------------------------------------- |
| `ANTHROPIC_API_KEY`        | Anthropic API key for Claude access   |
| `UPSTASH_REDIS_REST_URL`   | Upstash Redis URL for rate limiting   |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token for rate limiting |

---

## 🔒 Security Decisions

**Why webhook signature verification?**
Without it, any HTTP request could fake a payment success event and trigger order fulfilment without payment. `stripe.webhooks.constructEvent()` verifies the HMAC-SHA256 signature on every webhook — unsigned requests are rejected with a 400.

**Why AWS WAF?**
Malicious requests (SQLi, XSS, bad bots) are blocked at the CloudFront edge before they reach the application layer. Defence in depth — Prisma's parameterised queries also prevent SQLi, but WAF adds a second independent layer.

**Why AWS Secrets Manager over .env in production?**
Environment variables in deployment configs can be leaked via logs or misconfigured CI pipelines. Secrets Manager injects values at runtime via the AWS SDK — they never appear in config files or source code.

**Why bcrypt for password hashing?**
bcrypt is a slow, adaptive hashing algorithm designed for passwords. Unlike MD5 or SHA-256, its cost factor can be increased over time as hardware gets faster — making brute-force attacks impractical. Passwords are never stored or logged in plain text.

**Why Zod on AI output?**
The Anthropic API response is treated as untrusted data. Every response is validated against a Zod schema before any product ID touches the database — hallucinated or malformed IDs are caught and rejected gracefully.

**Why rate limit the AI endpoint?**
Anthropic API calls cost money per token — without rate limiting a single user could run up significant costs in minutes. `/api/recommend` is limited to 10 requests per IP per hour via Upstash Redis (sliding window). Exceeding the limit returns a 429 with `x-ratelimit-remaining: 0`.

**Why set security headers (CSP)?**
Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, and Referrer-Policy headers are set on every response via Next.js config. Prevents clickjacking, MIME sniffing, and XSS injection from third-party scripts.

---

## 🧪 Testing

**65 automated tests** run on every pull request — 44 unit tests and 21 end-to-end tests.

### Unit Tests — Vitest (44 tests)

| Area               | What's covered                                                       |
| ------------------ | -------------------------------------------------------------------- |
| Zustand cart store | Add/remove/update items, quantity logic, totals, cents-based pricing |
| Zod schemas        | Valid and invalid inputs across auth, checkout, and AI schemas       |
| `formatPrice`      | Cents → formatted currency display                                   |

Runs in a **happy-dom** environment (chosen over jsdom to avoid a CJS/ESM conflict).

```bash
npm run test
```

### End-to-End Tests — Playwright (21 tests)

| Flow        | What's covered                                                        |
| ----------- | --------------------------------------------------------------------- |
| Cart        | Add to cart, update quantity, remove, cart persistence                |
| Auth        | Register, login (credentials), protected route redirects              |
| Recommender | Submit a query, render matched products, handle empty/error responses |

Playwright starts the app automatically via its `webServer` config, so a single command runs the full suite:

```bash
npm run test:e2e
```

**Testing notes:**

- **Rate limiting in tests** — all Playwright workers share the same fallback IP, so they would collectively exhaust the real Upstash rate-limit bucket. The `/api/recommend` route accepts a `PLAYWRIGHT_TEST=true` env bypass so E2E runs aren't throttled.
- **WebKit compatibility** — React controlled inputs don't reliably fire `onChange` with Playwright's `fill()` in WebKit; tests use `click()` + `pressSequentially({ delay: 50 })` instead.

---

## ⚙️ CI/CD Pipeline

Every pull request runs a full pipeline via **GitHub Actions**:

```
PR opened
  │
  ├── Lint (ESLint)
  ├── Type-check (tsc --noEmit)
  ├── Unit tests (Vitest)
  └── E2E tests (Playwright)
        │
        └── against an ephemeral PostgreSQL service container
            (postgresql://postgres:postgres@localhost:5432/test_db)
```

- The CI database is an **ephemeral Postgres container** — migrated and seeded fresh on every run, so tests never touch RDS
- All secrets (Stripe test keys, Anthropic API key, auth secrets) are injected via **GitHub Actions secrets**
- A PR cannot merge until every check passes

---

## 🚢 Deployment

The app is deployed on **Vercel** with **Prisma Accelerate** for connection pooling.

### Why Prisma Accelerate?

Serverless functions open a new database connection per invocation — under load this exhausts RDS's connection limit. Accelerate sits between Vercel and RDS as a global connection pool, so functions share pooled connections instead of opening their own.

### Build Configuration

Vercel uses a dedicated build script:

```json
"vercel-build": "prisma generate --no-engine && next build"
```

The `--no-engine` flag is required because the bundled native query engine rejects `prisma://` URLs at build time — in production, queries route through Accelerate's engine instead.

### Environment Strategy

| Environment       | `DATABASE_URL`                      | `DIRECT_DATABASE_URL`                |
| ----------------- | ----------------------------------- | ------------------------------------ |
| Vercel Production | `prisma://` (Accelerate)            | Raw RDS `postgresql://` (migrations) |
| CI                | Ephemeral container `postgresql://` | Same as `DATABASE_URL`               |
| Local             | Plain `postgresql://`               | Same as `DATABASE_URL`               |

### Production Gotchas Solved

- **Hardcoded base URL** — the homepage originally fetched products from `http://localhost:3000`, which failed silently in production. All internal fetches now use `process.env.NEXT_PUBLIC_APP_URL`.
- **Silent AI failures** — an incorrect model ID and a leftover debug system prompt caused the recommender to fail without errors in production; both were corrected and covered by E2E tests.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (shop)/          # Product listing, product detail, cart
│   ├── (auth)/          # Login, register
│   ├── (account)/       # Checkout, order history (protected)
│   └── api/             # API routes — products, auth, checkout, webhook, recommend
├── components/
│   ├── ui/              # Reusable UI components
│   ├── shop/            # ProductCard, CartDrawer
│   ├── layout/          # Navbar, Footer
│   └── ai/              # AI Recommender component
├── lib/                 # Prisma, Stripe, Anthropic, AWS singletons
├── middleware.ts        # Route protection — redirects unauthenticated users
├── schemas/             # Zod schemas shared across frontend + API
├── store/               # Zustand cart store
└── types/               # Shared TypeScript types

tests/                   # Vitest unit tests
e2e/                     # Playwright end-to-end tests
.github/workflows/       # CI pipeline
```

---

## 💡 Key Engineering Decisions

| Decision                         | Why                                                                        |
| -------------------------------- | -------------------------------------------------------------------------- |
| Next.js over plain React         | SSR for SEO on product pages; API routes remove need for separate backend  |
| Prisma over raw SQL              | Auto-generates TypeScript types from schema — zero manual type writing     |
| Prisma Accelerate in production  | Serverless functions exhaust RDS connections — pooling solves it           |
| AWS RDS over Supabase            | Intentional — learn VPC config, security groups, and connection management |
| Stripe Checkout over custom form | PCI-DSS compliance out of the box; never handle raw card data              |
| Prices stored in cents (cart)    | Integer arithmetic avoids floating-point rounding errors on money          |
| Zod for AI output                | LLM responses are untrusted — validate before any DB interaction           |
| bcrypt for passwords             | Slow adaptive hashing — brute-force resistant, never stores plain text     |
| Middleware for route protection  | Enforces auth at the Edge before any page renders — no client-side gaps    |
| happy-dom over jsdom             | jsdom hit a CJS/ESM conflict with the toolchain; happy-dom is also faster  |
| Ephemeral Postgres in CI         | Tests run against a fresh, isolated DB — never touch production data       |
| `--rebase` Git strategy          | Clean linear history; no merge commits cluttering the log                  |

---

## 📸 Screenshots

![Homepage](screenshots/homepage.png)
![Product Detail](screenshots/productDetail.png)
![AI Recommender](screenshots/productDetail.png)
![Cart](screenshots/cart.png)
![Checkout](screenshots/productDetail.png)
![Stripe](screenshots/productDetail.png)
![Orders](screenshots/productDetail.png)
![Login](screenshots/login.png)
![Register](screenshots/register.png)

---

## 📬 Contact

Built by **Yoo-Ran** · [GitHub](https://github.com/yoo-ran) · [LinkedIn](https://www.linkedin.com/in/yooran)

---

_This project was built as a portfolio piece to demonstrate full-stack web development, cloud infrastructure, payment integration, automated testing, and AI feature development._
