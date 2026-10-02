export default function TripForm({ trip, onChange }) {
  // One handler for every field: the input's "name" tells us which property to update.
  function handleChange(e) {
    const { name, value } = e.target
    onChange({ ...trip, [name]: name === 'numDays' ? Number(value) : value })
  }

  return (
    <section className="card">
      <h2>Your trip</h2>
      <div className="grid">
        <label>
          City
          <input name="city" value={trip.city} onChange={handleChange} placeholder="e.g. Lisbon" />
        </label>
        <label>
          Days
          <input name="numDays" type="number" min="1" max="14" value={trip.numDays} onChange={handleChange} />
        </label>
        <label>
          Start date
          <input name="startDate" type="date" value={trip.startDate} onChange={handleChange} />
        </label>
        <label>
          Pace
          <select name="pace" value={trip.pace} onChange={handleChange}>
            <option value="relaxed">Relaxed</option>
            <option value="normal">Normal</option>
            <option value="packed">Packed</option>
          </select>
        </label>
      </div>
    </section>
  )
}
