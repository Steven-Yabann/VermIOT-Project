export const SENSORS = {
  moisture: {
    label: 'Moisture',
    unit: '%',
    optimal: { min: 70, max: 85 },
    acceptable: { min: 60, max: 92 },
    chartColor: '#3b82f6',
    icon: '💧',
  },
  temperature: {
    label: 'Temperature',
    unit: '°C',
    optimal: { min: 15, max: 25 },
    acceptable: { min: 10, max: 35 },
    chartColor: '#f97316',
    icon: '🌡️',
  },
  ph: {
    label: 'pH',
    unit: '',
    optimal: { min: 6.5, max: 7.5 },
    acceptable: { min: 5.5, max: 8.5 },
    chartColor: '#a855f7',
    icon: '⚗️',
  },
  gasIndex: {
    label: 'Gas Index',
    unit: '',
    optimal: { min: 0, max: 300 },
    acceptable: { min: 0, max: 500 },
    chartColor: '#14b8a6',
    icon: '💨',
  },
}

export const SENSOR_KEYS = ['moisture', 'temperature', 'ph', 'gasIndex']

export function getSensorStatus(key, value) {
  const s = SENSORS[key]
  if (!s || value == null) return 'unknown'
  const { optimal, acceptable } = s
  if (value >= optimal.min && value <= optimal.max) return 'optimal'
  if (value >= acceptable.min && value <= acceptable.max) return 'acceptable'
  return 'danger'
}

export function getHarvestReadiness(latest) {
  if (!latest) return 'unknown'
  const statuses = SENSOR_KEYS.map(k => getSensorStatus(k, latest[k]))
  if (statuses.some(s => s === 'danger')) return 'not-ready'
  if (statuses.every(s => s === 'optimal')) return 'ready'
  return 'approaching'
}

export const READINESS_CONFIG = {
  ready:      { label: 'Ready',      color: 'bg-green-100 text-green-800',  dot: 'bg-green-500' },
  approaching:{ label: 'Approaching',color: 'bg-amber-100 text-amber-800',  dot: 'bg-amber-500' },
  'not-ready':{ label: 'Not Ready',  color: 'bg-red-100 text-red-800',      dot: 'bg-red-500'   },
  unknown:    { label: 'No Data',    color: 'bg-gray-100 text-gray-500',    dot: 'bg-gray-400'  },
}

export const STATUS_COLORS = {
  optimal:    { text: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200' },
  acceptable: { text: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  danger:     { text: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200'   },
  unknown:    { text: 'text-gray-500',   bg: 'bg-gray-50',   border: 'border-gray-200'  },
}
