import type {
  Animal,
  Alert,
  DashboardStats,
  LiveMonitoringData,
  AnalyticsData,
} from '../types'

// ============================================================
// MOCK ANIMALS — realistic bovine herd data
// ============================================================

export const MOCK_ANIMALS: Animal[] = [
  {
    id: 'PM-1001',
    name: 'Gauri (Tag #101)',
    breed: 'Gir (Indigenous)',
    age: 4,
    farm: 'Dairy Shed A - Anand',
    temperature: 38.6,
    heartRate: 64,
    activity: 52,
    milkConductivity: 4.8,
    riskScore: 12,
    riskLevel: 'LOW',
    lastUpdated: '2026-10-05T14:45:00Z',
    healthHistory: [
      { id: 'h1', timestamp: '2026-10-05T06:00:00Z', type: 'temperature', value: 38.5, unit: '°C', status: 'normal' },
      { id: 'h2', timestamp: '2026-10-05T06:00:00Z', type: 'activity', value: 55, unit: 'index', status: 'normal' },
      { id: 'h3', timestamp: '2026-10-05T06:00:00Z', type: 'conductivity', value: 4.7, unit: 'mS/cm', status: 'normal' },
    ],
    riskFactors: ['Normal baseline parameters'],
    recommendations: ['Routine milking and feeding', 'Standard bi-daily monitoring'],
  },
  {
    id: 'PM-1002',
    name: 'Bella (Tag #102)',
    breed: 'Holstein-Friesian Cross',
    age: 5,
    farm: 'Dairy Shed A - Anand',
    temperature: 39.8,
    heartRate: 84,
    activity: 24,
    milkConductivity: 6.4,
    riskScore: 86,
    riskLevel: 'HIGH',
    lastUpdated: '2026-10-05T15:10:00Z',
    healthHistory: [
      { id: 'h4', timestamp: '2026-10-04T18:00:00Z', type: 'temperature', value: 39.1, unit: '°C', status: 'elevated' },
      { id: 'h5', timestamp: '2026-10-05T06:00:00Z', type: 'activity', value: 30, unit: 'index', status: 'elevated' },
      { id: 'h6', timestamp: '2026-10-05T12:00:00Z', type: 'conductivity', value: 6.4, unit: 'mS/cm', status: 'critical' },
      { id: 'h7', timestamp: '2026-10-05T15:00:00Z', type: 'temperature', value: 39.8, unit: '°C', status: 'critical' },
    ],
    riskFactors: [
      'Elevated body temperature (+1.3°C above normal)',
      'Significant reduction in daily rumination/activity (-54%)',
      'Abnormal electrical conductivity in milk (>6.0 mS/cm)',
    ],
    recommendations: [
      'Isolate animal and perform immediate quarter-milk CMT check',
      'Conduct clinical inspection for teat inflammation or udder swelling',
      'Monitor milk parameters during upcoming milking cycle',
      'Consult farm veterinarian for early subclinical mastitis intervention',
    ],
  },
  {
    id: 'PM-1003',
    name: 'Lakshmi (Tag #103)',
    breed: 'Sahiwal',
    age: 3,
    farm: 'Dairy Shed B - Karnal',
    temperature: 39.2,
    heartRate: 76,
    activity: 36,
    milkConductivity: 5.7,
    riskScore: 54,
    riskLevel: 'MEDIUM',
    lastUpdated: '2026-10-05T14:55:00Z',
    healthHistory: [
      { id: 'h8', timestamp: '2026-10-04T12:00:00Z', type: 'temperature', value: 38.8, unit: '°C', status: 'normal' },
      { id: 'h9', timestamp: '2026-10-05T06:00:00Z', type: 'conductivity', value: 5.7, unit: 'mS/cm', status: 'elevated' },
      { id: 'h10', timestamp: '2026-10-05T12:00:00Z', type: 'activity', value: 36, unit: 'index', status: 'elevated' },
    ],
    riskFactors: [
      'Slight increase in milk electrical conductivity',
      'Moderate drop in activity during morning grazing',
    ],
    recommendations: [
      'Keep under targeted observation for 24–48 hours',
      'Verify udder hygiene before and after milking',
      'Re-check milk conductivity trends tomorrow',
    ],
  },
  {
    id: 'PM-1004',
    name: 'Ganga (Tag #104)',
    breed: 'Murrah Buffalo',
    age: 6,
    farm: 'Dairy Shed B - Karnal',
    temperature: 38.4,
    heartRate: 60,
    activity: 58,
    milkConductivity: 4.6,
    riskScore: 9,
    riskLevel: 'LOW',
    lastUpdated: '2026-10-05T14:30:00Z',
    healthHistory: [
      { id: 'h11', timestamp: '2026-10-05T06:00:00Z', type: 'temperature', value: 38.4, unit: '°C', status: 'normal' },
      { id: 'h12', timestamp: '2026-10-05T06:00:00Z', type: 'activity', value: 58, unit: 'index', status: 'normal' },
    ],
    riskFactors: ['No abnormal factors detected'],
    recommendations: ['Routine monitoring', 'Maintain normal feeding schedule'],
  },
  {
    id: 'PM-1005',
    name: 'Kamadhenu (Tag #105)',
    breed: 'Jersey Cross',
    age: 4,
    farm: 'Dairy Shed A - Anand',
    temperature: 39.9,
    heartRate: 88,
    activity: 20,
    milkConductivity: 7.1,
    riskScore: 91,
    riskLevel: 'HIGH',
    lastUpdated: '2026-10-05T15:15:00Z',
    healthHistory: [
      { id: 'h13', timestamp: '2026-10-04T12:00:00Z', type: 'temperature', value: 39.4, unit: '°C', status: 'elevated' },
      { id: 'h14', timestamp: '2026-10-05T06:00:00Z', type: 'conductivity', value: 6.8, unit: 'mS/cm', status: 'critical' },
      { id: 'h15', timestamp: '2026-10-05T12:00:00Z', type: 'temperature', value: 39.9, unit: '°C', status: 'critical' },
      { id: 'h16', timestamp: '2026-10-05T15:15:00Z', type: 'activity', value: 20, unit: 'index', status: 'critical' },
    ],
    riskFactors: [
      'High fever detected (39.9°C)',
      'Severe milk conductivity spike (7.1 mS/cm)',
      'Lethargy & low movement detected by IoT sensor tag',
    ],
    recommendations: [
      'Immediate veterinary clinical evaluation required',
      'Sanitize milking equipment and segregate milk yield',
      'Apply anti-inflammatory / prescribed treatment under vet supervision',
    ],
  },
  {
    id: 'PM-1006',
    name: 'Radha (Tag #106)',
    breed: 'Tharparkar',
    age: 3,
    farm: 'Dairy Shed C - Hisar',
    temperature: 38.9,
    heartRate: 71,
    activity: 44,
    milkConductivity: 5.3,
    riskScore: 28,
    riskLevel: 'MEDIUM',
    lastUpdated: '2026-10-05T13:50:00Z',
    healthHistory: [
      { id: 'h17', timestamp: '2026-10-05T06:00:00Z', type: 'temperature', value: 38.9, unit: '°C', status: 'normal' },
      { id: 'h18', timestamp: '2026-10-05T06:00:00Z', type: 'activity', value: 44, unit: 'index', status: 'normal' },
    ],
    riskFactors: ['Minor conductivity deviation'],
    recommendations: ['Monitor during next two milking shifts'],
  },
]

