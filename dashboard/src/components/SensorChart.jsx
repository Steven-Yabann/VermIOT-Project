import { Line } from 'react-chartjs-2'
import { format } from 'date-fns'
import { SENSORS } from '../utils/thresholds'

export default function SensorChart({ sensorKey, history }) {
  const sensor = SENSORS[sensorKey]
  const { optimal, chartColor } = sensor

  const labels = history.map(r => format(new Date(r.timestamp), 'HH:mm'))
  const values = history.map(r => r[sensorKey])

  // Optimal range as a shaded band using fill between two flat datasets
  const upperBand = history.map(() => optimal.max)
  const lowerBand = history.map(() => optimal.min)

  const data = {
    labels,
    datasets: [
      {
        label: 'Upper limit',
        data: upperBand,
        borderColor: 'transparent',
        backgroundColor: `${chartColor}22`,
        fill: '+1',
        pointRadius: 0,
        tension: 0,
      },
      {
        label: 'Lower limit',
        data: lowerBand,
        borderColor: 'transparent',
        backgroundColor: 'transparent',
        fill: false,
        pointRadius: 0,
        tension: 0,
      },
      {
        label: `${sensor.label}${sensor.unit ? ` (${sensor.unit})` : ''}`,
        data: values,
        borderColor: chartColor,
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 5,
        tension: 0.3,
        fill: false,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => {
            if (ctx.datasetIndex < 2) return null
            return ` ${sensor.label}: ${ctx.parsed.y}${sensor.unit}`
          },
          title: ctx => `Time: ${ctx[0].label}`,
        },
        filter: item => item.datasetIndex === 2,
      },
    },
    scales: {
      x: {
        grid: { color: '#f3f4f6' },
        ticks: {
          maxTicksLimit: 8,
          font: { size: 11 },
          color: '#9ca3af',
        },
      },
      y: {
        grid: { color: '#f3f4f6' },
        ticks: {
          font: { size: 11 },
          color: '#9ca3af',
          callback: v => `${v}${sensor.unit}`,
        },
      },
    },
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span>{sensor.icon}</span>
        <h4 className="text-sm font-semibold text-gray-700">{sensor.label}</h4>
        <span className="text-xs text-gray-400 ml-auto">
          Optimal: {optimal.min}–{optimal.max}{sensor.unit}
        </span>
      </div>
      <div className="h-40">
        <Line data={data} options={options} />
      </div>
    </div>
  )
}
