import { useState } from 'react'
import { ref, update } from 'firebase/database'
import { db } from '../firebase'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true'

export default function BedManagementForm({ bedId, info }) {
  const [form, setForm] = useState({
    name:              info?.name              || '',
    dateSeeded:        info?.dateSeeded        || '',
    estimatedMaturity: info?.estimatedMaturity || '',
    notes:             info?.notes             || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)
  const [error,  setError]  = useState(null)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setSaved(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (USE_MOCK) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      return
    }
    setSaving(true)
    setError(null)
    try {
      await update(ref(db, `beds/${bedId}/info`), form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Bed Name
        </label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className={inputCls}
          placeholder="e.g. Bed A1"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Date Seeded
          </label>
          <input
            type="date"
            name="dateSeeded"
            value={form.dateSeeded}
            onChange={handleChange}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Est. Maturity
          </label>
          <input
            type="date"
            name="estimatedMaturity"
            value={form.estimatedMaturity}
            onChange={handleChange}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Notes
        </label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={3}
          className={`${inputCls} resize-none`}
          placeholder="Optional notes about this bed..."
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
      >
        {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
      </button>
    </form>
  )
}
