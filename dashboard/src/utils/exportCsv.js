import { format } from 'date-fns'

export function exportToCsv(bedName, history) {
  const headers = ['Timestamp', 'Moisture (%)', 'Temperature (°C)', 'pH', 'Gas Index']
  const rows = history.map(r => [
    format(new Date(r.timestamp), 'yyyy-MM-dd HH:mm:ss'),
    r.moisture ?? '',
    r.temperature ?? '',
    r.ph ?? '',
    r.gasIndex ?? '',
  ])

  const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${bedName.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