// ============================================================
// MOCK ALERTS
// ============================================================

export const MOCK_ALERTS: Alert[] = [
  {
    id: 'ALT-101',
    animalId: 'PM-1005',
    type: 'mastitis',
    severity: 'HIGH',
    message: 'High Mastitis Risk for Kamadhenu (Tag #105) — Temp: 39.9°C, Conductivity: 7.1 mS/cm',
    timestamp: '2026-10-05T15:15:00Z',
    read: false,
  },
  {
    id: 'ALT-102',
    animalId: 'PM-1002',
    type: 'mastitis',
    severity: 'HIGH',
    message: 'Subclinical Mastitis Warning for Bella (Tag #102) — Risk score reached 86%',
    timestamp: '2026-10-05T15:10:00Z',
    read: false,
  },
  {
    id: 'ALT-103',
    animalId: 'PM-1003',
    type: 'anomaly',
    severity: 'MEDIUM',
    message: 'Conductivity anomaly detected in milk sample from Lakshmi (Tag #103)',
    timestamp: '2026-10-05T14:55:00Z',
    read: true,
  },
  {
    id: 'ALT-104',
    animalId: 'PM-1006',
    type: 'anomaly',
    severity: 'MEDIUM',
    message: 'Activity level decreased by 22% for Radha (Tag #106)',
    timestamp: '2026-10-05T13:50:00Z',
    read: true,
  },
  {
    id: 'ALT-105',
    animalId: 'PM-1001',
    type: 'system',
    severity: 'LOW',
    message: 'IoT Sensor Node ESP32-001 heart rate telemetry synced successfully',
    timestamp: '2026-10-05T12:00:00Z',
    read: true,
  },
]

