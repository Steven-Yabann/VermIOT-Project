import { useEffect, useState } from 'react'
import { useBedHistory } from '../hooks/useBedHistory'
import { getHarvestReadiness, SENSOR_KEYS } from '../utils/thresholds'
import { exportToCsv } from '../utils/exportCsv'
import HarvestBadge from './HarvestBadge'
import SensorReading from './SensorReading'
import SensorChart from './SensorChart'
import BedManagementForm from './BedManagementForm'

const TABS = ['Overview', 'Charts', 'Manage']

export default function BedDetailModal({ bedId, bed, onClose }) {
  const [tab, setTab] = useState('Overview')
  const { history, loading: histLoading } = useBedHistory(bedId)

  const info      = bed?.info    || {}
  const latest    = bed?.latest  || null
  const readiness = getHarvestReadiness(latest)
  const name      = info.name || bedId

  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white w-full sm:max-w-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <HarvestBadge readiness={readiness} size="lg" />
              {info.estimatedMaturity && (
                <span className="text-xs text-gray-400">Est. maturity: {info.estimatedMaturity}</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none mt-1"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 mr-6 text-sm font-medium border-b-2 transition-colors ${
                tab === t
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-6">

          {/* ── OVERVIEW ── */}
          {tab === 'Overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {SENSOR_KEYS.map(key => (
                  <SensorReading key={key} sensorKey={key} value={latest?.[key]} />
                ))}
              </div>

              {info.notes && (
                <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Notes</p>
                  {info.notes}
                </div>
              )}

              {info.dateSeeded && (
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Seeded: <span className="font-medium text-gray-700">{info.dateSeeded}</span></span>
                  {latest?.timestamp && (
                    <span>Updated: <span className="font-medium text-gray-700">
                      {new Date(latest.timestamp).toLocaleTimeString()}
                    </span></span>
                  )}
                </div>
              )}

              <button
                onClick={() => exportToCsv(name, history)}
                disabled={histLoading || history.length === 0}
                className="w-full mt-2 border border-brand-600 text-brand-700 hover:bg-brand-50 text-sm font-semibold py-2 rounded-lg transition-colors disabled:opacity-40"
              >
                ⬇ Export CSV ({history.length} readings)
              </button>
            </div>
          )}

          {/* ── CHARTS ── */}
          {tab === 'Charts' && (
            <div className="space-y-4">
              {histLoading ? (
                <div className="text-center py-16 text-gray-400">Loading sensor history…</div>
              ) : history.length === 0 ? (
                <div className="text-center py-16 text-gray-400">No history data available yet.</div>
              ) : (
                SENSOR_KEYS.map(key => (
                  <SensorChart key={key} sensorKey={key} history={history} />
                ))
              )}
            </div>
          )}

          {/* ── MANAGE ── */}
          {tab === 'Manage' && (
            <BedManagementForm bedId={bedId} info={info} />
          )}
        </div>
      </div>
    </div>
  )
}
