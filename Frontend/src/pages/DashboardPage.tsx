import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { Animal, Alert, DashboardStats, AnalyticsData } from '../types'
import { PageHeader } from '../components/ui/PageHeader'
import { StatCard } from '../components/ui/StatCard'
import { Card } from '../components/ui/Card'
import { RiskBadge } from '../components/ui/RiskBadge'
import { RiskChart } from '../components/charts/RiskChart'
import { TrendChart } from '../components/charts/TrendChart'
import { LoadingState } from '../components/ui/LoadingState'
import { AlertCard } from '../components/alerts/AlertCard'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Radio,
  Thermometer,
  Zap,
} from 'lucide-react'

export const DashboardPage = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [animals, setAnimals] = useState<Animal[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [statsRes, animalsRes, alertsRes, analyticsRes] = await Promise.all([
          api.getDashboardStats(),
          api.getAnimals(),
          api.getAlerts(),
          api.getAnalytics(),
        ])
        setStats(statsRes)
        setAnimals(animalsRes)
        setAlerts(alertsRes)
        setAnalytics(analyticsRes)
      } catch (err) {
        console.error('Error loading dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading || !stats || !analytics) {
    return <LoadingState message="Analyzing IoT sensor telemetry & risk models..." />
  }

  const highRiskAnimals = animals.filter((a) => a.riskLevel === 'HIGH')
  const recentAlerts = alerts.slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Product Flow Story Banner */}
      <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest">
              <Zap className="h-4 w-4" /> AI + IoT Early Warning Pipeline
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mt-1">Pashu Mitra Early Mastitis Forecasting</h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Forecasting subclinical bovine mastitis 7–14 days prior to clinical onset by fusing neck-tag collar sensors with milk conductivity models.
            </p>
          </div>
          <Link
            to="/live-monitoring"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors shadow-sm self-start md:self-auto"
          >
            <Radio className="h-4 w-4" /> View ESP32 Sensor Telemetry
          </Link>
        </div>

        {/* 5-Step Pipeline Indicators */}
        <div className="mt-6 grid grid-cols-5 gap-2 border-t border-emerald-700/50 pt-4 text-center text-[11px] font-semibold">
          <div className="rounded bg-emerald-950/60 p-1.5 text-emerald-300">1. Sense</div>
          <div className="rounded bg-emerald-950/60 p-1.5 text-emerald-300">2. Fuse</div>
          <div className="rounded bg-emerald-950/60 p-1.5 text-emerald-300">3. Predict</div>
          <div className="rounded bg-emerald-950/60 p-1.5 text-emerald-300">4. Alert</div>
          <div className="rounded bg-emerald-950/60 p-1.5 text-emerald-300">5. Act</div>
        </div>
      </div>

      <PageHeader
        title="Pashu Mitra Dashboard"
        description="Early bovine health and mastitis-risk monitoring across registered dairy herds."
      />

      {/* Top Level Key Statistics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Herd"
          value={stats.totalAnimals}
          subtitle="Monitored bovines"
          icon={<Activity className="h-5 w-5" />}
        />
        <StatCard
          title="High Risk"
          value={stats.highRisk}
          subtitle="Requires immediate clinical check"
          variant="high"
          icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
        />
        <StatCard
          title="Medium Risk"
          value={stats.mediumRisk}
          subtitle="Targeted monitoring"
          variant="medium"
          icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
        />
        <StatCard
          title="Low Risk"
          value={stats.lowRisk}
          subtitle="Normal health parameters"
          variant="low"
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Risk Distribution Donut */}
        <Card className="lg:col-span-1">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900">Herd Risk Distribution</h3>
            <span className="text-xs text-slate-500">Live Breakdown</span>
          </div>
          <div className="mt-4">
            <RiskChart
              low={stats.lowRisk}
              medium={stats.mediumRisk}
              high={stats.highRisk}
            />
          </div>
        </Card>

        {/* 7-Day Risk Trend */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900">7-Day Herd Risk Trend</h3>
              <p className="text-xs text-slate-500">Average mastitis risk index over time</p>
            </div>
            <Link to="/analytics" className="text-xs font-semibold text-emerald-600 hover:underline">
              Full Analytics →
            </Link>
          </div>
          <div className="mt-4">
            <TrendChart data={analytics} type="risk" />
          </div>
        </Card>
      </div>

      {/* High Priority Attention & Alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* High Risk Animals List */}
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
              <h3 className="font-bold text-slate-900">Priority Attention Required</h3>
            </div>
            <Link to="/animals" className="text-xs font-semibold text-emerald-600 hover:underline">
              View All Herd ({stats.totalAnimals})
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {highRiskAnimals.length > 0 ? (
              highRiskAnimals.map((animal) => (
                <div
                  key={animal.id}
                  className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50/40 p-4 transition-all hover:bg-red-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-700 font-bold text-sm">
                      {animal.riskScore}%
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{animal.name}</p>
                      <p className="text-xs text-slate-500">
                        Temp: <strong className="text-slate-800">{animal.temperature}°C</strong> • Activity:{' '}
                        <strong className="text-slate-800">{animal.activity} index</strong>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <RiskBadge level={animal.riskLevel} size="sm" />
                    <Link
                      to={`/animals/${animal.id}`}
                      className="rounded-lg bg-white p-2 text-slate-600 shadow-xs hover:bg-slate-100"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 py-4 text-center">No high-risk animals detected.</p>
            )}
          </div>
        </Card>

        {/* Recent Warning Alerts */}
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900">Recent Early Warning Alerts</h3>
            <Link to="/alerts" className="text-xs font-semibold text-emerald-600 hover:underline">
              Alert Center →
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {recentAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