// ============================================================
// MOCK DASHBOARD STATISTICS
// ============================================================

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalAnimals: MOCK_ANIMALS.length,
  highRisk: MOCK_ANIMALS.filter((a) => a.riskLevel === 'HIGH').length,
  mediumRisk: MOCK_ANIMALS.filter((a) => a.riskLevel === 'MEDIUM').length,
  lowRisk: MOCK_ANIMALS.filter((a) => a.riskLevel === 'LOW').length,
  totalAlerts: MOCK_ALERTS.length,
  criticalAlerts: MOCK_ALERTS.filter((a) => a.severity === 'HIGH').length,
}

// ============================================================
// MOCK LIVE MONITORING DATA
// ============================================================

export const MOCK_LIVE_MONITORING: LiveMonitoringData = {
  deviceId: 'ESP32-NODE-001',
  status: 'CONNECTED',
  animalId: 'PM-1002',
  animalName: 'Bella (Tag #102)',
  temperature: 39.8,
  heartRate: 84,
  activity: 24,
  conductivity: 6.4,
  riskScore: 86,
  riskLevel: 'HIGH',
  lastUpdated: 'Just now',
  readingsHistory: [
    { time: '15:00', temperature: 38.9, activity: 42, milkConductivity: 5.2 },
    { time: '15:05', temperature: 39.1, activity: 38, milkConductivity: 5.5 },
    { time: '15:10', temperature: 39.4, activity: 31, milkConductivity: 5.9 },
    { time: '15:15', temperature: 39.6, activity: 27, milkConductivity: 6.2 },
    { time: '15:20', temperature: 39.8, activity: 24, milkConductivity: 6.4 },
  ],
}

// ============================================================
// MOCK ANALYTICS DATA (7-day trend)
// ============================================================

export const MOCK_ANALYTICS: AnalyticsData = {
  dates: ['Sep 29', 'Sep 30', 'Oct 01', 'Oct 02', 'Oct 03', 'Oct 04', 'Oct 05'],
  temperatures: [38.5, 38.6, 38.7, 38.9, 39.2, 39.5, 39.8],
  activities: [54, 52, 49, 43, 35, 28, 24],
  conductivities: [4.7, 4.8, 5.1, 5.4, 5.9, 6.2, 6.4],
  riskScores: [10, 14, 22, 38, 58, 74, 86],
  highRiskCount: [0, 0, 1, 1, 2, 2, 2],
}