# PROJECT_STRUCTURE.md - Complete File Organization

Full guide to the VISUALIZE Amazon project structure and where everything goes.

## Directory Layout

```
visualize-amazon/
│
├── docs/
│   ├── README.md                    # This file - overview
│   ├── SETUP.md                     # Getting started guide
│   ├── API.md                       # Amazon SP-API integration
│   ├── DEPLOYMENT.md                # Production deployment
│   └── PROJECT_STRUCTURE.md         # File organization (this file)
│
├── src/
│   ├── api/                         # API routes
│   │   ├── sync/
│   │   │   └── amazon.ts            # Amazon data sync endpoint
│   │   ├── backup/
│   │   │   └── run.ts               # Backup execution endpoint
│   │   └── health.ts                # Health check endpoint
│   │
│   ├── lib/                         # Core business logic
│   │   ├── amazon/
│   │   │   ├── client.ts            # Amazon API client
│   │   │   ├── auth.ts              # OAuth token management
│   │   │   └── parsers.ts           # Response parsing
│   │   │
│   │   ├── sync/
│   │   │   ├── orders.ts            # Orders sync logic
│   │   │   ├── inventory.ts         # Inventory sync logic
│   │   │   └── runner.ts            # Orchestrate sync
│   │   │
│   │   ├── database/
│   │   │   ├── supabase.ts          # Supabase client
│   │   │   ├── queries.ts           # Database queries
│   │   │   └── migrations/          # Schema migrations
│   │   │
│   │   ├── backup/
│   │   │   ├── create.ts            # Create backups
│   │   │   └── restore.ts           # Restore from backup
│   │   │
│   │   └── analytics/
│   │       ├── calculations.ts      # Revenue, margin calcs
│   │       └── forecasting.ts       # Sales forecasting
│   │
│   └── components/                  # React components
│       ├── dashboard/
│       │   ├── SalesChart.tsx       # Sales visualization
│       │   ├── InventoryStatus.tsx  # Stock levels
│       │   └── MetricsCards.tsx     # KPI cards
│       │
│       ├── tables/
│       │   ├── OrdersTable.tsx      # Orders list
│       │   ├── InventoryTable.tsx   # Inventory table
│       │   └── ASINList.tsx         # Product list
│       │
│       ├── common/
│       │   ├── Header.tsx           # App header
│       │   ├── Sidebar.tsx          # Navigation
│       │   └── LoadingSpinner.tsx   # Loading state
│       │
│       └── pages/                   # Full pages
│           ├── Dashboard.tsx        # Main dashboard
│           ├── Inventory.tsx        # Inventory manager
│           ├── Orders.tsx           # Orders view
│           └── Settings.tsx         # Configuration
│
├── config/
│   ├── constants.ts                 # App constants
│   ├── amazon-config.ts             # Amazon API config
│   └── database-config.ts           # Database config
│
├── scripts/
│   ├── sync-amazon-data.js          # Manual sync script
│   ├── schedule-sync.js             # Schedule cron jobs
│   ├── backup-data.js               # Manual backup
│   ├── restore-backup.js            # Restore backup
│   ├── test-amazon-api.js           # Test API connection
│   └── generate-reports.js          # Report generation
│
├── public/
│   ├── favicon.ico
│   └── logo.png
│
├── tests/
│   ├── unit/
│   │   ├── sync.test.ts
│   │   ├── calculations.test.ts
│   │   └── backup.test.ts
│   │
│   └── integration/
│       └── amazon-api.test.ts
│
├── logs/                            # Application logs (git-ignored)
│   ├── sync.log
│   ├── error.log
│   └── cron.log
│
├── backups/                         # Data backups (git-ignored)
│   ├── 2024-03-26-backup.json
│   └── 2024-03-19-backup.json
│
├── .env.example                     # Environment variables template
├── .env.local                       # Local development env (git-ignored)
├── .env.production                  # Production env (git-ignored)
├── .gitignore                       # Git ignore rules
├── package.json                     # Dependencies
├── package-lock.json                # Dependency lock file
├── tsconfig.json                    # TypeScript config
├── next.config.js                   # Next.js config
├── vercel.json                      # Vercel deployment config
├── jest.config.js                   # Testing config
├── README.md                        # Project overview
└── .github/
    └── workflows/
        ├── test.yml                 # Run tests on PR
        └── deploy.yml               # Deploy on merge to main
```

## Core Modules Explained

### `/src/api` - API Routes

**What:** Next.js API endpoints that handle HTTP requests

**Key endpoints:**
- `GET /api/health` - Health check
- `POST /api/sync/amazon` - Trigger data sync
- `POST /api/backup/run` - Trigger backup
- `GET /api/orders` - Fetch orders data
- `GET /api/inventory` - Fetch inventory data

**Usage:** Called by Vercel cron jobs, frontend, or manual requests

### `/src/lib` - Core Logic

**What:** Business logic and utilities, separated by feature

