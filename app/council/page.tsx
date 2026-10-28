'use client'

import { AlertCard } from '@/components/AlertCard'
import { mockCouncilRecommendations } from '@/lib/mockData'
import { Brain, Clock, TrendingUp, AlertTriangle } from 'lucide-react'

export default function CouncilPage() {
  const highPriority = mockCouncilRecommendations.filter(r => r.priority === 'high')
  const mediumPriority = mockCouncilRecommendations.filter(r => r.priority === 'medium')
  const lowPriority = mockCouncilRecommendations.filter(r => r.priority === 'low')

  const priorityCount = {
    high: highPriority.length,
    medium: mediumPriority.length,
    low: lowPriority.length,
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <Brain className="mr-3 text-primary-600" />
          AI Council Recommendations
        </h1>
        <p className="text-gray-600">Strategic insights and action items from nightly analysis</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">High Priority</p>
              <p className="text-3xl font-bold text-red-600">{priorityCount.high}</p>
              <p className="text-xs text-gray-500 mt-1">Requires immediate action</p>
            </div>
            <AlertTriangle className="text-red-500" size={32} />
          </div>
        </div>

        <div className="card border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Medium Priority</p>
              <p className="text-3xl font-bold text-yellow-600">{priorityCount.medium}</p>
              <p className="text-xs text-gray-500 mt-1">Action within 2-3 days</p>
            </div>
            <Clock className="text-yellow-500" size={32} />
          </div>
        </div>

        <div className="card border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Low Priority</p>
              <p className="text-3xl font-bold text-blue-600">{priorityCount.low}</p>
              <p className="text-xs text-gray-500 mt-1">Informational / Monitor</p>
            </div>
            <TrendingUp className="text-blue-500" size={32} />
          </div>
        </div>
      </div>

      {/* High Priority Recommendations */}
      {highPriority.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center text-red-600">
            <AlertTriangle className="mr-2" />
            High Priority Actions
          </h2>
          <div className="space-y-4">
            {highPriority.map((rec) => (
              <div key={rec.id} className="card border-l-4 border-red-500 bg-red-50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="inline-block px-2 py-1 text-xs font-semibold bg-red-200 text-red-800 rounded mb-2">
                      {rec.category}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900">{rec.title}</h3>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(rec.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700 mb-3">{rec.description}</p>
                <div className="bg-white rounded p-3 border-l-4 border-red-400">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Recommended Action:</p>
                  <p className="text-sm text-gray-700">{rec.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medium Priority Recommendations */}
      {mediumPriority.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center text-yellow-600">
            <Clock className="mr-2" />
            Medium Priority Actions
          </h2>
          <div className="space-y-4">
            {mediumPriority.map((rec) => (
              <div key={rec.id} className="card border-l-4 border-yellow-500 bg-yellow-50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="inline-block px-2 py-1 text-xs font-semibold bg-yellow-200 text-yellow-800 rounded mb-2">
                      {rec.category}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900">{rec.title}</h3>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(rec.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700 mb-3">{rec.description}</p>
                <div className="bg-white rounded p-3 border-l-4 border-yellow-400">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Recommended Action:</p>
                  <p className="text-sm text-gray-700">{rec.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Low Priority Recommendations */}
      {lowPriority.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center text-blue-600">
            <TrendingUp className="mr-2" />
            Informational Updates
          </h2>
          <div className="space-y-4">
            {lowPriority.map((rec) => (
              <div key={rec.id} className="card border-l-4 border-blue-500 bg-blue-50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-200 text-blue-800 rounded mb-2">
                      {rec.category}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900">{rec.title}</h3>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(rec.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700 mb-3">{rec.description}</p>
                <div className="bg-white rounded p-3 border-l-4 border-blue-400">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Suggested Action:</p>
                  <p className="text-sm text-gray-700">{rec.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How It Works Section */}
      <div className="card bg-gradient-to-br from-primary-50 to-blue-50 border border-primary-200">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Brain className="mr-2 text-primary-600" />
          How AI Council Works
        </h2>
        <div className="space-y-3 text-sm text-gray-700">
          <p>
            The AI Council analyzes your Amazon business data nightly, combining insights from:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Sales trends</strong> - Revenue patterns, SKU performance, conversion rates</li>
            <li><strong>Inventory levels</strong> - Stock remaining, velocity calculations, restock timing</li>
            <li><strong>Marketing data</strong> - ACOS, campaign performance, keyword trends</li>
            <li><strong>Historical patterns</strong> - Seasonal trends, growth trajectories</li>
          </ul>
          <p className="pt-2">
            Recommendations are prioritized based on urgency and potential impact, helping you focus on 
            actions that matter most for your business growth.
          </p>
        </div>
      </div>
    </div>
  )
}
