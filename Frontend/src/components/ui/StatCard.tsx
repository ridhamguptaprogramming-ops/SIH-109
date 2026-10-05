import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  className?: string
  variant?: 'default' | 'low' | 'medium' | 'high' | 'info'
}

export const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  className = '',
  variant = 'default',
}: StatCardProps) => {
  const borderVariants = {
    default: 'border-slate-200 bg-white',
    low: 'border-emerald-200 bg-emerald-50/40',
    medium: 'border-amber-200 bg-amber-50/40',
    high: 'border-red-200 bg-red-50/40',
    info: 'border-sky-200 bg-sky-50/40',
  }

  const textVariants = {
    default: 'text-slate-900',
    low: 'text-emerald-700',
    medium: 'text-amber-700',
    high: 'text-red-700',
    info: 'text-sky-700',
  }

  return (
    <div
      className={`rounded-xl border p-5 shadow-sm transition-all hover:shadow ${borderVariants[variant]} ${className}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <p className={`mt-2 text-3xl font-bold ${textVariants[variant]}`}>{value}</p>
      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  )
}