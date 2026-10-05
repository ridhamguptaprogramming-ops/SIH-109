import { useLocation, Link } from 'react-router-dom'
import { Menu, Bell, User, Cpu } from 'lucide-react'

interface NavbarProps {
  onToggleMobile: () => void
  unreadAlertsCount?: number
}

export const Navbar = ({ onToggleMobile, unreadAlertsCount = 0 }: NavbarProps) => {
  const location = useLocation()

  const getPageTitle = (pathname: string) => {
    if (pathname === '/dashboard') return 'Herd Health Overview'
    if (pathname.startsWith('/animals/')) return 'Animal Diagnostic Profile'
    if (pathname === '/animals') return 'Herd Registry & Monitoring'
    if (pathname === '/alerts') return 'Early Warning Alerts'
    if (pathname === '/analytics') return 'Epidemiological Analytics'
    if (pathname === '/live-monitoring') return 'IoT Sensor Telemetry (ESP32 Live Stream)'
    return 'Pashu Mitra'
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open Navigation Menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div>
          <h2 className="text-base font-bold text-slate-900 sm:text-lg">
            {getPageTitle(location.pathname)}
          </h2>
          <p className="hidden text-xs text-slate-500 sm:block">
            SIH 26109 • Early Mastitis Decision Support Platform
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* IoT Live Indicator pill */}
        <Link
          to="/live-monitoring"
          className="hidden items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-100 sm:flex"
        >
          <Cpu className="h-3.5 w-3.5" />
          <span>ESP32 Node Online</span>
        </Link>

        {/* Notifications Icon */}
        <Link
          to="/alerts"
          className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Alerts"
        >
          <Bell className="h-5 w-5" />
          {unreadAlertsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </Link>

        {/* User Profile Area */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
            <User className="h-4 w-4" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-800">Veterinary Officer</p>
            <p className="text-[10px] text-slate-500">Dairy Coop #42</p>
          </div>
        </div>
      </div>
    </header>
  )
}
