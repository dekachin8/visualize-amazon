'use client'

import { DataTable } from '@/components/DataTable'
import { AlertCard } from '@/components/AlertCard'
import { mockSKUs, type SKUData } from '@/lib/mockData'
import { Package, AlertTriangle, TrendingUp } from 'lucide-react'

export default function InventoryPage() {
  // Identify low stock items (< 10 days remaining)
  const lowStockItems = mockSKUs.filter(sku => sku.daysRemaining < 10)
  const restockNeeded = mockSKUs.filter(sku => sku.daysRemaining < 15 && sku.inbound === 0)
  
  const inventoryColumns = [
    { key: 'sku' as keyof SKUData, label: 'SKU' },
    { key: 'name' as keyof SKUData, label: 'Product' },
    { 
      key: 'inStock' as keyof SKUData, 
      label: 'Available',
      render: (value: number, row: SKUData) => (
        <span className={row.daysRemaining < 10 ? 'text-red-600 font-bold' : 'font-semibold'}>
          {value}
        </span>
      )
    },
    { 
      key: 'reserved' as keyof SKUData, 
      label: 'Reserved',
      render: (value: number) => <span className="text-gray-600">{value}</span>
    },
    { 
      key: 'inbound' as keyof SKUData, 
      label: 'Inbound',
      render: (value: number) => (
        <span className={value > 0 ? 'text-blue-600 font-semibold' : 'text-gray-400'}>
          {value}
        </span>
      )
    },
    { 
      key: 'daysRemaining' as keyof SKUData, 
      label: 'Days Left',
      render: (value: number) => {
        let colorClass = 'text-green-600'
        if (value < 7) colorClass = 'text-red-600 font-bold'
        else if (value < 15) colorClass = 'text-yellow-600 font-semibold'
        
        return <span className={colorClass}>{value} days</span>
      }
    },
    { 
      key: 'unitsSold' as keyof SKUData, 
      label: 'Velocity',
      render: (value: number, row: SKUData) => {
        const dailyRate = (value / 30).toFixed(1)
        return <span className="text-sm text-gray-600">{dailyRate}/day</span>
      }
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
        <p className="text-gray-600">FBA inventory levels and restock recommendations</p>
      </div>

      {/* Critical Alerts */}
      {lowStockItems.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <AlertTriangle className="mr-2 text-red-500" />
            Critical Stock Alerts
          </h2>
          {lowStockItems.map(sku => (
            <AlertCard
              key={sku.id}
              title={`Low Stock: ${sku.name}`}
              message={`Only ${sku.daysRemaining} days of inventory remaining (${sku.inStock} units). ${sku.inbound > 0 ? `${sku.inbound} units inbound.` : 'No inbound shipment planned!'}`}
              severity={sku.daysRemaining < 7 ? 'high' : 'medium'}
            />
          ))}
        </div>
      )}

      {/* Restock Recommendations */}
      {restockNeeded.length > 0 && (
        <div className="card bg-yellow-50 border-l-4 border-yellow-500">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-yellow-900">
            <TrendingUp className="mr-2" />
            Restock Recommendations
          </h2>
          <div className="space-y-4">
            {restockNeeded.map(sku => {
              const dailyVelocity = sku.unitsSold / 30
              const recommended30Days = Math.ceil(dailyVelocity * 30)
              const recommended60Days = Math.ceil(dailyVelocity * 60)
              
              return (
                <div key={sku.id} className="bg-white rounded-lg p-4 border border-yellow-200">
                  <h3 className="font-semibold text-gray-900 mb-2">{sku.name}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Current Stock</p>
                      <p className="font-semibold text-lg">{sku.inStock} units</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Days Remaining</p>
                      <p className="font-semibold text-lg text-yellow-600">{sku.daysRemaining}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Recommended (30d)</p>
                      <p className="font-semibold text-lg text-blue-600">{recommended30Days} units</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Recommended (60d)</p>
                      <p className="font-semibold text-lg text-blue-600">{recommended60Days} units</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Based on 30-day velocity: {dailyVelocity.toFixed(1)} units/day
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Full Inventory Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Package className="mr-2" />
            All SKUs
          </h2>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-600">&gt;15 days</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-gray-600">7-15 days</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-gray-600">&lt;7 days</span>
            </div>
          </div>
        </div>
        <DataTable columns={inventoryColumns} data={mockSKUs} />
      </div>
    </div>
  )
}
