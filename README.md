# National Academic Index: College Discovery Platform

A professional, brutalist-inspired platform for college discovery, admissions forecasting, and community discussion.

##  Key Features

- **Institutional Database**: Advanced search for 100+ colleges with tokenized keyword matching (e.g., searching "IIT Kanpur" or "Madras").
- **Admission Forecaster**: Intelligent prediction tool based on national rank and budget constraints, with strict institutional domain matching (e.g., Engineering vs. Medical).
- **Comparison Engine**: Side-by-side technical breakdown of institutional performance metrics.
- **Community Intelligence**: Peer-to-peer Q&A system with reactive threading and real-time responses.
- **Responsive Branding**: High-contrast, brutalist UI designed for optimal clarity on desktop and mobile viewports (down to 320px).

##  Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, React 19, Tailwind CSS.
- **Backend**: Next.js Route Handlers with Service-Oriented Architecture.
- **Data**: Prisma ORM with PostgreSQL (Neon).
- **Security**: JWT-based session management and Bcrypt password hashing.

##  Getting Started

### 1. Configure Environment
Create a `.env` file in the root directory:
```bash
DATABASE_URL="your_postgresql_url"
JWT_SECRET="your_secret_key"
```

### 2. Install & Build
```bash
npm install
npm run build
```

### 3. Run System
```bash
npm run dev
```

##  Validation & Maintenance
The project includes a robust validation suite to ensure long-term stability:
- **System Health**: `npx tsx scripts/validate-system.ts`
- **Data Deduplication**: `npx tsx scripts/cleanup-duplicates.ts`
- **Demo Data Enrichment**: `npx tsx scripts/enrich-demo-data.ts`

---
*Developed with a focus on connection pool stability, hydration resilience, and mobile-first brutalist design.*
