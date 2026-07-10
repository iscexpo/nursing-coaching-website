# কর্নিয়া নার্সিং কোচিং ওয়েবসাইট

খুলনার কর্নিয়া নার্সিং কোচিং-এর অফিসিয়াল ওয়েবসাইট — BNMC ভর্তি পরীক্ষা, B.Sc Nursing, কাউন্সিল, ও চাকরি প্রস্তুতির সম্পূর্ণ সমাধান।

## Features

### Public Pages
- **হোম** — Hero, কোর্স, সাফল্য, শিক্ষক, গ্যালারি, যোগাযোগ, FAQ
- **কোর্স** — 6টি কোর্সের বিস্তারিত (ফি, সময়কাল, বিবরণ)
- **ভর্তি** — অনলাইন ভর্তি ফরম + যোগাযোগ তথ্য
- **মডেল টেস্ট** — সাপ্তাহিক পরীক্ষার সময়সূচি
- **নোটিশ** — সর্বশেষ নোটিশ ও আপডেট
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
- **পরীক্ষা** — পরীক্ষা তৈরি, অবস্থা পরিবর্তন
- **প্রশ্নব্যাংক** — MCQ প্রশ্ন তৈরি/সম্পাদনা/মুছুন (6 বিষয়)
- **ফলাফল** — ফলাফল যোগ, বিষয় ফিল্টার
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
- ফোন নম্বর + পাসওয়ার্ড দিয়ে সাইন ইন/সাইন আপ
- OTP যাচাইকরণ
- Role-based access (student / admin)
- Middleware দিয়ে রুট সুরক্ষা

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4, shadcn/ui (base-nova)
- **Auth:** Better Auth + Phone Number plugin
- **Database:** Neon (PostgreSQL) + Drizzle ORM
- **Language:** TypeScript

## Getting Started

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Neon DATABASE_URL and BETTER_AUTH_SECRET

# Push database schema
pnpm drizzle-kit push

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### Create Admin User
```sql
-- After signing up, make the first user an admin:
UPDATE "user" SET role = 'admin' WHERE phone_number = '01XXXXXXXXX';
```

## Project Structure

```
app/
├── page.tsx                 # Homepage
├── layout.tsx               # Root layout (fonts, metadata)
├── courses/page.tsx         # Course listing
├── admission/page.tsx       # Admission form
├── model-test/page.tsx      # Model test schedule
├── notice/page.tsx          # Notice board
├── gallery/page.tsx         # Photo gallery
├── contact/page.tsx         # Contact form + info
├── exam/
│   ├── page.tsx             # Exam listing
│   ├── [id]/page.tsx        # Exam taking (timer, MCQ)
│   └── result/page.tsx      # Exam results + review
├── auth/
│   ├── sign-in/page.tsx     # Phone + password sign-in
│   └── sign-up/page.tsx     # OTP → sign-up flow
├── dashboard/page.tsx       # Student dashboard (7 tabs)
├── admin/page.tsx           # Admin dashboard (10 tabs)
└── api/
    ├── auth/[...all]/       # Better Auth API handler
    ├── courses/             # Course CRUD API
    ├── enrollments/         # Enrollment API
    ├── payments/            # Payment API
    ├── invoices/            # Invoice API
    ├── account/             # Profile + password API
    └── notifications/       # Notification API

components/
├── site-header.tsx          # Sticky header + mobile nav
├── site-footer.tsx          # 4-column footer
├── section-heading.tsx      # Reusable section header
├── floating-whatsapp.tsx    # WhatsApp chat button
├── ui/button.tsx            # shadcn Button
└── sections/                # Homepage sections

lib/
├── site-data.ts             # All site data + question bank
├── auth.ts                  # Better Auth server config
├── auth-client.ts           # Better Auth client
├── permissions.ts           # Role helpers
└── db/
    ├── schema.ts            # Drizzle schema (10 tables)
    └── index.ts             # Neon connection
```

## Database Schema

| Table | Description |
|-------|-------------|
| `user` | Users with role, studentId, phone, profile fields |
| `session` | Auth sessions (7-day expiry) |
| `account` | Auth accounts (credentials) |
| `verification` | Email/phone verification tokens |
| `otp` | OTP codes for phone verification |
| `courses` | Course catalog (CRUD) |
| `enrollments` | Student-course enrollments |
| `payments` | Payment records (bKash/Nagad/cash/bank) |
| `invoices` | Invoice tracking |
| `notifications` | User notifications |

## License

private
