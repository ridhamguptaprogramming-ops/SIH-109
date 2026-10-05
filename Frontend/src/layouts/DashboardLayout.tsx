import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/layout/Sidebar'
import { Navbar } from '../components/layout/Navbar'
import { api } from '../services/api'

export const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    api.getAlerts().then((alerts) => {
      setUnreadCount(alerts.filter((a) => !a.read).length)
    })
  }, [])

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        unreadAlertsCount={unreadCount}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          onToggleMobile={() => setMobileOpen(!mobileOpen)}
          unreadAlertsCount={unreadCount}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
