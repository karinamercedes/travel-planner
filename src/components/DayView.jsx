import { formatDuration, formatTime, dayLabel } from '../utils/format'

export default function DayView({ itinerary, places, trip, onMove }) {
  // A lookup table: place id -> place. Faster and neater than searching the list each time.
  const byId = new Map(places.map((p) => [p.id, p]))

  const dayOptions = itinerary.days.map((d) => (
    <option key={d.index} value={d.index}>Day {d.index + 1}</option>
  ))

  return (
    <>
      {itinerary.days.map((day) => (
        <section className="card" key={day.index}>
          <h2>
            Day {day.index + 1} <span className="muted">{dayLabel(trip.startDate, day.index)}</span>
          </h2>
          {day.stops.length === 0 && <p className="muted">Nothing planned for this day.</p>}
          <ul className="stops">
            {day.stops.map((s) => {
              const p = byId.get(s.placeId)
              return (
                <li key={s.placeId}>
                  <span className="time">{formatTime(s.start)} - {formatTime(s.end)}</span>
                  <span className="stop-name">
                    <strong>{p.name}</strong> <span className="muted">{formatDuration(p.durationMin)}</span>
                  </span>
                  {/* Choosing a day "pins" the place there; the planner then keeps it on that day. */}
                  <select
                    aria-label={`Move ${p.name} to another day`}
                    value={day.index}
                    onChange={(e) => onMove(p.id, Number(e.target.value))}
                  >
                    {dayOptions}
                  </select>
                  {Number.isInteger(p.pinnedDay) && (
                    <button type="button" onClick={() => onMove(p.id, null)}>Unpin</button>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      ))}

      {itinerary.unscheduled.length > 0 && (
        <section className="card unscheduled">
          <h2>Unscheduled ({itinerary.unscheduled.length})</h2>
          <p className="muted">These did not fit. Move one to a day, or add a day in "Your trip".</p>
          <ul className="stops">
            {itinerary.unscheduled.map((id) => {
              const p = byId.get(id)
              return (
                <li key={id}>
                  <span className="stop-name">
                    <strong>{p.name}</strong> <span className="muted">{formatDuration(p.durationMin)}</span>
                    {p.lat == null && <span className="muted"> (no location: delete and re-add with search)</span>}
                  </span>
                  <select
                    aria-label={`Move ${p.name} to a day`}
                    value=""
                    onChange={(e) => e.target.value !== '' && onMove(id, Number(e.target.value))}
                  >
                    <option value="">Move to...</option>
                    {dayOptions}
                  </select>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </>
  )
}
