import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { LiveMonitoringData } from '../types'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { RiskBadge } from '../components/ui/RiskBadge'
import { MetricCard } from '../components/ui/MetricCard'
import { LoadingState } from '../components/ui/LoadingState'
import {
  Cpu,
  Wifi,
  Thermometer,
  Heart,
  Activity,
  Droplets,
  RefreshCw,
  Info,
  Clock,
} from 'lucide-react'

export const LiveMonitoringPage = () => {
  const [loading, setLoading] = useState(true)
  const [liveData, setLiveData] = useState<LiveMonitoringData | null>(null)
  const [simulating, setSimulating] = useState(false)

  const fetchLive = async () => {
    setLoading(true)
    try {
      const data = await api.getLiveMonitoring()
      setLiveData(data)
    } catch (err) {
      console.error('Failed to load live telemetry:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLive()
  }, [])

  // Simulate a live telemetry ping for demo purposes
  const handleSimulatePing = () => {
    if (!liveData) return
    setSimulating(true)
    setTimeout(() => {
      setLiveData((prev) => {
        if (!prev) return null
        const newTemp = Number((prev.temperature + (Math.random() * 0.2 - 0.1)).toFixed(1))
        const newCond = Number((prev.conductivity + (Math.random() * 0.1 - 0.05)).toFixed(1))
        return {
          ...prev,
          temperature: newTemp,
          conductivity: newCond,
          lastUpdated: 'Just now (' + new Date().toLocaleTimeString() + ')',
          readingsHistory: [
            ...prev.readingsHistory.slice(1),
            {
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              temperature: newTemp,
              activity: prev.activity,
              milkConductivity: newCond,
            },
          ],
        }
      })
      setSimulating(false)
    }, 400)
  }

  if (loading || !liveData) {
    return <LoadingState message="Connecting to ESP32 prototype node telemetry stream..." />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live IoT Hardware Telemetry Stream"
        description="ESP32 Microcontroller prototype feed simulating neck-tag collar sensors and teat-cup conductivity probes."
        action={
          <button
            onClick={handleSimulatePing}
            disabled={simulating}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-sky-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${simulating ? 'animate-spin' : ''}`} />
            <span>{simulating ? 'Simulating Telemetry...' : 'Simulate IoT Ping'}</span>
          </button>
        }
      />

      {/* Device Connection Status Header */}
      <div className="flex flex-col gap-4 rounded-xl border border-sky-200 bg-sky-900 text-white p-6 shadow-md sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-800 text-sky-300">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">Node ID: {liveData.deviceId}</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                <Wifi className="h-3 w-3 animate-pulse" /> {liveData.status}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-sky-200">
              Active Animal Collar: <strong className="text-white">{liveData.animalName}</strong> ({liveData.animalId})
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right border-t sm:border-t-0 border-sky-800 pt-3 sm:pt-0 text-xs">
          <p className="text-sky-300">Target Bovine Risk Assessment</p>
          <div className="mt-1 flex items-center gap-2 sm:justify-end">
            <RiskBadge level={liveData.riskLevel} size="md" />
            <span className="text-lg font-extrabold text-white">{liveData.riskScore}% Risk</span>
          </div>
        </div>
      </div>

      {/* 4 Sensor Metric Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Sensor 1: Body Temp"
          value={liveData.temperature}
          unit="°C"
          status={liveData.temperature > 39.3 ? 'critical' : liveData.temperature > 39.0 ? 'elevated' : 'normal'}
          icon={<Thermometer className="h-5 w-5 text-amber-500" />}
          subtitle={`Updated ${liveData.lastUpdated}`}
        />
        <MetricCard
          label="Sensor 2: Heart Rate"
          value={liveData.heartRate}
          unit="bpm"
          status={liveData.heartRate > 80 ? 'critical' : 'normal'}
          icon={<Heart className="h-5 w-5 text-red-500" />}
          subtitle="Pulse Oximeter Node"
        />
        <MetricCard
          label="Sensor 3: MPU6050 Activity"
          value={liveData.activity}
          unit="count/min"
          status={liveData.activity < 25 ? 'critical' : 'normal'}
          icon={<Activity className="h-5 w-5 text-sky-500" />}
          subtitle="3-Axis Accelerometer"
        />
        <MetricCard
          label="Sensor 4: Conductivity"
          value={liveData.conductivity}
          unit="mS/cm"
          status={liveData.conductivity > 6.0 ? 'critical' : liveData.conductivity > 5.5 ? 'elevated' : 'normal'}
          icon={<Droplets className="h-5 w-5 text-emerald-500" />}
          subtitle="Milk Electrode Sensor"
        />
      </div>

      {/* Sensor Data Stream / History Table */}
      <Card>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-500" />
            <h3 className="font-bold text-slate-900">Live Telemetry Packet History</h3>
          </div>
          <span className="text-xs text-slate-500">5-Second Sampling Buffer</span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Temperature (°C)</th>
                <th className="px-4 py-3">Activity Index</th>
                <th className="px-4 py-3">Milk Conductivity (mS/cm)</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {liveData.readingsHistory.map((reading, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-sans font-medium">{reading.time}</td>
                  <td className="px-4 py-2.5 font-bold text-amber-600">{reading.temperature}°C</td>
                  <td className="px-4 py-2.5">{reading.activity}</td>
                  <td className="px-4 py-2.5 font-bold text-emerald-600">{reading.milkConductivity} mS/cm</td>
                  <td className="px-4 py-2.5 font-sans">
                    <span className="inline-block rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      RECEIVED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Wokwi / ESP32 Prototype Notice */}
      <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-xs text-sky-800 flex items-start gap-3">
        <Info className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Hardware Integration Architecture Note</p>
          <p className="mt-0.5 text-sky-700">
            This live monitoring screen is powered by a client-side mock telemetry service simulating an ESP32 hardware node.
            In production, this module connects via WebSocket/MQTT to ingest real sensor packets from Wokwi / physical ESP32 microcontrollers.
          </p>
        </div>
      </div>
    </div>
  )
}
