import { ReactNode } from 'react'

interface BadgeProps {
  variant?: 'default' | 'destructive' | 'secondary' | 'outline' | 'success' | 'warning' | 'info'
  className?: string
  children: ReactNode
}

export const Badge = ({
  variant = 'default',
  className = '',
  children,
}: BadgeProps) => {
  const variantClasses = {
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    destructive: 'bg-red-50 text-red-700 border-red-200',
    secondary: 'bg-slate-200 text-slate-700 border-slate-300',
    outline: 'border border-slate-300 text-slate-700 bg-white',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  )
}