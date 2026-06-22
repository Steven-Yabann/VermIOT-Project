import { subHours } from 'date-fns'

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

function randomWalk(base, step, min, max) {
  return clamp(base + (Math.random() - 0.5) * step * 2, min, max)
}

function generateHistory(bedIndex, count = 48) {
  const now = Date.now()
  // Each bed starts with slightly different base conditions
  let m  = 72 + bedIndex * 2
  let t  = 18 + bedIndex
  let ph = 6.8 + bedIndex * 0.1
  let g  = 120 + bedIndex * 30

  return Array.from({ length: count }, (_, i) => {
    m  = randomWalk(m,  2, 55, 95)
    t  = randomWalk(t,  1, 10, 38)
    ph = randomWalk(ph, 0.15, 5.0, 9.0)
    g  = randomWalk(g,  20, 50, 550)
    return {
      moisture:    +m.toFixed(1),
      temperature: +t.toFixed(1),
      ph:          +ph.toFixed(2),
      gasIndex:    Math.round(g),
      timestamp:   subHours(now, count - i).getTime(),
    }
  })
}

const BED_DEFINITIONS = [
  { id: 'bed_001', name: 'Bed A1', dateSeeded: '2026-03-15', estimatedMaturity: '2026-06-15', notes: 'First batch of 2026. High-density population.' },
  { id: 'bed_002', name: 'Bed A2', dateSeeded: '2026-04-01', estimatedMaturity: '2026-07-01', notes: 'Experimental feed mix.' },
  { id: 'bed_003', name: 'Bed B1', dateSeeded: '2026-04-10', estimatedMaturity: '2026-07-10', notes: '' },
  { id: 'bed_004', name: 'Bed B2', dateSeeded: '2026-04-20', estimatedMaturity: '2026-07-20', notes: 'Reduced feeding schedule.' },
  { id: 'bed_005', name: 'Bed C1', dateSeeded: '2026-05-01', estimatedMaturity: '2026-08-01', notes: 'New batch — monitor closely.' },
  { id: 'bed_006', name: 'Bed C2', dateSeeded: '2026-05-10', estimatedMaturity: '2026-08-10', notes: '' },
]

function buildBedLatest(history) {
  return history[history.length - 1]
}

export const MOCK_BED_HISTORIES = {}

export const MOCK_BEDS = BED_DEFINITIONS.reduce((acc, bed, i) => {
  const history = generateHistory(i)
  MOCK_BED_HISTORIES[bed.id] = history
  acc[bed.id] = {
    info: {
      name: bed.name,
      dateSeeded: bed.dateSeeded,
      estimatedMaturity: bed.estimatedMaturity,
      notes: bed.notes,
    },
    latest: buildBedLatest(history),
  }
  return acc
}, {})
