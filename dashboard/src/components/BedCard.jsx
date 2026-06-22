import { format, parseISO } from 'date-fns'
import { SENSOR_KEYS } from '../utils/thresholds'
import HarvestBadge from './HarvestBadge'
import SensorReading from './SensorReading'

export default function BedCard({ bed, onSelect }) {
  const { info, latest, readiness } = bed
  const name = info?.name || bed.id

  const lastSeen = latest?.timestamp
    ? format(new Date(latest.timestamp), 'HH:mm')
    : null

  const maturity = info?.estimatedMaturity
    ? format(parseISO(info.estimatedMaturity), 'dd MMM yyyy')
    : null

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
          {maturity && (
            <p className="text-xs text-gray-400 mt-0.5">Est. maturity: {maturity}</p>
          )}
        </div>
        <HarvestBadge readiness={readiness} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {SENSOR_KEYS.map(key => (
          <SensorReading key={key} sensorKey={key} value={latest?.[key]} />
        ))}
      </div>

      <div className="flex items-center justify-between">
        {lastSeen ? (
          <p className="text-xs text-gray-400">Last reading: {lastSeen}</p>
        ) : (
          <p className="text-xs text-gray-400 italic">No data yet</p>
        )}
        <button
          className="text-xs text-brand-700 font-medium hover:underline"
          onClick={e => { e.stopPropagation(); onSelect() }}
        >
          View details →
        </button>
      </div>
    </div>
  )
}
