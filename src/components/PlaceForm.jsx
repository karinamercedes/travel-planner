import { formatDuration } from '../utils/format'
import PlaceSearch from './PlaceSearch'

const durations = [30, 60, 90, 120, 180, 240]

// Purely presentational now: App.jsx owns the in-progress place's state,
// since the "Add place" button that submits it lives further down the
// page (after the feasibility banner), sharing one <form> with App.jsx.
export default function PlaceForm({ form, onChange, onPick, city }) {
  const hasLocation = form.lat !== null

  function handleChange(e) {
    const { name, value } = e.target
    onChange({ ...form, [name]: name === 'durationMin' ? Number(value) : value })
  }

  return (
    <>
      <h3>Add a place</h3>

      <div className={`grid place-row${hasLocation ? ' has-selected' : ''}`}>
        <PlaceSearch city={city} onPick={onPick} />
        <label>
          Name in your plan
          <input name="name" value={form.name} onChange={handleChange} placeholder="Search and pick a place first" />
        </label>
      </div>

      {hasLocation && (
        <p className="selected">Selected: {form.address}</p>
      )}

      <div className="grid place-fields-row">
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
    </>
  )
}
