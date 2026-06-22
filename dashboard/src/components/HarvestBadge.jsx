import { READINESS_CONFIG } from '../utils/thresholds'

export default function HarvestBadge({ readiness, size = 'sm' }) {
  const config = READINESS_CONFIG[readiness] || READINESS_CONFIG.unknown
  const padding = size === 'lg' ? 'px-4 py-1.5 text-sm' : 'px-2.5 py-0.5 text-xs'

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${config.color} ${padding}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}
