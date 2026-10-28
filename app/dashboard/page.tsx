'use client'

import { StatCard } from '@/components/StatCard'
import { DataTable } from '@/components/DataTable'
import { DollarSign, ShoppingCart, TrendingUp, Package } from 'lucide-react'
import { generateMockSalesData, mockSKUs, type SKUData } from '@/lib/mockData'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function DashboardPage() {
  const salesData = generateMockSalesData()
  
  // Calculate summary stats
  const totalRevenue = salesData.reduce((sum, day) => sum + day.revenue, 0)
  const totalUnits = salesData.reduce((sum, day) => sum + day.units, 0)
  const totalOrders = salesData.reduce((sum, day) => sum + day.orders, 0)
  const avgConversion = ((totalOrders / totalUnits) * 100).toFixed(1)
  
  // Last 7 days vs previous 7 days for comparison
  const last7Days = salesData.slice(-7).reduce((sum, day) => sum + day.revenue, 0)
  const prev7Days = salesData.slice(-14, -7).reduce((sum, day) => sum + day.revenue, 0)
  const revenueChange = ((last7Days - prev7Days) / prev7Days * 100).toFixed(1)

  // Top SKUs sorted by revenue
  const topSKUs = [...mockSKUs].sort((a, b) => b.revenue - a.revenue).slice(0, 5)

  const skuColumns = [
    { key: 'sku' as keyof SKUData, label: 'SKU' },
    { key: 'name' as keyof SKUData, label: 'Product' },
    { 
      key: 'unitsSold' as keyof SKUData, 
      label: 'Units Sold',
      render: (value: number) => <span className="font-semibold">{value}</span>
    },
    { 
      key: 'revenue' as keyof SKUData, 
      label: 'Revenue',
      render: (value: number) => <span className="font-semibold text-green-600">${value.toFixed(2)}</span>
    },
    { 
      key: 'inStock' as keyof SKUData, 
      label: 'In Stock',
      render: (value: number, row: SKUData) => (
        <span className={row.daysRemaining < 10 ? 'text-red-600 font-semibold' : ''}>
          {value}
        </span>
      )
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Dashboard</h1>
        <p className="text-gray-600">30-day overview of VISUALIZE Sports performance</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          change={{ value: parseFloat(revenueChange), label: 'vs last 7 days' }}
          icon={DollarSign}
        />
        <StatCard
          title="Units Sold"
          value={totalUnits}
          icon={ShoppingCart}
        />
        <StatCard
          title="Total Orders"
          value={totalOrders}
          icon={Package}
        />
        <StatCard
          title="Avg Conversion"
          value={`${avgConversion}%`}
          icon={TrendingUp}
        />
      </div>

      {/* Revenue Chart */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Revenue Trend (30 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
              labelFormatter={(date) => new Date(date).toLocaleDateString()}
            />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} name="Revenue" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Units Sold Chart */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Units Sold (30 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(date) => new Date(date).toLocaleDateString()}
            />
            <Legend />
            <Bar dataKey="units" fill="#16a34a" name="Units" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Performing SKUs */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Top Performing SKUs</h2>
        <DataTable columns={skuColumns} data={topSKUs} />
      </div>
    </div>
  )
}
