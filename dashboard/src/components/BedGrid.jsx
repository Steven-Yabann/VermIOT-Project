import BedCard from './BedCard'

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="h-5 bg-gray-200 rounded w-24" />
        <div className="h-5 bg-gray-200 rounded w-16" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-10 bg-gray-100 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export default function BedGrid({ beds, loading, onSelectBed }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (beds.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-5xl mb-4">🪱</p>
        <p className="font-medium">No beds found</p>
        <p className="text-sm mt-1">Sensor data will appear here once the ESP32 starts publishing.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {beds.map(bed => (
        <BedCard
          key={bed.id}
          bed={bed}
          onSelect={() => onSelectBed(bed.id)}
        />
      ))}
    </div>
  )
}
