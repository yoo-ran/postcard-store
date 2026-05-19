# 🗺️ Postcard Store

A production-grade full-stack ecommerce store for buying and sending postcards — built to demonstrate modern web development practices across frontend, backend, cloud infrastructure, security, and AI integration.

> **Live demo:** [postcard-store.vercel.app](https://postcard-store.vercel.app) &nbsp;|&nbsp; **Built by:** [Yoo-Ran](https://github.com/yoo-ran)

---

## ✨ Features

- 🛍️ **Product catalogue** — browsable postcard grid with category filtering
- 🤖 **AI-powered recommender** — describe what you're looking for in plain English and get matched postcards (Anthropic API + Zod-validated JSON output)
- 🔐 **Authentication** — email/password and Google OAuth via NextAuth.js v5
- 💳 **Stripe payments** — hosted checkout with webhook signature verification and idempotency handling
- 📦 **Order management** — full order history per user, real-time status updates
- 📧 **Order confirmation emails** — triggered via AWS SES on payment success
- 🛡️ **Security hardened** — AWS WAF, CSP headers, rate limiting, input validation, secrets management

---

## 🧱 Tech stack

### Frontend

| Tech                    | Purpose                     |
| ----------------------- | --------------------------- |
| Next.js 14 (App Router) | SSR, routing, API routes    |
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

## 🏗️ Architecture overview

```
Browser
  │
  ▼
Vercel (Next.js 14 App Router)
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

## 🔒 Security decisions

**Why webhook signature verification?**
Without it, any HTTP request could fake a payment success event and trigger order fulfilment without payment. `stripe.webhooks.constructEvent()` verifies the HMAC-SHA256 signature on every webhook — unsigned requests are rejected with a 400.

**Why AWS WAF?**
Malicious requests (SQLi, XSS, bad bots) are blocked at the CloudFront edge before they reach the application layer. Defence in depth — Prisma's parameterised queries also prevent SQLi, but WAF adds a second independent layer.

**Why AWS Secrets Manager over .env in production?**
Environment variables in deployment configs can be leaked via logs or misconfigured CI pipelines. Secrets Manager injects values at runtime via the AWS SDK — they never appear in config files or source code.

**Why Zod on AI output?**
The Anthropic API response is treated as untrusted data. Every response is validated against a Zod schema before any product ID touches the database — hallucinated or malformed IDs are caught and rejected gracefully.

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

## 🚀 Local setup

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

## 🧪 Tests

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e
```

---

## 📁 Project structure

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
│   └── ai/              # AI Recommender component
├── lib/                 # Prisma, Stripe, Anthropic, AWS singletons
├── schemas/             # Zod schemas shared across frontend + API
├── store/               # Zustand cart store
└── types/               # Shared TypeScript types
```

---

## 💡 Key engineering decisions

| Decision                         | Why                                                                        |
| -------------------------------- | -------------------------------------------------------------------------- |
| Next.js over plain React         | SSR for SEO on product pages; API routes remove need for separate backend  |
| Prisma over raw SQL              | Auto-generates TypeScript types from schema — zero manual type writing     |
| AWS RDS over Supabase            | Intentional — learn VPC config, security groups, and connection management |
| Stripe Checkout over custom form | PCI-DSS compliance out of the box; never handle raw card data              |
| Zod for AI output                | LLM responses are untrusted — validate before any DB interaction           |
| `--rebase` Git strategy          | Clean linear history; no merge commits cluttering the log                  |

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
