import { Link } from 'react-router-dom'
import { AlertCircle, LayoutDashboard } from 'lucide-react'

export const NotFoundPage = () => {
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center text-center p-6">
      <div className="rounded-full bg-red-50 p-4 text-red-600 mb-4 border border-red-100">
        <AlertCircle className="h-12 w-12" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900">404 — Page Not Found</h1>
      <p className="mt-2 text-sm text-slate-500 max-w-md">
        The requested monitoring view or animal route does not exist within the Pashu Mitra system.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 shadow-sm transition-colors"
      >
        <LayoutDashboard className="h-4 w-4" /> Return to Main Dashboard
      </Link>
    </div>
  )
}
