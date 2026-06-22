export default function Header({ stats }) {
  const isMock = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  return (
    <header className="bg-brand-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🪱</span>
          <div>
            <h1 className="text-xl font-bold tracking-tight">VermIoT</h1>
            <p className="text-brand-200 text-xs">Intelligent Vermiculture Monitoring</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          {isMock && (
            <span className="bg-amber-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              DEMO MODE
            </span>
          )}
          <span className="text-brand-200">
            {stats.total} bed{stats.total !== 1 ? 's' : ''} monitored
          </span>
          <span className="hidden sm:inline text-brand-300">|</span>
          <span className="hidden sm:inline text-brand-100">
            {stats.ready} ready · {stats.approaching} approaching
          </span>
          {stats.alerts > 0 && (
            <>
              <span className="text-brand-300">|</span>
              <span className="text-red-300 font-semibold">
                ⚠ {stats.alerts} alert{stats.alerts !== 1 ? 's' : ''}
              </span>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
