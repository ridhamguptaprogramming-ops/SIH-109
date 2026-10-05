import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'secondary' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  children: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'default', className = '', children, disabled, ...props }, ref) => {
    const baseClasses =
      'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50 disabled:pointer-events-none cursor-pointer'

    let variantClasses = ''
    switch (variant) {
      case 'destructive':
        variantClasses = 'bg-red-600 text-white hover:bg-red-700'
        break
      case 'secondary':
        variantClasses = 'bg-slate-100 text-slate-800 hover:bg-slate-200'
        break
      case 'outline':
        variantClasses = 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
        break
      case 'ghost':
        variantClasses = 'bg-transparent text-slate-700 hover:bg-slate-100'
        break
      default:
        variantClasses = 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
        break
    }

    let sizeClasses = ''
    switch (size) {
      case 'sm':
        sizeClasses = 'h-8 px-3 text-xs'
        break
      case 'lg':
        sizeClasses = 'h-11 px-6 text-base'
        break
      case 'icon':
        sizeClasses = 'h-9 w-9 p-0'
        break
      default:
        sizeClasses = 'h-9 px-4 text-sm'
        break
    }

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'