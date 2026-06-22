import { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../firebase'
import { MOCK_BEDS } from '../mockData'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true'

export function useBeds() {
  const [beds, setBeds] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (USE_MOCK) {
      setBeds(MOCK_BEDS)
      setLoading(false)
      return
    }

    const unsubscribe = onValue(
      ref(db, 'beds'),
      snapshot => {
        setBeds(snapshot.val() || {})
        setLoading(false)
      },
      err => {
        setError(err)
        setLoading(false)
      }
    )
    return unsubscribe
  }, [])

  return { beds, loading, error }
}
