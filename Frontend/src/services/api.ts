import { mockApi } from './mockApi'

/**
 * Service Layer Abstraction for Pashu Mitra Frontend.
 * Currently delegating to mockApi.
 * When real backend APIs are developed, backend team can swap out mockApi calls here.
 */
export const api = {
  getDashboardStats: mockApi.getDashboardStats,
  getAnimals: mockApi.getAnimals,
  getAnimal: mockApi.getAnimal,
  getAlerts: mockApi.getAlerts,
  getAlertById: mockApi.getAlertById,
  getLiveMonitoring: mockApi.getLiveMonitoring,
  getAnalytics: mockApi.getAnalytics,
  acknowledgeAlert: mockApi.acknowledgeAlert,
}
