import { SENSORS, getSensorStatus, STATUS_COLORS } from '../utils/thresholds'

export default function SensorReading({ sensorKey, value }) {
  const sensor = SENSORS[sensorKey]
  const status = getSensorStatus(sensorKey, value)
  const colors = STATUS_COLORS[status]

  const displayValue = value != null
    ? `${value}${sensor.unit}`
    : '—'

  return (
    <div className={`flex items-center justify-between rounded-lg px-3 py-2 border ${colors.bg} ${colors.border}`}>
      <div className="flex items-center gap-2">
        <span className="text-base">{sensor.icon}</span>
        <span className="text-xs font-medium text-gray-600">{sensor.label}</span>
      </div>
      <span className={`text-sm font-bold tabular-nums ${colors.text}`}>
        {displayValue}
      </span>
    </div>
  )
}
