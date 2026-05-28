# 🗺️ Postcard Store

A production-grade full-stack ecommerce store for buying and sending postcards — built to demonstrate modern web development practices across frontend, backend, cloud infrastructure, security, and AI integration.

> **Live demo:** 🚧 **Coming soon** &nbsp;|&nbsp; **Built by:** [Yoo-Ran](https://github.com/yoo-ran)

---

## Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Local Setup](#-local-setup)
- [Authentication](#-authentication)
- [Payments](#-payments)
- [AWS Architecture](#-aws-architecture)
- [Security Decisions](#-security-decisions)
- [Project Structure](#-project-structure)
- [Key Engineering Decisions](#-key-engineering-decisions)
- [Tests](#-tests)
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

| Tech                  | Purpose                           |
| --------------------- | --------------------------------- |
| Next.js API Routes    | Serverless backend                |
| Prisma ORM            | Type-safe DB queries + migrations |
| PostgreSQL on AWS RDS | Managed relational database       |
| NextAuth.js v5        | Auth with JWT sessions            |
| Stripe                | Payments + webhook handling       |

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

### DevOps

| Tech           | Purpose                                     |
| -------------- | ------------------------------------------- |
| Vercel         | App hosting + edge deployment               |
| GitHub Actions | CI/CD — lint, type-check, tests on every PR |
| Vitest         | Unit tests                                  |
| Playwright     | End-to-end tests                            |

---

## 🏗️ Architecture Overview

```
Browser
  │
  ▼
Vercel (Next.js 15 App Router)
  ├── Server Components  →  AWS RDS (PostgreSQL via Prisma)
  ├── API Routes         →  Stripe / Anthropic API / AWS SES
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

- Node.js 18+
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

Fill in all values in `.env.local` — see `.env.example` for the full list.

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
Stores the 6 postcard images under the `postcards/` prefix. Not accessed directly by the browser — CloudFront acts as the intermediary, caching and serving assets from the nearest edge location.

**☁️ CloudFront — CDN**
Sits in front of S3 and delivers images faster by serving from AWS edge locations closest to the user. The app constructs all image URLs using `NEXT_PUBLIC_CLOUDFRONT_URL`.

**🗄️ RDS PostgreSQL — Database**
Managed PostgreSQL instance storing all product, cart, and order data. Connected via Prisma using `DATABASE_URL`.

### Environment Variables

| Variable                     | Description                                                                                         |
| ---------------------------- | --------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_CLOUDFRONT_URL` | CloudFront URL including `/postcards` prefix — used to construct image URLs on the client           |
| `DATABASE_URL`               | Full PostgreSQL connection string for Prisma. Format: `postgresql://user:password@host:5432/dbname` |

> See `.env.example` for the full list of required environment variables.

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
```

---

## 💡 Key Engineering Decisions

| Decision                         | Why                                                                        |
| -------------------------------- | -------------------------------------------------------------------------- |
| Next.js over plain React         | SSR for SEO on product pages; API routes remove need for separate backend  |
| Prisma over raw SQL              | Auto-generates TypeScript types from schema — zero manual type writing     |
| AWS RDS over Supabase            | Intentional — learn VPC config, security groups, and connection management |
| Stripe Checkout over custom form | PCI-DSS compliance out of the box; never handle raw card data              |
| Zod for AI output                | LLM responses are untrusted — validate before any DB interaction           |
| bcrypt for passwords             | Slow adaptive hashing — brute-force resistant, never stores plain text     |
| Middleware for route protection  | Enforces auth at the Edge before any page renders — no client-side gaps    |
| `--rebase` Git strategy          | Clean linear history; no merge commits cluttering the log                  |

---

## 🧪 Tests

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e
```

---

## 📸 Screenshots

![Homepage](screenshots/homepage.png)
![Cart](screenshots/cart.png)
![Product Detail](screenshots/productDetail.png)
![Login](screenshots/login.png)
![Register](screenshots/register.png)

---

## 📬 Contact

Built by **Yoo-Ran** · [GitHub](https://github.com/yoo-ran) · [LinkedIn](https://www.linkedin.com/in/yooran)

---

_This project was built as a portfolio piece to demonstrate full-stack web development, cloud infrastructure, payment integration, and AI feature development._
