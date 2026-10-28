# VISUALIZE Sports Dashboard - Design Documentation

## Overview

The VISUALIZE Sports Amazon Dashboard is a web application designed for Tim to monitor and manage his golf accessories business on Amazon FBA. The dashboard prioritizes **function over form** while maintaining a professional appearance.

## Design Philosophy

1. **Clarity First** - Information is immediately visible and actionable
2. **Mobile-Responsive** - Works on desktop and mobile devices
3. **Data-Driven** - Charts and tables for quick insights
4. **Alert-Focused** - Critical issues (low stock, high ACOS) prominently displayed
5. **Extensible** - Easy to plug in SP-API data later

## Color Palette

- **Primary Green**: `#16a34a` - Brand color, positive metrics
- **Red**: For alerts, critical issues, ad spend
- **Yellow**: For warnings, medium priority items
- **Blue**: For informational items, low priority
- **Gray Scale**: Base UI elements, text hierarchy

## Page Structure

### 1. Sales Dashboard (`/dashboard`)

**Purpose**: High-level overview of business performance

**Layout**:
```
┌─────────────────────────────────────────────────┐
│  Summary Stats (4 cards)                        │
│  - Total Revenue                                │
│  - Units Sold                                   │
│  - Total Orders                                 │
│  - Avg Conversion                               │
├─────────────────────────────────────────────────┤
│  Revenue Trend Chart (Line)                     │
│  - 30-day daily revenue                         │
├─────────────────────────────────────────────────┤
│  Units Sold Chart (Bar)                         │
│  - 30-day daily units                           │
├─────────────────────────────────────────────────┤
│  Top Performing SKUs (Table)                    │
│  - Top 5 by revenue                             │
└─────────────────────────────────────────────────┘
```

**Key Metrics**:
- Revenue with 7-day comparison
- Units sold (30-day total)
- Orders (30-day total)
- Conversion rate

**Charts**:
- Line chart for revenue trend (shows growth/decline)
- Bar chart for units sold (easier to spot outliers)

### 2. Inventory Page (`/inventory`)

**Purpose**: Track stock levels and identify restock needs

**Layout**:
```
┌─────────────────────────────────────────────────┐
│  Critical Stock Alerts                          │
│  - Items < 10 days remaining                    │
│  - Red/yellow alert cards                       │
├─────────────────────────────────────────────────┤
│  Restock Recommendations                        │
│  - SKUs needing restock                         │
│  - Recommended quantities (30d/60d)             │
│  - Based on velocity                            │
├─────────────────────────────────────────────────┤
│  Full Inventory Table                           │
│  - All SKUs                                     │
│  - Color-coded by days remaining                │
│  - Shows inbound shipments                      │
└─────────────────────────────────────────────────┘
```

**Key Features**:
- **Color-coded urgency**:
  - Red: < 7 days
  - Yellow: 7-15 days
  - Green: > 15 days
- **Velocity calculations**: Daily sales rate shown
- **Restock recommendations**: 30-day and 60-day quantities
- **Inbound visibility**: Shows incoming shipments

### 3. Marketing Page (`/marketing`)

**Purpose**: Monitor PPC campaign performance

**Layout**:
```
┌─────────────────────────────────────────────────┐
│  Summary Stats (4 cards)                        │
│  - Total Ad Spend                               │
│  - Ad Revenue                                   │
│  - Overall ACOS                                 │
│  - Conversion Rate                              │
├─────────────────────────────────────────────────┤
│  Campaign Performance Chart (Bar)               │
│  - Spend vs Revenue by campaign                 │
├─────────────────────────────────────────────────┤
│  ACOS Pie Chart | Key Metrics Cards             │
│  - Visual ACOS   | - Clicks                     │
│    comparison    | - Conversions                │
│                  | - Avg CPC                    │
├─────────────────────────────────────────────────┤
│  Campaign Details Table                         │
│  - All campaigns                                │
│  - Color-coded ACOS                             │
│  - ROAS calculation                             │
├─────────────────────────────────────────────────┤
│  Performance Insights                           │
│  - AI-generated recommendations                 │
└─────────────────────────────────────────────────┘
```

**Key Metrics**:
- **ACOS** (Advertising Cost of Sales): Color-coded
  - Green: < 15%
  - Yellow: 15-20%
  - Red: > 20%
