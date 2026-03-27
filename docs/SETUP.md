# SETUP.md - Getting Started with VISUALIZE Amazon

Complete step-by-step setup guide for local development and production deployment.

## Prerequisites

- **Node.js** 18+ and npm
- **Git** for version control
- **Amazon seller account** with Selling Partner API access
- **Text editor** (VS Code recommended)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/[username]/visualize-amazon.git
cd visualize-amazon
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
# Copy template
cp .env.example .env.local

# Edit with your credentials
nano .env.local
# or use your editor (VS Code, etc.)
```

**Required variables:**
- `AMAZON_SELLING_PARTNER_API_KEY`
- `AMAZON_SELLING_PARTNER_API_SECRET`
- `AMAZON_REFRESH_TOKEN`
- `AMAZON_SELLER_ID`

See `API.md` for how to obtain these credentials.

### 4. Test Local Development

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Database Setup (Optional)

If using Supabase for data storage:

### 1. Create Supabase Project

- Visit [supabase.com](https://supabase.com)
- Create new project
- Copy connection credentials to `.env.local`

### 2. Run Database Migrations

```bash
npm run migrate
```

This creates tables for:
- `sales` - Daily sales data from Amazon
- `inventory` - Current stock levels
- `asin_metadata` - Product information
- `sync_logs` - API sync history

## Amazon API Configuration

See `docs/API.md` for:
- Setting up Selling Partner API access
- Obtaining OAuth credentials
- Testing API connectivity
- Troubleshooting common errors

## Manual Data Sync

Test the sync process locally:

```bash
npm run sync
```

Expected output:
```
[INFO] Starting Amazon data sync...
[INFO] Fetched 45 orders from last 30 days
[INFO] Updated inventory for 12 ASINs
[INFO] Sync completed in 2.3s
```

## Vercel Secrets Setup

Before deploying to Vercel, configure environment secrets:

```bash
vercel env add AMAZON_SELLING_PARTNER_API_KEY
vercel env add AMAZON_SELLING_PARTNER_API_SECRET
vercel env add AMAZON_REFRESH_TOKEN
vercel env add AMAZON_SELLER_ID
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

Or use Vercel dashboard:
1. Project Settings → Environment Variables
2. Add each variable from `.env.example`

## Testing

```bash
# Run tests
npm run test

# Run with coverage
npm run test -- --coverage
```

## Troubleshooting

### Port 3000 Already in Use
```bash
# Use different port
npm run dev -- -p 3001
```

### Amazon API Errors
See `docs/API.md` for common error codes and solutions.

### Database Connection Failed
- Verify Supabase URL and keys in `.env.local`
- Check network connectivity
- Verify firewall rules if running locally

### Sync Not Running
- Check `logs/sync.log` for errors
- Verify Amazon credentials are valid
- Ensure scheduled sync is enabled in Vercel

## Next Steps

1. Read `docs/API.md` to understand Amazon integration
2. Review `docs/PROJECT_STRUCTURE.md` for file organization
3. Check `docs/DEPLOYMENT.md` for production deployment
4. Start building features in `src/`

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/add-inventory-alerts

# Make changes, commit
git add .
git commit -m "Add inventory low-stock alerts"

# Push to GitHub
git push origin feature/add-inventory-alerts

# Create Pull Request on GitHub
```

## Common Commands

```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Run production build locally
npm run lint             # Check code quality
npm run sync             # Manual Amazon data sync
npm run backup           # Create manual backup
npm test                 # Run test suite
```

---

**Stuck?** Check `docs/API.md` for Amazon-specific issues or review error logs in `logs/`.
