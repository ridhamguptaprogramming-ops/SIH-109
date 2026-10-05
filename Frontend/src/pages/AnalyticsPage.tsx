import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { AnalyticsData, DashboardStats, Animal } from '../types'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { RiskChart } from '../components/charts/RiskChart'
import { TrendChart } from '../components/charts/TrendChart'
import { LoadingState } from '../components/ui/LoadingState'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Thermometer, Activity, Droplets } from 'lucide-react'

export const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [animals, setAnimals] = useState<Animal[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [analyticsRes, statsRes, animalsRes] = await Promise.all([
          api.getAnalytics(),
          api.getDashboardStats(),
          api.getAnimals(),
        ])
        setAnalytics(analyticsRes)
        setStats(statsRes)
        setAnimals(animalsRes)
      } catch (err) {
        console.error('Failed to load analytics:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading || !analytics || !stats) {
    return <LoadingState message="Computing herd epidemiological trends & multi-parameter correlations..." />
  }

  // Data for High-Risk Animal Comparison Bar Chart
  const comparisonData = animals.map((a) => ({
    name: a.name.split(' ')[0], // first name for chart label
    id: a.id,
    riskScore: a.riskScore,
    temperature: a.temperature,
    conductivity: a.milkConductivity,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Epidemiological & Herd Analytics"
        description="Multi-parametric correlation analysis of temperature, movement, and milk electrical conductivity."
      />

      {/* Top 2 Primary Summary Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Risk Distribution Chart */}
        <Card className="lg:col-span-1">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900">1. Overall Risk Distribution</h3>
          </div>
          <div className="mt-4">
            <RiskChart low={stats.lowRisk} medium={stats.mediumRisk} high={stats.highRisk} />
          </div>
        </Card>

        {/* 7-Day Risk Score Trend */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-red-500" />
              <h3 className="font-bold text-slate-900">2. 7-Day Herd Risk Trend</h3>
            </div>
            <span className="text-xs text-slate-500">Aggregate Mastitis Index</span>
          </div>
          <div className="mt-4">
            <TrendChart data={analytics} type="risk" />
          </div>
        </Card>
      </div>

      {/* Sub-parameter Trend Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Temperature Trend */}
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-amber-500" />
              <h3 className="font-bold text-slate-900">3. Average Body Temperature Trend</h3>
            </div>
            <span className="text-xs text-slate-500">°C vs Days</span>
          </div>
          <div className="mt-4">
            <TrendChart data={analytics} type="temperature" />
          </div>
        </Card>

        {/* Activity Index Trend */}
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-sky-500" />
              <h3 className="font-bold text-slate-900">4. Daily Movement & Rumination Index</h3>
            </div>
            <span className="text-xs text-slate-500">Sensor Counts</span>
          </div>
          <div className="mt-4">
            <TrendChart data={analytics} type="activity" />
          </div>
        </Card>
      </div>

      {/* High-Risk Animal Cross-Comparison Bar Chart */}
      <Card>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900">5. Bovine Mastitis Risk Score Comparison</h3>
          </div>
          <span className="text-xs text-slate-500">Individual Animal Breakdown (%)</span>
        </div>
        <div className="mt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '8px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="riskScore" name="Risk Score (%)" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