- **ROAS** (Return on Ad Spend): Revenue / Spend
- **Conversion Rate**: Conversions / Clicks

### 4. AI Council Page (`/council`)

**Purpose**: Display nightly AI analysis and recommendations

**Layout**:
```
┌─────────────────────────────────────────────────┐
│  Priority Summary (3 cards)                     │
│  - High Priority (red)                          │
│  - Medium Priority (yellow)                     │
│  - Low Priority (blue)                          │
├─────────────────────────────────────────────────┤
│  High Priority Actions                          │
│  - Urgent issues requiring immediate attention  │
│  - Inventory alerts, critical issues            │
├─────────────────────────────────────────────────┤
│  Medium Priority Actions                        │
│  - Optimization opportunities                   │
│  - 2-3 day action window                        │
├─────────────────────────────────────────────────┤
│  Informational Updates                          │
│  - Good news, monitoring items                  │
│  - Low urgency                                  │
├─────────────────────────────────────────────────┤
│  How AI Council Works                           │
│  - Explanation of analysis process              │
└─────────────────────────────────────────────────┘
```

**Recommendation Structure**:
- Category badge (Inventory, Marketing, Sales, Operations)
- Title (concise summary)
- Description (detailed context)
- Recommended Action (specific next steps)
- Timestamp

## Navigation

Top navigation bar with:
- VISUALIZE branding
- 4 main sections (Dashboard, Inventory, Marketing, Council)
- Icons + labels (icons only on mobile)
- Active state highlighting

## Component Library

### StatCard
Displays key metrics with:
- Title
- Large value display
- Optional change indicator (% vs previous period)
- Icon
- Color-coded border

### DataTable
Generic table component:
- Column configuration
- Custom render functions
- Responsive (horizontal scroll on mobile)
- Hover states

### AlertCard
Alert/notification component:
- Severity levels (low, medium, high, success)
- Color-coded (blue, yellow, red, green)
- Optional action button
- Icon based on severity

### Charts (Recharts)
- LineChart: Revenue trends
- BarChart: Units sold, campaign spend
- PieChart: ACOS distribution

## Responsive Design

**Desktop (>768px)**:
- Full navigation labels
- 4-column grid for stat cards
- Side-by-side charts
- Full-width tables

**Mobile (<768px)**:
- Icon-only navigation
- Single column layout
- Stacked charts
- Horizontal scroll for tables

## Data Integration Points

**Ready for SP-API**:
1. Replace `generateMockSalesData()` with API call to `/api/sales`
2. Replace `mockSKUs` with API call to `/api/inventory`
3. Replace `mockMarketingData` with API call to `/api/marketing`
4. Replace `mockCouncilRecommendations` with API call to `/api/council`

All components accept typed data interfaces, making the swap straightforward.

## Future Enhancements

1. **Date range selector** - Filter data by custom date ranges
2. **Export functionality** - Download reports as CSV/PDF
3. **Email alerts** - Automated notifications for critical issues
4. **Keyword tracking** - Detailed PPC keyword performance
5. **Competitor monitoring** - Track competitor prices/rankings
6. **Mobile app** - Native iOS/Android apps
7. **Historical comparisons** - Year-over-year, seasonal trends

## Technical Decisions

**Why Next.js 14 App Router?**
- Server components for better performance
- Built-in API routes for SP-API integration
- Excellent Vercel deployment integration
- Modern React patterns

**Why Recharts?**
- Responsive out of the box
- Good documentation
- Sufficient for our needs
- Lighter than Chart.js

**Why Tailwind CSS?**
- Rapid prototyping
- Consistent design system
- Small bundle size
- Easy to customize

**Why TypeScript?**
- Type safety for data structures
- Better IDE support
- Easier refactoring when integrating SP-API
- Self-documenting code

## Deployment

**Vercel Configuration** (`vercel.json`):
- Auto-deploy on push to main
- Environment variables for SP-API credentials
- Edge functions for low latency

**Environment Variables** (`.env.example`):
```
NEXT_PUBLIC_APP_NAME="VISUALIZE Sports Dashboard"
AMAZON_SP_API_REFRESH_TOKEN=
AMAZON_SP_API_CLIENT_ID=
AMAZON_SP_API_CLIENT_SECRET=
AMAZON_SELLER_ID=
AMAZON_MARKETPLACE_ID=
```
