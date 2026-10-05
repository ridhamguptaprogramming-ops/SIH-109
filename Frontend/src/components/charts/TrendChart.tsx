import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { AnalyticsData } from '../../types'

interface TrendChartProps {
  data: AnalyticsData
  type?: 'risk' | 'temperature' | 'activity' | 'conductivity' | 'all'
}

export const TrendChart = ({ data, type = 'risk' }: TrendChartProps) => {
  // Format data array for Recharts
  const chartData = data.dates.map((date, idx) => ({
    date,
    riskScore: data.riskScores[idx],
    temperature: data.temperatures[idx],
    activity: data.activities[idx],
    conductivity: data.conductivities[idx],
    highRiskCount: data.highRiskCount[idx],
  }))

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderRadius: '8px',
              border: 'none',
              color: '#fff',
              fontSize: '12px',
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            height={36}
            formatter={(value) => <span className="text-xs font-semibold text-slate-700">{value}</span>}
          />
          {(type === 'risk' || type === 'all') && (
            <Line
              type="monotone"
              dataKey="riskScore"
              name="Avg Risk Score (%)"
              stroke="#ef4444"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#ef4444' }}
              activeDot={{ r: 6 }}
            />
          )}
          {(type === 'temperature' || type === 'all') && (
            <Line
              type="monotone"
              dataKey="temperature"
              name="Temperature (°C)"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          )}
          {(type === 'activity' || type === 'all') && (
            <Line
              type="monotone"
              dataKey="activity"
              name="Activity Index"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          )}
          {(type === 'conductivity' || type === 'all') && (
            <Line
              type="monotone"
              dataKey="conductivity"
              name="Milk Conductivity (mS/cm)"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
