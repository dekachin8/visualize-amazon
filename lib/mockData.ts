// Mock data for development - will be replaced with SP-API data

export interface SalesData {
  date: string
  revenue: number
  units: number
  orders: number
}

export interface SKUData {
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

export interface MarketingData {
  id: string
  campaign: string
  spend: number
  revenue: number
  acos: number
  clicks: number
  conversions: number
}

export interface CouncilRecommendation {
  id: string
  priority: 'high' | 'medium' | 'low'
  category: string
  title: string
  description: string
  action: string
  timestamp: string
}

// Generate mock sales data for the last 30 days
export function generateMockSalesData(): SalesData[] {
  const data: SalesData[] = []
  const now = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    data.push({
      date: date.toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 1000) + 500,
      units: Math.floor(Math.random() * 50) + 10,
      orders: Math.floor(Math.random() * 30) + 5,
    })
  }
  
  return data
}

export const mockSKUs: SKUData[] = [
  {
    id: '1',
    sku: 'VIS-GLOVE-001',
    name: 'Premium Golf Glove - Left Hand',
    unitsSold: 245,
    revenue: 4900,
    inStock: 45,
    reserved: 12,
    inbound: 200,
    daysRemaining: 15,
  },
  {
    id: '2',
    sku: 'VIS-TOWEL-001',
    name: 'Microfiber Golf Towel',
    unitsSold: 189,
    revenue: 2835,
    inStock: 8,
    reserved: 5,
    inbound: 100,
    daysRemaining: 3,
  },
  {
    id: '3',
    sku: 'VIS-MARKER-001',
    name: 'Ball Marker Set (6-pack)',
    unitsSold: 156,
    revenue: 2340,
    inStock: 125,
    reserved: 8,
    inbound: 0,
    daysRemaining: 42,
  },
  {
    id: '4',
    sku: 'VIS-DIVOT-001',
    name: 'Divot Tool with Magnetic Marker',
    unitsSold: 134,
    revenue: 2010,
    inStock: 67,
    reserved: 4,
    inbound: 150,
    daysRemaining: 28,
  },
  {
    id: '5',
    sku: 'VIS-TEE-001',
    name: 'Biodegradable Tees (50-pack)',
    unitsSold: 98,
    revenue: 1176,
    inStock: 12,
    reserved: 3,
    inbound: 0,
    daysRemaining: 7,
  },
]

export const mockMarketingData: MarketingData[] = [
  {
    id: '1',
    campaign: 'Golf Gloves - Broad Match',
    spend: 156.42,
    revenue: 890.50,
    acos: 17.6,
    clicks: 234,
    conversions: 42,
  },
  {
    id: '2',
    campaign: 'Golf Accessories - Exact',
    spend: 89.23,
    revenue: 445.00,
    acos: 20.1,
    clicks: 145,
    conversions: 24,
  },
  {
    id: '3',
    campaign: 'Brand Defense',
    spend: 34.12,
    revenue: 312.00,
    acos: 10.9,
    clicks: 89,
    conversions: 18,
  },
  {
    id: '4',
    campaign: 'Competitor Targeting',
    spend: 127.89,
    revenue: 534.00,
    acos: 23.9,
    clicks: 198,
    conversions: 28,
  },
]

export const mockCouncilRecommendations: CouncilRecommendation[] = [
  {
    id: '1',
    priority: 'high',
    category: 'Inventory',
    title: 'Critical Stock Alert - Microfiber Towel',
    description: 'VIS-TOWEL-001 has only 3 days of inventory remaining. Inbound shipment of 100 units will arrive in 5 days, creating 2-day stock gap.',
    action: 'Consider expedited shipping or temporary listing pause to avoid stockouts',
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    priority: 'high',
    category: 'Inventory',
    title: 'Restock Needed - Biodegradable Tees',
    description: 'VIS-TEE-001 has 7 days remaining and no inbound shipment planned. Average daily sales: 14 units.',
    action: 'Create FBA shipment for 300-500 units immediately',
    timestamp: new Date().toISOString(),
  },
  {
    id: '3',
    priority: 'medium',
    category: 'Marketing',
    title: 'High ACOS on Competitor Targeting',
    description: 'Competitor Targeting campaign has 23.9% ACOS, above target of 20%. Campaign is profitable but could be optimized.',
    action: 'Review keyword bids and consider negative keyword additions',
    timestamp: new Date().toISOString(),
  },
  {
    id: '4',
    priority: 'medium',
    category: 'Sales',
    title: 'Strong Performance - Golf Gloves',
    description: 'VIS-GLOVE-001 sales increased 34% week-over-week. Conversion rate improved to 18.2%.',
    action: 'Consider increasing PPC budget for glove campaigns by 20%',
    timestamp: new Date().toISOString(),
  },
  {
    id: '5',
    priority: 'low',
    category: 'Operations',
    title: 'Healthy Stock Levels - Ball Markers',
    description: 'VIS-MARKER-001 has 42 days of inventory with stable sales velocity. No action needed.',
    action: 'Monitor for seasonal trends',
    timestamp: new Date().toISOString(),
  },
]
