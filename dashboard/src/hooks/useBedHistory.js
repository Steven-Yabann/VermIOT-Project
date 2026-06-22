import { useEffect, useState } from 'react'
import { ref, query, orderByChild, limitToLast, onValue } from 'firebase/database'
import { db } from '../firebase'
import { MOCK_BED_HISTORIES } from '../mockData'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true'

export function useBedHistory(bedId, limit = 48) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!bedId) return

    if (USE_MOCK) {
      const data = MOCK_BED_HISTORIES[bedId] || []
      setHistory(data.slice(-limit))
      setLoading(false)
      return
    }

    const histRef = query(
      ref(db, `beds/${bedId}/history`),
      orderByChild('timestamp'),
      limitToLast(limit)
    )
    const unsubscribe = onValue(histRef, snapshot => {
      const data = snapshot.val()
      if (data) {
        const sorted = Object.values(data).sort((a, b) => a.timestamp - b.timestamp)
        setHistory(sorted)
      } else {
        setHistory([])
      }
      setLoading(false)
    })
    return unsubscribe
  }, [bedId, limit])

  return { history, loading }
}
