import { useState } from 'react'
import { useBeds } from './hooks/useBeds'
import { getHarvestReadiness, getSensorStatus, SENSOR_KEYS } from './utils/thresholds'
import Header from './components/Header'
import StatsRow from './components/StatsRow'
import AlertBanner from './components/AlertBanner'
import BedGrid from './components/BedGrid'
import BedDetailModal from './components/BedDetailModal'

export default function App() {
  const { beds, loading, error } = useBeds()
  const [selectedBedId, setSelectedBedId] = useState(null)

  const bedList = Object.entries(beds).map(([id, bed]) => ({
    id,
    ...bed,
    readiness: getHarvestReadiness(bed.latest),
  }))

  const alerts = bedList.flatMap(bed => {
    if (!bed.latest) return []
    return SENSOR_KEYS
      .filter(k => getSensorStatus(k, bed.latest[k]) === 'danger')
      .map(k => ({ bedId: bed.id, bedName: bed.info?.name || bed.id, sensorKey: k, value: bed.latest[k] }))
  })

  const stats = {
    total: bedList.length,
    ready: bedList.filter(b => b.readiness === 'ready').length,
    approaching: bedList.filter(b => b.readiness === 'approaching').length,
    alerts: alerts.length,
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold text-lg">Firebase connection error</p>
          <p className="text-gray-500 mt-1 text-sm">{error.message}</p>
          <p className="text-gray-400 mt-3 text-xs">Check your .env file and Firebase config.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header stats={stats} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 space-y-6">
        {alerts.length > 0 && <AlertBanner alerts={alerts} onSelectBed={setSelectedBedId} />}

        <StatsRow stats={stats} />

        <BedGrid
          beds={bedList}
          loading={loading}
          onSelectBed={setSelectedBedId}
        />
      </main>

      {selectedBedId && (
        <BedDetailModal
          bedId={selectedBedId}
          bed={beds[selectedBedId]}
          onClose={() => setSelectedBedId(null)}
        />
      )}
    </div>
  )
}
