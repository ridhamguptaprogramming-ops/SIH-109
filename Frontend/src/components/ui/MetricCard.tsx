import { ReactNode } from 'react'

interface MetricCardProps {
  label: string
  value: string | number
  unit?: string
  status?: 'normal' | 'elevated' | 'critical'
  icon?: ReactNode
  subtitle?: string
}

export const MetricCard = ({
  label,
  value,
  unit,
  status = 'normal',
  icon,
  subtitle,
}: MetricCardProps) => {
  const statusColors = {
    normal: 'border-slate-200 bg-white text-slate-900',
    elevated: 'border-amber-200 bg-amber-50/50 text-amber-900',
    critical: 'border-red-200 bg-red-50/50 text-red-900',
  }

  const badgeColors = {
    normal: 'bg-emerald-100 text-emerald-800',
    elevated: 'bg-amber-100 text-amber-800',
    critical: 'bg-red-100 text-red-800',
  }

  return (
    <div className={`rounded-xl border p-4 shadow-sm ${statusColors[status]}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
        {icon && <span className="text-slate-400">{icon}</span>}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold">{value}</span>
        {unit && <span className="text-xs text-slate-500">{unit}</span>}
      </div>
      <div className="mt-2 flex items-center justify-between">
        {subtitle && <span className="text-xs text-slate-500">{subtitle}</span>}
        <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${badgeColors[status]}`}>
          {status}
        </span>
      </div>
    </div>
  )
}
