export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export interface HealthEvent {
  id: string
  timestamp: string
  type: 'temperature' | 'activity' | 'conductivity' | 'heart_rate'
  value: number
  unit: string
  threshold?: number
  status: 'normal' | 'elevated' | 'critical'
}

export interface Animal {
  id: string
  name: string
  breed: string
  age: number
  farm: string
  temperature: number
  heartRate: number
  activity: number
  milkConductivity: number
  riskScore: number
  riskLevel: RiskLevel
  lastUpdated: string
  healthHistory: HealthEvent[]
  riskFactors?: string[]
  recommendations?: string[]
}

export interface Alert {
  id: string
  animalId: string
  type: 'mastitis' | 'anomaly' | 'system'
  severity: RiskLevel
  message: string
  timestamp: string
  read: boolean
}

export interface DashboardStats {
  totalAnimals: number
  highRisk: number
  mediumRisk: number
  lowRisk: number
  totalAlerts: number
  criticalAlerts: number
}

export interface LiveMonitoringData {
  deviceId: string
  status: 'CONNECTED' | 'DISCONNECTED'
  animalId: string
  animalName: string
  temperature: number
  heartRate: number
  activity: number
  milkConductivity: number
  riskScore: number
  riskLevel: RiskLevel
  lastUpdated: string
  readingsHistory: Array<{
    time: string
    temperature: number
    activity: number
    milkConductivity: number
  }>
}

export interface AnalyticsData {
  dates: string[]
  temperatures: number[]
  activities: number[]
  conductivities: number[]
  riskScores: number[]
  highRiskCount: number[]
}