# Component Usage Guide

## Overview

This guide explains how to use each reusable component in the VISUALIZE dashboard.

## Core Components

### Navigation

**Location**: `components/Navigation.tsx`

**Purpose**: Top navigation bar with links to all main sections

**Usage**:
```tsx
import { Navigation } from '@/components/Navigation'

export default function RootLayout({ children }) {
  return (
    <div>
      <Navigation />
      <main>{children}</main>
    </div>
  )
}
```

**Features**:
- Automatic active state detection via `usePathname()`
- Icons from lucide-react
- Responsive (icons only on mobile)

**Customization**:
Edit the `navItems` array in `Navigation.tsx` to add/remove sections:
```tsx
const navItems = [
  { href: '/dashboard', label: 'Sales Dashboard', icon: LayoutDashboard },
  { href: '/inventory', label: 'Inventory', icon: Package },
  // Add more items here
]
```

---

### StatCard

**Location**: `components/StatCard.tsx`

**Purpose**: Display key metrics with optional change indicators

**Props**:
```tsx
interface StatCardProps {
  title: string              // Metric name
  value: string | number     // Main value to display
  change?: {                 // Optional comparison
    value: number            // Percentage change
    label: string            // "vs last 7 days"
  }
  icon: LucideIcon          // Icon component
  iconColor?: string        // Tailwind color class
}
```

**Usage**:
```tsx
import { StatCard } from '@/components/StatCard'
import { DollarSign } from 'lucide-react'

<StatCard
  title="Total Revenue"
  value="$12,345.67"
  change={{ value: 12.5, label: 'vs last week' }}
  icon={DollarSign}
  iconColor="text-green-600"
/>
```

**Styling**:
- Green borders by default
- Change value auto-colored (green for positive, red for negative)
- Icon background color customizable

---

### DataTable

**Location**: `components/DataTable.tsx`

**Purpose**: Generic table component with custom rendering

**Props**:
```tsx
interface Column<T> {
  key: keyof T              // Data property key
  label: string             // Column header
  render?: (value, row) => React.ReactNode  // Custom cell renderer
}

interface DataTableProps<T> {
  columns: Column<T>[]      // Column definitions
  data: T[]                 // Data rows
  className?: string        // Optional wrapper classes
}
```

**Usage**:
```tsx
import { DataTable } from '@/components/DataTable'

interface Product {
  id: string
  name: string
  price: number
  stock: number
}

const columns = [
  { key: 'name', label: 'Product' },
  { 
    key: 'price', 
    label: 'Price',
    render: (value: number) => `$${value.toFixed(2)}`
  },
  { 
    key: 'stock', 
    label: 'Stock',
    render: (value: number) => (
      <span className={value < 10 ? 'text-red-600' : ''}>
        {value}
      </span>
    )
  },
]

const data: Product[] = [
  { id: '1', name: 'Widget', price: 19.99, stock: 5 },
  { id: '2', name: 'Gadget', price: 29.99, stock: 25 },
]

<DataTable columns={columns} data={data} />
```

**Features**:
- Type-safe with generics
- Custom render functions for complex cells
- Hover states on rows
- Responsive (horizontal scroll on mobile)
- Requires `id` property on data rows

---

### AlertCard

**Location**: `components/AlertCard.tsx`

**Purpose**: Display alerts, warnings, and notifications

**Props**:
```tsx
interface AlertCardProps {
  title: string             // Alert headline
  message: string           // Detailed message
  severity: 'low' | 'medium' | 'high' | 'success'
  action?: {                // Optional action button
    label: string
    onClick: () => void
  }
}
```

**Severity Mapping**:
| Severity | Color  | Icon          | Use Case                    |
|----------|--------|---------------|-----------------------------|
| low      | Blue   | Info          | Informational messages      |
| medium   | Yellow | AlertTriangle | Warnings, optimization tips |
| high     | Red    | AlertTriangle | Critical issues, stockouts  |
| success  | Green  | CheckCircle   | Confirmations, good news    |

**Usage**:
```tsx
import { AlertCard } from '@/components/AlertCard'

<AlertCard
  title="Low Stock Alert"
  message="VIS-TOWEL-001 has only 3 days of inventory remaining"
  severity="high"
  action={{
    label: "Create Shipment",
    onClick: () => console.log('Navigate to FBA shipment')
  }}
/>
```

**Styling**:
- Color-coded left border
- Background tint matches severity
- Icon automatically selected
- Optional action button with arrow

---

## Charts (Recharts)

### LineChart

**Best for**: Trends over time (revenue, sales velocity)

**Usage**:
```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const data = [
  { date: '2024-01-01', revenue: 1200 },
  { date: '2024-01-02', revenue: 1350 },
  // ...
]

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} />
  </LineChart>
</ResponsiveContainer>
```

### BarChart

**Best for**: Comparisons, categorical data (units sold, campaign spend)

**Usage**:
```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar dataKey="units" fill="#16a34a" />
  </BarChart>
</ResponsiveContainer>
```

### PieChart

**Best for**: Proportions, distributions (ACOS by campaign)

**Usage**:
```tsx
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#16a34a', '#22c55e', '#86efac', '#bbf7d0']

<ResponsiveContainer width="100%" height={250}>
  <PieChart>
    <Pie
      data={data}
      dataKey="value"
      nameKey="name"
      cx="50%"
      cy="50%"
      outerRadius={80}
      label
    >
      {data.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip />
  </PieChart>
</ResponsiveContainer>
```

