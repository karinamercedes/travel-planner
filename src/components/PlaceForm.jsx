import { useState } from 'react'
import { formatDuration } from '../utils/format'
import PlaceSearch from './PlaceSearch'

const emptyPlace = {
  name: '', address: '', lat: null, lon: null,
  durationMin: 90, timeOfDay: 'any', priority: 'nice',
}
const durations = [30, 60, 90, 120, 180, 240]

export default function PlaceForm({ onAdd, city }) {
  const [form, setForm] = useState(emptyPlace)
  const hasLocation = form.lat !== null

  function handleChange(e) {
    const { name, value } = e.target
    setForm({ ...form, [name]: name === 'durationMin' ? Number(value) : value })
  }

  // Called by PlaceSearch when the user clicks a result.
  function handlePick(result) {
    setForm({ ...form, name: result.name, address: result.address, lat: result.lat, lon: result.lon })
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!hasLocation || !form.name.trim()) return
    onAdd({ ...form, name: form.name.trim() })
    setForm(emptyPlace)
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Add a place</h2>
      <PlaceSearch city={city} onPick={handlePick} />

      {hasLocation && (
        <p className="selected">Selected: {form.address}</p>
      )}

      <div className="grid">
        <label className="wide">
          Name in your plan
          <input name="name" value={form.name} onChange={handleChange} placeholder="Search and pick a place first" />
        </label>
        <label>
          How long?
          <select name="durationMin" value={form.durationMin} onChange={handleChange}>
            {durations.map((d) => (
              <option key={d} value={d}>{formatDuration(d)}</option>
            ))}
          </select>
        </label>
        <label>
          Best time
          <select name="timeOfDay" value={form.timeOfDay} onChange={handleChange}>
            <option value="any">Any time</option>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
          </select>
        </label>
        <label>
          Priority
          <select name="priority" value={form.priority} onChange={handleChange}>
            <option value="must">Must-see</option>
            <option value="nice">Nice to have</option>
          </select>
        </label>
      </div>
      <button type="submit" className="primary" disabled={!hasLocation}>Add place</button>
    </form>
  )
}
