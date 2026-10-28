import { AlertTriangle, Info, CheckCircle } from 'lucide-react'

interface AlertCardProps {
  title: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'success'
  action?: {
    label: string
    onClick: () => void
  }
}

const severityConfig = {
  low: {
    icon: Info,
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-900',
    iconColor: 'text-blue-500',
  },
  medium: {
    icon: AlertTriangle,
    borderColor: 'border-yellow-500',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-900',
    iconColor: 'text-yellow-500',
  },
  high: {
    icon: AlertTriangle,
    borderColor: 'border-red-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-900',
    iconColor: 'text-red-500',
  },
  success: {
    icon: CheckCircle,
    borderColor: 'border-green-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-900',
    iconColor: 'text-green-500',
  },
}

export function AlertCard({ title, message, severity, action }: AlertCardProps) {
  const config = severityConfig[severity]
  const Icon = config.icon

  return (
    <div className={`${config.bgColor} rounded-lg border-l-4 ${config.borderColor} p-4 mb-4`}>
      <div className="flex items-start">
        <Icon className={`${config.iconColor} mr-3 mt-0.5`} size={20} />
        <div className="flex-1">
          <h4 className={`font-semibold ${config.textColor} mb-1`}>{title}</h4>
          <p className={`text-sm ${config.textColor}`}>{message}</p>
          {action && (
            <button
              onClick={action.onClick}
              className={`mt-2 text-sm font-medium ${config.iconColor} hover:underline`}
            >
              {action.label} →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
