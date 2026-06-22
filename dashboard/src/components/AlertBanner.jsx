import { SENSORS } from '../utils/thresholds'

export default function AlertBanner({ alerts, onSelectBed }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <span className="text-red-500 text-xl mt-0.5">⚠️</span>
        <div className="flex-1 min-w-0">
          <p className="text-red-800 font-semibold text-sm mb-2">
            {alerts.length} sensor threshold breach{alerts.length !== 1 ? 'es' : ''} detected
          </p>
          <div className="flex flex-wrap gap-2">
            {alerts.map((alert, i) => {
              const sensor = SENSORS[alert.sensorKey]
              return (
                <button
                  key={i}
                  onClick={() => onSelectBed(alert.bedId)}
                  className="bg-red-100 hover:bg-red-200 text-red-800 text-xs font-medium px-3 py-1 rounded-full transition-colors"
                >
                  {sensor?.icon} {alert.bedName} — {sensor?.label}{' '}
                  {alert.value != null ? `(${alert.value}${sensor?.unit})` : ''}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