---

## Layout Components

### Page Wrapper

**Standard page structure**:
```tsx
export default function MyPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Title</h1>
        <p className="text-gray-600">Page description</p>
      </div>

      {/* Content sections */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* StatCards */}
      </div>

      <div className="card">
        {/* Chart or table */}
      </div>
    </div>
  )
}
```

### Card Container

**Pre-defined in globals.css**:
```tsx
<div className="card">
  <h2 className="text-xl font-semibold mb-4">Card Title</h2>
  {/* Content */}
</div>
```

**Variants**:
- `.card` - Standard white card with shadow
- `.stat-card` - Card with left border (for stats)
- `.alert-card` - Card with left border (for alerts)

---

## Utility Classes

### Custom Tailwind Classes

**Spacing**:
- `space-y-8` - Vertical spacing between sections
- `gap-6` - Grid gap

**Grid Layouts**:
- `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` - Responsive columns
- 1 column on mobile, 2 on tablet, 4 on desktop

**Text Hierarchy**:
- `text-3xl font-bold` - Page titles
- `text-xl font-semibold` - Section titles
- `text-sm text-gray-600` - Labels, secondary text

**Color Classes**:
- `text-primary-600` - Green brand color
- `text-red-600` - Errors, alerts, negative metrics
- `text-yellow-600` - Warnings
- `text-blue-600` - Info
- `text-green-600` - Success, positive metrics

---

## Mock Data

**Location**: `lib/mockData.ts`

### Available Mock Data:

**Sales Data**:
```tsx
import { generateMockSalesData } from '@/lib/mockData'
const salesData = generateMockSalesData() // 30 days of sales
```

**SKUs**:
```tsx
import { mockSKUs } from '@/lib/mockData'
// Array of 5 sample products with inventory data
```

**Marketing Data**:
```tsx
import { mockMarketingData } from '@/lib/mockData'
// Array of 4 sample PPC campaigns
```

**Council Recommendations**:
```tsx
import { mockCouncilRecommendations } from '@/lib/mockData'
// Array of 5 AI-generated recommendations
```

### Data Interfaces:

```tsx
interface SalesData {
  date: string
  revenue: number
  units: number
  orders: number
}

interface SKUData {
  id: string
  sku: string
  name: string
  unitsSold: number
  revenue: number
  inStock: number
  reserved: number
  inbound: number
  daysRemaining: number
}

interface MarketingData {
  campaign: string
  spend: number
  revenue: number
  acos: number
  clicks: number
  conversions: number
}

interface CouncilRecommendation {
  id: string
  priority: 'high' | 'medium' | 'low'
  category: string
  title: string
  description: string
  action: string
  timestamp: string
}
```

---

## Adding a New Page

1. **Create page file**: `app/my-page/page.tsx`
2. **Add navigation item**:
   ```tsx
   // In components/Navigation.tsx
   { href: '/my-page', label: 'My Page', icon: MyIcon }
   ```
3. **Use standard layout**:
   ```tsx
   export default function MyPage() {
     return (
       <div className="space-y-8">
         <div>
           <h1 className="text-3xl font-bold text-gray-900 mb-2">My Page</h1>
           <p className="text-gray-600">Description</p>
         </div>
         {/* Content */}
       </div>
     )
   }
   ```

---

## Creating New Components

**Template**:
```tsx
// components/MyComponent.tsx

interface MyComponentProps {
  title: string
  // Add more props
}

export function MyComponent({ title }: MyComponentProps) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {/* Component content */}
    </div>
  )
}
```

**Export from `components/index.ts`** (optional):
```tsx
export { Navigation } from './Navigation'
export { StatCard } from './StatCard'
export { DataTable } from './DataTable'
export { AlertCard } from './AlertCard'
export { MyComponent } from './MyComponent'
```

---

## Best Practices

1. **Use TypeScript interfaces** for all data structures
2. **Keep components small** - one responsibility per component
3. **Use Tailwind classes** - avoid custom CSS when possible
4. **Make components reusable** - accept props, avoid hardcoded values
5. **Add color-coding** - help users quickly identify issues (red = bad, green = good)
6. **Responsive by default** - test on mobile, use Tailwind breakpoints
7. **Use semantic HTML** - `<nav>`, `<main>`, `<article>`, etc.

---

## Integrating Real Data

**Step 1**: Create API route
```tsx
// app/api/sales/route.ts
export async function GET() {
  const data = await fetchFromSPAPI()
  return Response.json(data)
}
```

**Step 2**: Replace mock data in page
```tsx
// Before
const salesData = generateMockSalesData()

// After
const response = await fetch('/api/sales')
const salesData = await response.json()
```

**Step 3**: Update types if needed
```tsx
// If SP-API data structure differs, update interface in mockData.ts
```

---

## Troubleshooting

**Issue**: "Module not found" errors
- **Fix**: Ensure `tsconfig.json` has correct `paths` alias (`@/*`)

**Issue**: Charts not rendering
- **Fix**: Ensure `ResponsiveContainer` wraps chart, has width/height

**Issue**: Tailwind classes not working
- **Fix**: Check `tailwind.config.js` includes correct content paths

**Issue**: Data not updating
- **Fix**: Check if using client component (`'use client'`) for interactive pages

---

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Recharts**: https://recharts.org/en-US/
- **Lucide Icons**: https://lucide.dev/icons/
