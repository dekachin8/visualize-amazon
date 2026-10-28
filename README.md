# VISUALIZE Sports - Amazon Dashboard

A Next.js dashboard for monitoring and managing VISUALIZE Sports golf accessories business on Amazon FBA.

## Features

- 📊 **Sales Dashboard** - Revenue trends, units sold, top SKUs
- 📦 **Inventory Management** - Stock levels, restock recommendations
- 📈 **Marketing Insights** - PPC campaign performance, ACOS tracking
- 🤖 **AI Council** - Nightly analysis and prioritized action items

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: Vercel

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
visualize-amazon/
├── app/                    # Next.js 14 App Router
│   ├── dashboard/          # Sales dashboard page
│   ├── inventory/          # Inventory management page
│   ├── marketing/          # Marketing insights page
│   ├── council/            # AI Council recommendations page
│   ├── api/                # API routes (for SP-API integration)
│   ├── layout.tsx          # Root layout with navigation
│   ├── page.tsx            # Root redirect to /dashboard
│   └── globals.css         # Global styles + Tailwind
├── components/             # Reusable UI components
│   ├── Navigation.tsx      # Top navigation bar
│   ├── StatCard.tsx        # Metric display cards
│   ├── DataTable.tsx       # Generic table component
│   └── AlertCard.tsx       # Alert/notification component
├── lib/                    # Utilities and data
│   └── mockData.ts         # Mock data (replace with SP-API later)
├── docs/                   # Documentation
│   ├── DASHBOARD_DESIGN.md # Design documentation
│   └── COMPONENT_GUIDE.md  # Component usage guide
├── tailwind.config.js      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── next.config.js          # Next.js configuration
```

## Current Status

✅ **Completed**:
- Project scaffolding
- All 4 main pages with mock data
- Reusable component library
- Responsive design (desktop + mobile)
- Documentation (design + component guide)

🔄 **Next Steps**:
1. Integrate Amazon SP-API
2. Replace mock data with live data
3. Add date range selectors
4. Implement actual AI Council logic
5. Add user authentication
6. Deploy to Vercel

## Pages

### Sales Dashboard (`/dashboard`)
- Summary stats (revenue, units, orders, conversion)
- 30-day revenue trend chart
- 30-day units sold chart
- Top 5 performing SKUs table

### Inventory (`/inventory`)
- Critical stock alerts (< 10 days remaining)
- Restock recommendations with quantities
- Full SKU inventory table
- Color-coded urgency (green/yellow/red)

### Marketing (`/marketing`)
- PPC campaign summary stats
- Spend vs Revenue chart
- ACOS distribution
- Campaign details table
- Performance insights

### AI Council (`/council`)
- Priority summary (high/medium/low)
- Prioritized recommendations by urgency
- Category-based organization
- Actionable next steps

## Mock Data

Currently using mock data from `lib/mockData.ts`:
- 30 days of sales data
- 5 sample SKUs
- 4 PPC campaigns
- 5 AI recommendations

**To integrate real data**: Replace mock data imports with API calls to SP-API endpoints.

## Customization

### Colors

Edit `tailwind.config.js` to change primary color:

```js
colors: {
  primary: {
    500: '#16a34a', // Your brand color
    // ...
  },
}
```

### Navigation

Edit `components/Navigation.tsx` to add/remove pages:

```tsx
const navItems = [
  { href: '/dashboard', label: 'Sales', icon: LayoutDashboard },
  // Add more items
]
```

### Mock Data

Edit `lib/mockData.ts` to change sample data for development.

## Documentation

- **[Design Documentation](docs/DASHBOARD_DESIGN.md)** - UI/UX design, page layouts, responsive strategy
- **[Component Guide](docs/COMPONENT_GUIDE.md)** - How to use and customize components

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

Environment variables needed:
```
AMAZON_SP_API_REFRESH_TOKEN=
AMAZON_SP_API_CLIENT_ID=
AMAZON_SP_API_CLIENT_SECRET=
AMAZON_SELLER_ID=
AMAZON_MARKETPLACE_ID=
```

### Manual Deployment

```bash
npm run build
npm start
```

## Future Enhancements

- [ ] Amazon SP-API integration
- [ ] User authentication
- [ ] Date range filtering
- [ ] Export to CSV/PDF
- [ ] Email alerts for critical issues
- [ ] Keyword tracking
- [ ] Competitor monitoring
- [ ] Mobile app (React Native)

## License

Private - VISUALIZE Sports / JKS International

## Support

For questions or issues, contact: Tim O'Hagan