**Submodules:**
- **amazon/** - Amazon API integration
- **sync/** - Data sync orchestration
- **database/** - Database operations
- **backup/** - Backup/restore logic
- **analytics/** - Calculations and forecasting

**Usage:** Imported by API routes and React components

### `/src/components` - React Components

**What:** Reusable React UI components

**Organization:**
- **dashboard/** - Dashboard-specific components
- **tables/** - Data table components
- **common/** - Shared components (Header, Sidebar, etc.)
- **pages/** - Full page components

**Usage:** Compose pages in Next.js app router

### `/config` - Configuration

**What:** Static configuration values

**Avoid putting here:**
- Secrets (use environment variables instead)
- Feature flags (use database or env vars)
- User-specific settings (use database)

### `/scripts` - Standalone Scripts

**What:** Node.js scripts for manual operations

**Usage:**
```bash
npm run sync          # Runs sync-amazon-data.js
npm run backup        # Runs backup-data.js
npm run restore       # Runs restore-backup.js
```

Used for development and manual operations. Vercel cron jobs call API endpoints instead.

## Database Schema

If using Supabase, the schema includes:

### `sales` Table
```sql
CREATE TABLE sales (
  id UUID PRIMARY KEY,
  asin VARCHAR(10),
  order_id VARCHAR(32),
  sku VARCHAR(100),
  quantity INT,
  revenue DECIMAL(10, 2),
  marketplace VARCHAR(20),
  date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### `inventory` Table
```sql
CREATE TABLE inventory (
  id UUID PRIMARY KEY,
  asin VARCHAR(10),
  sku VARCHAR(100),
  title VARCHAR(255),
  qty_total INT,
  qty_afn INT,
  qty_mfn INT,
  reorder_point INT,
  last_synced TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### `asin_metadata` Table
```sql
CREATE TABLE asin_metadata (
  id UUID PRIMARY KEY,
  asin VARCHAR(10) UNIQUE,
  title VARCHAR(255),
  category VARCHAR(100),
  price DECIMAL(10, 2),
  ratings DECIMAL(2, 1),
  reviews INT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### `sync_logs` Table
```sql
CREATE TABLE sync_logs (
  id UUID PRIMARY KEY,
  sync_type VARCHAR(20),
  status VARCHAR(20),
  records_processed INT,
  duration_ms INT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Data Flow

### Automatic Sync (Vercel Cron)

```
Vercel Cron Job (2 AM UTC)
    ↓
POST /api/sync/amazon
    ↓
src/lib/sync/runner.ts
    ↓
Amazon SP-API
    ↓
Process Orders & Inventory
    ↓
Store in Database or JSON Files
    ↓
Log sync result
```

### Manual Data Access

```
React Component
    ↓
GET /api/orders (or /api/inventory)
    ↓
src/lib/database/queries.ts
    ↓
Supabase or Local JSON
    ↓
Return data to frontend
    ↓
Display in table/chart
```

## File Naming Conventions

**TypeScript files:**
- `camelCase.ts` for utilities and logic
- `PascalCase.tsx` for React components
- `*.test.ts` for tests (colocated with source)

**Route files:**
- `route.ts` for Next.js API routes
- `page.tsx` for Next.js page components

**Examples:**
- `src/lib/amazon/client.ts` ✓
- `src/components/dashboard/SalesChart.tsx` ✓
- `src/api/sync/amazon.ts` ✓

## Environment Variables by File

**Loaded in:**
- `.env.local` - Development (git-ignored)
- `.env.production` - Production (git-ignored)
- `vercel.json` - Vercel cron config (git-tracked)

**Accessed in code via:**
```typescript
// Next.js environment variables
process.env.AMAZON_SELLING_PARTNER_API_KEY
process.env.NEXT_PUBLIC_SUPABASE_URL
```

## Development Workflow

```
1. Create feature branch
   git checkout -b feature/new-feature

2. Develop in /src directory
   - Add API routes in /src/api
   - Add logic in /src/lib
   - Add components in /src/components
   - Add tests in /tests

3. Test locally
   npm run dev
   npm test

4. Commit and push
   git commit -m "feat: description"
   git push origin feature/new-feature

5. Create PR on GitHub
   - Add description
   - Link issues
   - Request review

6. Merge to main
   - Vercel auto-deploys
   - GitHub Actions run tests
   - Live in production
```

## Git Structure

**Protected branches:**
- `main` - Production code only
- `develop` - Next release preparation (optional)

**Branch naming:**
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code improvements

## Ignored Files/Folders

These are in `.gitignore`:
- `node_modules/` - Dependencies
- `.env` / `.env.local` - Secrets
- `.next/` - Build artifacts
- `dist/` - Output directory
- `logs/` - Application logs
- `backups/` - Data backups
- `.DS_Store` - macOS files
- `Thumbs.db` - Windows files

## Storage Options

### Option 1: Supabase (Recommended for Production)
- Managed PostgreSQL database
- Automatic backups
- Real-time subscriptions
- Easy scaling

### Option 2: Local JSON Files (Development)
- No setup required
- Data stored in `backups/` folder
- Simple for testing
- Not suitable for production

### Option 3: Self-Hosted PostgreSQL
- Full control
- More setup required
- Self-hosted backups
- Suitable for enterprise

## Adding New Features

### To add a new API endpoint:

1. Create route: `src/api/endpoint-name/route.ts`
2. Add logic: `src/lib/feature/logic.ts`
3. Import and use in route
4. Add tests: `tests/unit/feature.test.ts`
5. Document in API.md

### To add a new React page:

1. Create component: `src/components/pages/PageName.tsx`
2. Add any sub-components in `src/components/pages/`
3. Create route: `app/page-name/page.tsx`
4. Update navigation in `src/components/common/Sidebar.tsx`
5. Add tests: `tests/unit/PageName.test.ts`

## Performance Considerations

**Large datasets:**
- Implement pagination in tables
- Use database indexes on frequently-filtered columns
- Cache calculated metrics (recalculate daily)

**Frequent API calls:**
- Implement rate limiting
- Use exponential backoff
- Cache responses when possible

**Database queries:**
- Always include LIMIT for table queries
- Use WHERE clauses to filter early
- Consider denormalization for aggregates

---

**Questions?** Check specific documentation files or review code examples in the project.
