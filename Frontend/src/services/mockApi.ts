import type {
  Animal,
  Alert,
  DashboardStats,
  LiveMonitoringData,
  AnalyticsData,
} from '../types'
import {
  MOCK_ANIMALS,
  MOCK_ALERTS,
  MOCK_DASHBOARD_STATS,
  MOCK_LIVE_MONITORING,
  MOCK_ANALYTICS,
} from '../mock/data'

const MOCK_DELAY = 300

export const mockApi = {
  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY))
    return { ...MOCK_DASHBOARD_STATS }
  },

  // Animals
  getAnimals: async (): Promise<Animal[]> => {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY))
    return [...MOCK_ANIMALS]
  },

  getAnimal: async (id: string): Promise<Animal | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY))
    return MOCK_ANIMALS.find((animal) => animal.id.toLowerCase() === id.toLowerCase() || animal.id.replace('PM-', '') === id)
  },

  // Alerts
  getAlerts: async (): Promise<Alert[]> => {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY))
    return [...MOCK_ALERTS]
  },

  getAlertById: async (id: string): Promise<Alert | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY))
    return MOCK_ALERTS.find((alert) => alert.id === id)
  },

  // Live Monitoring
  getLiveMonitoring: async (): Promise<LiveMonitoringData> => {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY))
    return { ...MOCK_LIVE_MONITORING }
  },

  // Analytics
  getAnalytics: async (): Promise<AnalyticsData> => {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY))
    return { ...MOCK_ANALYTICS }
  },

  // Mark Alert as Read
  acknowledgeAlert: async (id: string): Promise<{ success: boolean; id: string }> => {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY))
    const alert = MOCK_ALERTS.find((a) => a.id === id)
    if (alert) {
      alert.read = true
    }
    return { success: true, id }
  },
}

export type { Animal, Alert, DashboardStats, LiveMonitoringData, AnalyticsData }