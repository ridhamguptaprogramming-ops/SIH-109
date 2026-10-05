import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { Alert } from '../types'
import { PageHeader } from '../components/ui/PageHeader'
import { AlertCard } from '../components/alerts/AlertCard'
import { LoadingState } from '../components/ui/LoadingState'
import { EmptyState } from '../components/ui/EmptyState'
import { Bell, CheckCheck, Filter } from 'lucide-react'

export const AlertsPage = () => {
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [unreadOnly, setUnreadOnly] = useState(false)

  const fetchAlerts = async () => {
    setLoading(true)
    try {
      const data = await api.getAlerts()
      setAlerts(data)
    } catch (err) {
      console.error('Failed to load alerts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [])

  const handleAcknowledge = async (id: string) => {
    await api.acknowledgeAlert(id)
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === id ? { ...alert, read: true } : alert))
    )
  }

  const handleMarkAllRead = () => {
    setAlerts((prev) => prev.map((alert) => ({ ...alert, read: true })))
  }

  const filteredAlerts = alerts.filter((alert) => {
    if (unreadOnly && alert.read) return false

    if (categoryFilter === 'HIGH') return alert.severity === 'HIGH'
    if (categoryFilter === 'MEDIUM') return alert.severity === 'MEDIUM'
    if (categoryFilter === 'ANOMALY') return alert.type === 'anomaly'
    if (categoryFilter === 'SYSTEM') return alert.type === 'system'

    return true
  })

  if (loading) {
    return <LoadingState message="Loading early warning notifications..." />
  }

  const unreadCount = alerts.filter((a) => !a.read).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alert Center"
        description="Real-time subclinical mastitis alerts and IoT node system warnings."
        action={
          unreadCount > 0 ? (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
            >
              <CheckCheck className="h-4 w-4" /> Mark All as Read ({unreadCount})
            </button>
          ) : undefined
        }
      />

      {/* Filter Tabs */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-500 shrink-0">Category:</span>
          {['ALL', 'HIGH', 'MEDIUM', 'ANOMALY', 'SYSTEM'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors shrink-0 ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
            className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
          />
          <span>Show Unread Only ({unreadCount})</span>
        </label>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <EmptyState
          title="No Alerts Found"
          description="There are currently no active alerts matching your filter criteria."
          icon={<Bell className="h-8 w-8 text-slate-400" />}
        />
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAcknowledge={handleAcknowledge}
            />
          ))}
        </div>
      )}
    </div>
  )
}
