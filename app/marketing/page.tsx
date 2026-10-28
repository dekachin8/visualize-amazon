'use client'

import { StatCard } from '@/components/StatCard'
import { DataTable } from '@/components/DataTable'
import { mockMarketingData, type MarketingData } from '@/lib/mockData'
import { DollarSign, MousePointer, TrendingUp, Target } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function MarketingPage() {
  const totalSpend = mockMarketingData.reduce((sum, c) => sum + c.spend, 0)
  const totalRevenue = mockMarketingData.reduce((sum, c) => sum + c.revenue, 0)
  const totalClicks = mockMarketingData.reduce((sum, c) => sum + c.clicks, 0)
  const totalConversions = mockMarketingData.reduce((sum, c) => sum + c.conversions, 0)
  const overallACOS = ((totalSpend / totalRevenue) * 100).toFixed(1)
  const conversionRate = ((totalConversions / totalClicks) * 100).toFixed(1)

  // Prepare data for charts
  const campaignPerformance = mockMarketingData.map(c => ({
    name: c.campaign.split(' - ')[0],
    spend: c.spend,
    revenue: c.revenue,
    acos: c.acos,
  }))

  const COLORS = ['#16a34a', '#22c55e', '#86efac', '#bbf7d0']

  const marketingColumns = [
    { key: 'campaign' as keyof MarketingData, label: 'Campaign' },
    { 
      key: 'spend' as keyof MarketingData, 
      label: 'Spend',
      render: (value: number) => <span className="font-semibold text-red-600">${value.toFixed(2)}</span>
    },
    { 
      key: 'revenue' as keyof MarketingData, 
      label: 'Revenue',
      render: (value: number) => <span className="font-semibold text-green-600">${value.toFixed(2)}</span>
    },
    { 
      key: 'acos' as keyof MarketingData, 
      label: 'ACOS',
      render: (value: number) => {
        const colorClass = value < 15 ? 'text-green-600' : value < 20 ? 'text-yellow-600' : 'text-red-600'
        return <span className={`font-semibold ${colorClass}`}>{value.toFixed(1)}%</span>
      }
    },
    { 
      key: 'clicks' as keyof MarketingData, 
      label: 'Clicks',
      render: (value: number) => <span>{value}</span>
    },
    { 
      key: 'conversions' as keyof MarketingData, 
      label: 'Conversions',
      render: (value: number, row: MarketingData) => {
        const rate = ((value / row.clicks) * 100).toFixed(1)
        return (
          <div>
            <span className="font-semibold">{value}</span>
            <span className="text-sm text-gray-500 ml-1">({rate}%)</span>
          </div>
        )
      }
    },
    { 
      key: 'revenue' as keyof MarketingData, 
      label: 'ROAS',
      render: (value: number, row: MarketingData) => {
        const roas = (value / row.spend).toFixed(2)
        return <span className="font-semibold text-blue-600">{roas}x</span>
      }
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketing Insights</h1>
        <p className="text-gray-600">PPC campaign performance and advertising metrics</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Ad Spend"
          value={`$${totalSpend.toFixed(2)}`}
          icon={DollarSign}
          iconColor="text-red-600"
        />
        <StatCard
          title="Ad Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          icon={TrendingUp}
        />
        <StatCard
          title="Overall ACOS"
          value={`${overallACOS}%`}
          icon={Target}
          iconColor={parseFloat(overallACOS) < 20 ? 'text-green-600' : 'text-yellow-600'}
        />
        <StatCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          icon={MousePointer}
        />
      </div>

      {/* Spend vs Revenue Chart */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Campaign Performance</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={campaignPerformance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
            <Legend />
            <Bar dataKey="spend" fill="#ef4444" name="Spend" />
            <Bar dataKey="revenue" fill="#16a34a" name="Revenue" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ACOS by Campaign */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">ACOS by Campaign</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={campaignPerformance}
                dataKey="acos"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => `${entry.name}: ${entry.acos}%`}
              >
                {campaignPerformance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold">{totalClicks}</p>
              </div>
              <MousePointer className="text-blue-500" size={32} />
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Total Conversions</p>
                <p className="text-2xl font-bold">{totalConversions}</p>
              </div>
              <Target className="text-green-500" size={32} />
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Average CPC</p>
                <p className="text-2xl font-bold">${(totalSpend / totalClicks).toFixed(2)}</p>
              </div>
              <DollarSign className="text-yellow-500" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Campaign Table */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Campaign Details</h2>
        <DataTable columns={marketingColumns} data={mockMarketingData} />
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Performance Insights</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Brand Defense campaign has lowest ACOS (10.9%) - performing well</li>
            <li>⚠ Competitor Targeting needs optimization - ACOS above 20% target</li>
            <li>✓ Golf Gloves campaign driving highest revenue with acceptable ACOS</li>
            <li>→ Consider increasing budget for Brand Defense by 15-20%</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
