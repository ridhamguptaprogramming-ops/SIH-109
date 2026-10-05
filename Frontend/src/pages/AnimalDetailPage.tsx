import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../services/api'
import { Animal } from '../types'
import { RiskBadge } from '../components/ui/RiskBadge'
import { MetricCard } from '../components/ui/MetricCard'
import { Card } from '../components/ui/Card'
import { LoadingState } from '../components/ui/LoadingState'
import { EmptyState } from '../components/ui/EmptyState'
import {
  ArrowLeft,
  Thermometer,
  Heart,
  Activity,
  Droplets,
  AlertCircle,
  CheckCircle2,
  Clock,
  Info,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'

export const AnimalDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [animal, setAnimal] = useState<Animal | null>(null)

  useEffect(() => {
    if (!id) return
    const fetchAnimal = async () => {
      setLoading(true)
      try {
        const data = await api.getAnimal(id)
        setAnimal(data || null)
      } catch (err) {
        console.error('Failed to load animal detail:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAnimal()
  }, [id])

  if (loading) {
    return <LoadingState message="Retrieving animal sensor logs and risk analysis..." />
  }

  if (!animal) {
    return (
      <div className="space-y-6">
        <Link
          to="/animals"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Herd Registry
        </Link>
        <EmptyState
          title="Animal Profile Not Found"
          description={`No registered bovine profile matches ID '${id}'.`}
          action={
            <Link
              to="/animals"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
            >
              Return to Herd Registry
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Header Navigation & Meta */}
      <div>
        <Link
          to="/animals"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Herd Registry
        </Link>
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{animal.name}</h1>
              <RiskBadge level={animal.riskLevel} size="lg" />
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              ID Tag: <strong className="text-slate-800">{animal.id}</strong> • Breed:{' '}
              <strong className="text-slate-800">{animal.breed}</strong> • Age:{' '}
              <strong className="text-slate-800">{animal.age} Years</strong> • Location:{' '}
              <strong className="text-slate-800">{animal.farm}</strong>
            </p>
          </div>
          <div className="text-left sm:text-right border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
            <p className="text-xs text-slate-400">Last Telemetry Sync</p>
            <p className="text-xs font-semibold text-slate-700 mt-0.5">
              {new Date(animal.lastUpdated).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Sensor Metric Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Body Temperature"
          value={animal.temperature}
          unit="°C"
          status={animal.temperature > 39.3 ? 'critical' : animal.temperature > 39.0 ? 'elevated' : 'normal'}
          icon={<Thermometer className="h-5 w-5 text-amber-500" />}
          subtitle="Baseline ~38.5°C"
        />
        <MetricCard
          label="Heart Rate"
          value={animal.heartRate}
          unit="bpm"
          status={animal.heartRate > 80 ? 'critical' : animal.heartRate > 75 ? 'elevated' : 'normal'}
          icon={<Heart className="h-5 w-5 text-red-500" />}
          subtitle="Baseline 60-70 bpm"
        />
        <MetricCard
          label="Movement / Activity"
          value={animal.activity}
          unit="index"
          status={animal.activity < 25 ? 'critical' : animal.activity < 40 ? 'elevated' : 'normal'}
          icon={<Activity className="h-5 w-5 text-sky-500" />}
          subtitle="Daily Neck Tag Counter"
        />
        <MetricCard
          label="Milk Conductivity"
          value={animal.milkConductivity}
          unit="mS/cm"
          status={animal.milkConductivity > 6.0 ? 'critical' : animal.milkConductivity > 5.5 ? 'elevated' : 'normal'}
          icon={<Droplets className="h-5 w-5 text-emerald-500" />}
          subtitle="Threshold 5.5 mS/cm"
        />
      </div>

      {/* Risk Analysis & Forecasting Window */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Large Risk Score Display */}
        <Card className="lg:col-span-1 border-emerald-100 bg-slate-900 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                AI Risk Assessment
              </span>
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="mt-6 text-center">
              <div className="inline-flex h-32 w-32 items-center justify-center rounded-full border-4 border-emerald-500/30 bg-slate-800/80 shadow-inner">
                <span className="text-4xl font-extrabold text-emerald-400">{animal.riskScore}%</span>
              </div>
              <h3 className="mt-4 text-xl font-bold tracking-tight">
                {animal.riskLevel} MASTITIS RISK
              </h3>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                <Clock className="h-3.5 w-3.5 text-emerald-400" />
                <span>Forecasting Window: <strong>7–14 Days</strong> Ahead</span>
              </div>
            </div>
          </div>
          <div className="mt-6 border-t border-slate-800 pt-4 text-xs text-slate-400">
            <p>Model Confidence: High (Fused Sensor Ensemble)</p>
          </div>
        </Card>

        {/* Identified Risk Factors & Actionable Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Risk Factors */}
          <Card>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <h3 className="font-bold text-slate-900">Identified Risk Indicators</h3>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {animal.riskFactors && animal.riskFactors.length > 0 ? (
                animal.riskFactors.map((factor, idx) => (
                  <li key={idx} className="flex items-start gap-2 rounded-lg bg-amber-50/60 p-3 text-amber-900 border border-amber-100">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                    <span>{factor}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-slate-500">No abnormal risk factors detected for this animal.</li>
              )}
            </ul>
          </Card>

          {/* Actionable Veterinary Recommendations */}
          <Card>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Stethoscope className="h-5 w-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900">Actionable Intervention Steps</h3>
            </div>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-700">
              {animal.recommendations && animal.recommendations.length > 0 ? (
                animal.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 rounded-lg bg-emerald-50/60 p-3 text-emerald-900 border border-emerald-100">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-slate-500">Standard herd care and monitoring.</li>
              )}
            </ul>
          </Card>
        </div>
      </div>

      {/* Sensor Health Timeline */}
      <Card>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900">Health & Telemetry Event Timeline</h3>
          <span className="text-xs text-slate-500">Recent IoT Readings</span>
        </div>
        <div className="mt-4 space-y-3">
          {animal.healthHistory.map((evt) => (
            <div
              key={evt.id}
              className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    evt.status === 'critical'
                      ? 'bg-red-500'
                      : evt.status === 'elevated'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />
                <div>
                  <p className="font-semibold text-slate-800 capitalize">
                    {evt.type.replace('_', ' ')}: {evt.value} {evt.unit}
                  </p>
                  <p className="text-slate-400">{new Date(evt.timestamp).toLocaleString()}</p>
                </div>
              </div>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                  evt.status === 'critical'
                    ? 'bg-red-100 text-red-700'
                    : evt.status === 'elevated'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {evt.status}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Mandatory Prototype Disclaimer */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-800 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Prototype Decision Support Disclaimer</p>
          <p className="mt-0.5 text-blue-700">
            Pashu Mitra is a research prototype platform designed for early decision support and subclinical risk forecasting.
            Calculated risk scores and alerts do not replace professional veterinary diagnosis or clinical CMT testing.
          </p>
        </div>
      </div>
    </div>
  )
}
