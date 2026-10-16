import { formatDuration, formatTime, dayLabel } from '../utils/format'

// Same outline trash-can glyph used in the Places list, so the delete
// action looks identical in both places.
function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M4 7h16" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  )
}

export default function DayView({ itinerary, places, trip, onMove, onDelete }) {
  // A lookup table: place id -> place. Faster and neater than searching the list each time.
  const byId = new Map(places.map((p) => [p.id, p]))

  const dayOptions = itinerary.days.map((d) => (
    <option key={d.index} value={d.index}>Day {d.index + 1}</option>
  ))

  return (
    <>
      <h2 className="list-heading">Itinerary</h2>
      <div className="day-grid">
        {itinerary.days.map((day) => (
          <section className="card" key={day.index}>
            <h2 className="day-heading">
              Day {day.index + 1} <span className="muted">{dayLabel(trip.startDate, day.index)}</span>
            </h2>
            {day.stops.length === 0 && <p className="muted">Nothing planned for this day.</p>}
            <ul className="stops">
              {day.stops.map((s) => {
                const p = byId.get(s.placeId)
                return (
                  <li key={s.placeId}>
                    <div>
                      <div className="stop-name">{p.name}</div>
                      <div className="stop-meta">
                        <span className="stop-time">{formatTime(s.start)} – {formatTime(s.end)}</span>
                        {' · '}
                        <span className="stop-duration">{formatDuration(p.durationMin)}</span>
                      </div>
                    </div>
                    <div className="stop-actions">
                      {/* Choosing a day moves the place there and keeps it on that day
                          through reshuffles. */}
                      <select
                        className="day-select"
                        aria-label={`Move ${p.name} to another day`}
                        value=""
                        onChange={(e) => e.target.value !== '' && onMove(p.id, Number(e.target.value))}
                      >
                        <option value="">Move</option>
                        {dayOptions}
                      </select>
                      <button type="button" className="icon-button" onClick={() => onDelete(p.id)} aria-label={`Delete ${p.name}`}>
                        <TrashIcon />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>

      {itinerary.unscheduled.length > 0 && (
        <section className="card unscheduled">
          <h2>Unscheduled ({itinerary.unscheduled.length})</h2>
          <p className="muted">These did not fit. Move one to a day, or add a day in "Your trip".</p>
          <ul className="stops">
            {itinerary.unscheduled.map((id) => {
              const p = byId.get(id)
              return (
                <li key={id}>
                  <div>
                    <div className="stop-name">{p.name}</div>
                    <div className="stop-meta">
                      <span className="stop-duration">
                        {formatDuration(p.durationMin)}
                        {p.lat == null && ' · no location: delete and re-add with search'}
                      </span>
                    </div>
                  </div>
                  <div className="stop-actions">
                    <select
                      className="day-select"
                      aria-label={`Move ${p.name} to a day`}
                      value=""
                      onChange={(e) => e.target.value !== '' && onMove(id, Number(e.target.value))}
                    >
                      <option value="">Move</option>
                      {dayOptions}
                    </select>
                    <button type="button" className="icon-button" onClick={() => onDelete(id)} aria-label={`Delete ${p.name}`}>
                      <TrashIcon />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </>
  )
}
