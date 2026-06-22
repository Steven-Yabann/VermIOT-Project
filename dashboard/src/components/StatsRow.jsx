const cards = [
  { key: 'total',      label: 'Total Beds',   color: 'bg-white border-gray-200',    text: 'text-gray-800' },
  { key: 'ready',      label: 'Ready',        color: 'bg-green-50 border-green-200', text: 'text-green-700' },
  { key: 'approaching',label: 'Approaching',  color: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
  { key: 'alerts',     label: 'Active Alerts',color: 'bg-red-50 border-red-200',    text: 'text-red-700' },
]

export default function StatsRow({ stats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {cards.map(({ key, label, color, text }) => (
        <div key={key} className={`${color} border rounded-xl p-4 text-center shadow-sm`}>
          <p className={`text-3xl font-bold ${text}`}>{stats[key]}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">{label}</p>
        </div>
      ))}
    </div>
  )
}
