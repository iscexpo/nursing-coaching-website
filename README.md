# ISC Expo - Icon Skill & Career Expo ওয়েবসাইট

খুলনার ISC Expo - Icon Skill & Career Expo-এর অফিসিয়াল ওয়েবসাইট — BNMC ভর্তি পরীক্ষা, B.Sc Nursing, কাউন্সিল, ও চাকরি প্রস্তুতির সম্পূর্ণ সমাধান।

## Features

### Public Pages

- **হোম** — Hero, কোর্স, সাফল্য, শিক্ষক, গ্যালারি, যোগাযোগ, FAQ
- **কোর্স** — কোর্সের বিস্তারিত (ফি, সময়কাল, বিবরণ) — DB থেকে ডায়নামিক
- **ভর্তি** — অনলাইন ভর্তি ফরম + যোগাযোগ তথ্য — DB থেকে কোর্স ড্রপডাউন
- **মডেল টেস্ট** — সাপ্তাহিক পরীক্ষার সময়সূচি — DB থেকে ডায়নামিক
- **নোটিশ** — সর্বশেষ নোটিশ ও আপডেট — DB থেকে ডায়নামিক
- **গ্যালারি** — ছবি গ্যালারি (hover reveal)
- **যোগাযোগ** — যোগাযোগ ফরম + অফিস তথ্য

### Student Dashboard (`/dashboard`)

- **ওভারভিউ** — পরিসংখ্যান, সর্বশেষ ফলাফল/উপস্থিতি, এনরোলমেন্ট
- **আমার কোর্স** — কোর্স ব্রাউজ, এনরোলমেন্ট, এনরোলড কোর্স দেখুন
- **বিলিং ও পেমেন্ট** — bKash/Nagad দিয়ে পেমেন্ট, পেমেন্ট ইতিহাস, ইনভয়েস
- **অ্যাকাউন্ট** — প্রোফাইল সম্পাদনা, পাসওয়ার্ড পরিবর্তন
- **এডমিট কার্ড** — পরীক্ষার্থীর কার্ড (ডাউনলোডযোগ্য)
- **ফলাফল** — স্কোর টেবিল, র‍্যাঙ্ক ব্যাজ, পারফরম্যান্স বার
- **উপস্থিতি** — উপস্থিত/বিলম্বিত/অনুপস্থিত হিসাব

### Admin Dashboard (`/admin`)

- **ওভারভিউ** — পরিসংখ্যান, অপেক্ষমান এনরোলমেন্ট/পেমেন্ট
- **কোর্স** — কোর্স CRUD, ফি, ছাড়, সময়সূচি, সক্রিয়/নিষ্ক্রিয় টগল
- **এনরোলমেন্ট** — অনুমোদন/প্রত্যাখ্যান/সক্রিয়করণ, স্ট্যাটাস ফিল্টার
- **পেমেন্ট** — bKash/Nagad/নগদ পেমেন্ট যাচাইকরণ/প্রত্যাখ্যান
- **ইনভয়েস** — ইনভয়েস তালিকা ও স্ট্যাটাস
- **নোটিশ** — তৈরি/সম্পাদনা/মুছুন
- **পরীক্ষা** — পরীক্ষা তৈরি, অবস্থা পরিবর্তন, সাবমিশন দেখুন
- **প্রশ্নব্যাংক** — MCQ প্রশ্ন তৈরি/সম্পাদনা/মুছুন (6 বিষয়)
- **যোগাযোগ** — শিক্ষার্থীদের যোগাযোগ অনুরোধ, সমাধান
- **নোটিফিকেশন** — শিক্ষার্থীদের নোটিফিকেশন পাঠানো/দেখুন
- **উপস্থিতি** — উপস্থিতি মার্ক, রেকর্ড দেখুন/মুছুন
- **এডমিট কার্ড** — এডমিট কার্ড তৈরি/দেখুন/মুছুন
- **শিক্ষার্থী** — সার্চযোগ্য শিক্ষার্থী তালিকা

### Online Exam System (`/exam`)

- বিষয়ভিত্তিক মডেল টেস্ট (বাংলা, ইংরেজি, পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান, সাধারণ জ্ঞান)
- ১৫ মিনিট টাইমার, অটো-সাবমিট
- প্রশ্ন নেভিগেশন গ্রিড
- ফলাফল: গ্রেড, স্কোর বার, উত্তর পর্যালোচনা

### Payment Gateway

- **bKash** — সেন্ড মানি, ট্রানজেকশন ID ভেরিফিকেশন
- **Nagad** — সেন্ড মানি, ট্রানজেকশন ID ভেরিফিকেশন
- **নগদ** — অ্যাডমিন থেকে সরাসরি যাচাইকরণ
- স্বয়ংক্রিয় ব্যালেন্স আপডেট

### Authentication (Better Auth)

- ইমেইল + পাসওয়ার্ড দিয়ে সাইন ইন/সাইন আপ
- ফোন নম্বর + OTP যাচাইকরণ
- Role-based access (student / admin)
- Middleware দিয়ে রুট সুরক্ষা

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Styling:** Tailwind CSS v4, shadcn/ui (base-nova)
- **Auth:** Better Auth + Phone Number plugin (email/password)
- **Database:** Supabase (PostgreSQL) + Drizzle ORM
- **Language:** TypeScript 5.7
- **Validation:** Zod v4
- **Deployment:** Vercel

## Getting Started

```bash
# Install dependencies
pnpm install --no-frozen-lockfile

# If pnpm reports ignored build scripts:
pnpm approve-builds --all
pnpm install --no-frozen-lockfile

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL and BETTER_AUTH_SECRET

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### Docker

This repository includes a `Dockerfile` and `docker-compose.yml` for local development.

```bash
docker compose up --build
```

Then open `http://localhost:3000`.

