import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    label: string
  }
  icon: LucideIcon
  iconColor?: string
}

export function StatCard({ title, value, change, icon: Icon, iconColor = 'text-primary-600' }: StatCardProps) {
  return (
    <div className="stat-card border-primary-500">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className="text-sm mt-2">
              <span className={change.value >= 0 ? 'text-green-600' : 'text-red-600'}>
                {change.value >= 0 ? '+' : ''}{change.value}%
              </span>
              <span className="text-gray-500 ml-1">{change.label}</span>
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-primary-50 ${iconColor}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  )
}
