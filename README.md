# VISUALIZE Sports - Amazon System

Professional inventory management and sales analytics system for VISUALIZE Sports golf products on Amazon.

## Quick Start

```bash
# Clone and install
git clone https://github.com/[username]/visualize-amazon.git
cd visualize-amazon
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Run locally
npm run dev
```

Visit `http://localhost:3000`

## What This Does

- **Sales Analytics**: Track revenue, margins, and trends across ASIN portfolio
- **Inventory Management**: Monitor stock levels and reorder points
- **Amazon API Integration**: Real-time sync with Selling Partner API
- **Data Backup**: Automated daily backups of sales and inventory data
- **Reporting**: Generate sales reports and forecasts

## Architecture

```
visualize-amazon/
├── docs/                 # Documentation
├── src/
│   ├── api/             # API routes (Amazon sync, backups)
│   ├── lib/             # Core logic (data sync, calculations)
│   └── components/      # React components (dashboards, tables)
├── config/              # Configuration files
├── scripts/             # Automation scripts
└── .env.example         # Configuration template
```

See `docs/PROJECT_STRUCTURE.md` for complete file organization.

## Configuration

1. **Get Amazon Credentials**: See `docs/API.md` for SP-API setup
2. **Environment Variables**: Copy `.env.example` to `.env.local` and fill in credentials
3. **Database** (optional): Configure Supabase if using cloud storage

See `docs/SETUP.md` for detailed setup instructions.

## Development

```bash
npm run dev              # Start development server
npm run build           # Build for production
npm run lint            # Run linter
npm run sync            # Manual data sync (dev only)
```

## Deployment

Deploy to Vercel with one click or use git push:

```bash
# Vercel
vercel

# GitHub + Vercel integration
git push origin main
```

See `docs/DEPLOYMENT.md` for complete deployment guide.

## Data Management

### Automatic Sync
- Amazon data syncs every night at 2 AM (UTC) via Vercel cron jobs
- Backups run weekly on Sundays at 3 AM (UTC)

### Manual Sync
```bash
npm run sync            # Pull latest Amazon data
npm run backup          # Create backup now
```

See `docs/API.md` for API integration details.

## Support & Troubleshooting

- Check `docs/SETUP.md` for common setup issues
- Review logs in `logs/` directory
- See `docs/API.md` for Amazon API troubleshooting

## Tech Stack

- **Framework**: Next.js 14 (React)
- **Database**: Supabase (PostgreSQL) - optional
- **APIs**: Amazon Selling Partner API
- **Deployment**: Vercel
- **Language**: TypeScript (recommended)

## License

Private project for VISUALIZE Sports.

---

**Questions?** Check the docs/ folder or update this README as you learn.
