# PROJECT_HANDOFF: College Discovery Platform

## 1. Deployment Guide

### Required Environment Variables
Create a `.env` file in the root directory:
```bash
DATABASE_URL="postgresql://user:pass@host:port/dbname?sslmode=require"
JWT_SECRET="your-very-secure-secret-key"
NODE_ENV="production"
```

### Database Setup
1. **Sync Schema**: `npx prisma db push`
2. **Seed Verified Data**: `npx tsx prisma/seed.ts`
3. **Enrich Demo Data**: `npx tsx scripts/enrich-demo-data.ts`
4. **Final Cleanup**: `npx tsx scripts/cleanup-duplicates.ts`

### Build & Start
```bash
npm install
npm run build
npm run start
```

### Recommended Hosting
- **Frontend**: Vercel (Optimized for Next.js)
- **Database**: Neon (Serverless PostgreSQL with explicit Prisma adapter support)

---

## 2. Architecture Summary

- **Frontend**: Next.js 15 (App Router), TypeScript, React 19, Vanilla CSS.
- **Backend**: Next.js Route Handlers with Service-Oriented Logic.
- **ORM**: Prisma 7.8 with `@prisma/adapter-pg` for advanced connection pooling.
- **Auth Flow**: 
  1. Client sends credentials via `POST /api/auth/login`.
  2. Server verifies via `AuthService` (Bcrypt comparison).
  3. Server issues JWT signed with `JWT_SECRET`.
  4. Client stores JWT in `localStorage` and uses `authHelper` for reactive state updates.
- **Search Engine**: Dynamic query builder in `CollegeService` utilizing PostgreSQL partial name matching and multiple metadata filters.

---

## 3. API Documentation

### Authentication
- `POST /api/auth/register`: Register new user.
- `POST /api/auth/login`: Authenticate and receive JWT.

### Colleges (Public)
- `GET /api/colleges`: List/Search colleges (supports `search`, `city`, `state`, `sortBy`, `minFees`, etc.).
- `GET /api/colleges/[id]`: Retrieve full institutional profile.
- `GET /api/colleges/compare?ids=id1,id2`: side-by-side comparison data.
- `GET /api/colleges/recommendations`: Curated lists of top-rated and best-value colleges.

### User (Protected - Requires Bearer Token)
- `GET /api/user/saved`: List user's watchlist.
- `POST /api/user/saved`: Add college to watchlist.

### Discussions (Community)
- `GET /api/discussions`: List all threads.
- `GET /api/discussions/[id]`: View thread and answers.
- `POST /api/discussions/create`: Start a new thread.
- `POST /api/discussions/answer`: Post a response.

---

## 4. 5-Minute Demo Walkthrough

1. **Onboarding**: Navigate to `/register`, create an account, and observe the instant redirect to `/login`.
2. **Authentication**: Log in and watch the Navigation bar update from "Login" to "Watchlist" without a page refresh.
3. **Discovery**: Type "Indian" in the search box; results filter in real-time. Apply a "Sort by Fees" filter to see Tier-2 institutions.
4. **Transparency**: Hover over the `DEMO_DATA` badge on a result to see the provenance label.
5. **Comparison**: Click "Add Queue" on 3 colleges; click "RUN_ANALYTICS" to see the side-by-side technical breakdown.
6. **Community**: Navigate to "Community," click a thread, and post an answer. Refresh to see it persisted.
7. **Persistence**: Refresh the page to demonstrate that the session and comparison queue remain active.

---

## 5. Project Submission Highlights

### Technical Challenges Solved
- **Connection Pooling**: Implemented the Prisma Singleton pattern to prevent `ECONNRESET` errors in worker-based environments.
- **Hydration Resilience**: Resolved React 19 hydration crashes caused by non-deterministic server-side date rendering.
- **Mobile Brutalism**: Overhauled rigid desktop-only CSS to a responsive Tailwind-based layout supporting devices down to 320px.

### Key Engineering Decisions
- **Service-Transport Separation**: Logic is isolated from API routes, enabling easy validation and maintenance.
- **Data Status Strategy**: Implemented a row-level `DataStatus` enum to allow prototype demonstration while maintaining 100% data transparency.
- **Fail-Fast Security**: Enforced environment-level validation for sensitive credentials.