Stop containers with:

```bash
docker compose down
```

### Installation Guide

See `docs/installation.md` for the recommended local install workflow and CI compatibility steps.

### GitHub Actions CI

This repo uses `.github/workflows/ci.yml` to run:

- Node 24
- `pnpm approve-builds --all`
- `pnpm install --no-frozen-lockfile`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test -- --coverage`

### Database Migrations & Seed

```bash
# Start dev server (migrations run via API)
pnpm dev

# Run migrations (requires dev server running)
curl -X POST http://localhost:3000/api/admin/migrate \
  -H "Authorization: Bearer seed-admin-2024"

# Seed demo admin user (standalone script)
npx tsx scripts/seed-demo-admin.ts
```

### Demo Admin Credentials

| Field    | Value             |
| -------- | ----------------- |
| Email    | `admin@cornia.co` |
| Password | `Admin123!`       |
| Phone    | `+8801784176442`  |

## Project Structure

```
app/
├── page.tsx                     # Homepage
├── layout.tsx                   # Root layout (fonts, metadata)
├── courses/page.tsx             # Course listing (server component, DB)
├── admission/page.tsx           # Admission form (API-driven)
├── model-test/page.tsx          # Model test schedule
├── notice/page.tsx              # Notice board
├── gallery/page.tsx             # Photo gallery
├── contact/page.tsx             # Contact form + info
├── login/page.tsx               # Email + password sign-in
├── exam/
│   ├── page.tsx                 # Exam listing
│   ├── [id]/page.tsx            # Exam taking (timer, MCQ)
│   └── result/page.tsx          # Exam results + review
├── dashboard/
│   ├── page.tsx                 # Student dashboard (7 tabs)
│   └── components/
│       ├── overview-tab.tsx     # Stats, recent activity
│       ├── course-tab.tsx       # Browse/enroll courses
│       ├── billing-tab.tsx      # Payments & invoices
│       ├── account-tab.tsx      # Profile & password
│       ├── admit-card-tab.tsx   # Admit cards
│       ├── results-tab.tsx      # Exam results
│       └── attendance-tab.tsx   # Attendance records
├── admin/
│   ├── page.tsx                 # Admin dashboard (13 tabs)
│   └── components/
│       ├── overview-tab.tsx     # Stats overview
│       ├── courses-tab.tsx      # Course CRUD
│       ├── enrollments-tab.tsx  # Enrollment management
│       ├── payments-tab.tsx     # Payment verification
│       ├── invoices-tab.tsx     # Invoice tracking
│       ├── notices-tab.tsx      # Notice CRUD
│       ├── exams-tab.tsx        # Exam management
│       ├── questions-tab.tsx    # Question bank
│       ├── contacts-tab.tsx     # Contact inquiries
│       ├── notifications-tab.tsx# Send notifications
│       ├── attendance-tab.tsx   # Attendance management
│       ├── admit-cards-tab.tsx  # Admit card management
│       └── students-tab.tsx     # Student list
└── api/
    ├── auth/[...all]/           # Better Auth API handler
    ├── courses/                 # Course CRUD API
    ├── enrollments/             # Enrollment API
    ├── payments/                # Payment API
    ├── invoices/                # Invoice API
    ├── admission/               # Admission form API
    ├── notices/                 # Notice CRUD API
    ├── exams/                   # Exam API
    ├── exam-submissions/        # Exam submission API
    ├── questions/               # Question bank API
    ├── contact/                 # Contact inquiries API
    ├── notifications/           # Notification API
    ├── attendance/              # Attendance API
    ├── admit-cards/             # Admit card API
    ├── account/                 # Profile + password API
    └── admin/
        ├── migrate/             # DB migration endpoint
        └── seed/                # Admin user seed endpoint

components/
├── site-header.tsx              # Sticky header + mobile nav
├── site-footer.tsx              # 4-column footer
├── section-heading.tsx          # Reusable section header
├── floating-whatsapp.tsx        # WhatsApp chat button
├── ui/button.tsx                # shadcn Button
└── sections/                    # Homepage sections (DB-powered)

lib/
├── site-data.ts                 # Static site data
├── auth.ts                      # Better Auth server config
├── auth-client.ts               # Better Auth client
├── permissions.ts               # Role helpers
├── validations.ts               # Zod schemas for API validation
└── db/
    ├── schema.ts                # Drizzle schema (18 tables)
    ├── index.ts                 # Postgres connection
    └── migrations/              # SQL migration files

scripts/
└── seed-demo-admin.ts           # Standalone admin seed script
```

## Database Schema

| Table               | Description                                       |
| ------------------- | ------------------------------------------------- |
| `user`              | Users with role, studentId, phone, profile fields |
| `session`           | Auth sessions (7-day expiry)                      |
| `account`           | Auth accounts (credentials)                       |
| `verification`      | Email/phone verification tokens                   |
| `otp`               | OTP codes for phone verification                  |
| `courses`           | Course catalog (CRUD)                             |
| `enrollments`       | Student-course enrollments                        |
| `payments`          | Payment records (bKash/Nagad/cash/bank)           |
| `invoices`          | Invoice tracking                                  |
| `notifications`     | User notifications                                |
| `notices`           | Notice board entries                              |
| `exams`             | Model test exams                                  |
| `questions`         | MCQ question bank (6 subjects)                    |
| `exam_submissions`  | Student exam attempts & scores                    |
| `contact_inquiries` | Contact form submissions                          |
| `attendance`        | Student attendance records                        |
| `admit_cards`       | Exam admit cards                                  |

## License

Private
