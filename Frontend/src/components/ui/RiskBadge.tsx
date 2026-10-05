import { RiskLevel } from '../../types'

interface RiskBadgeProps {
  level: RiskLevel
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const RiskBadge = ({
  level,
  className = '',
  size = 'md',
}: RiskBadgeProps) => {
  const levelStyles = {
    LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    HIGH: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
  }

  const sizes = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  }

  const dots = {
    LOW: 'bg-emerald-500',
    MEDIUM: 'bg-amber-500',
    HIGH: 'bg-red-500',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-colors ${levelStyles[level]} ${sizes[size]} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dots[level]}`}></span>
      {level} RISK
    </span>
  )
}