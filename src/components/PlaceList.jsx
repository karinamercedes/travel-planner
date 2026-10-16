import { formatDuration } from '../utils/format'

const timeLabels = { any: 'Any time', morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' }

// A simple outline trash-can glyph (no icon library is installed, so this
// is drawn by hand rather than pulling in a whole font for one icon) —
// sized and colored via CSS (currentColor), same idea as the fa-trash-o
// look that was asked for.
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

export default function PlaceList({ places, onDelete, onMove, itinerary }) {
  if (places.length === 0) {
    return <p className="empty">No places yet. Add your first one above.</p>
  }

  // reduce() adds up all durations into one number.
  const totalMin = places.reduce((sum, p) => sum + p.durationMin, 0)

  // Same day options as the itinerary's own day select.
  const dayOptions = itinerary?.days.map((d) => (
    <option key={d.index} value={d.index}>Day {d.index + 1}</option>
  ))

  return (
    <section className="card places-card">
      <h2 className="list-heading">Your places ({places.length})</h2>
      <p className="muted">Total time: {formatDuration(totalMin)}</p>
      <ul className="places">
        {/* map() turns each place into a list item. "key" helps React track each item. */}
        {places.map((p) => {
          // Fixed here means fixed: a day picked in this list is pinned, so
          // a shuffle (or any replan) leaves it exactly where it was put —
          // separate from the itinerary's own "Move" below, which just
          // relocates a stop.
          const isFixed = typeof p.pinnedDay === 'number'
          return (
            <li key={p.id}>
              <div>
                <strong>{p.name}</strong>
                <span className="muted">
                  {formatDuration(p.durationMin)} · {timeLabels[p.timeOfDay]}
                  {p.priority === 'must' && <span className="must-see"> · Must-see</span>}
                </span>
              </div>
              <div className="place-actions">
                {itinerary && (
                  <select
                    className="day-select"
                    aria-label={isFixed ? `Change the fixed day for ${p.name}` : `Fix ${p.name} to a day`}
                    value={isFixed ? String(p.pinnedDay) : ''}
                    onChange={(e) => onMove(p.id, e.target.value === '' ? null : Number(e.target.value))}
                  >
                    <option value="">Any day</option>
                    {dayOptions}
                  </select>
                )}
                <button type="button" className="icon-button" onClick={() => onDelete(p.id)} aria-label={`Delete ${p.name}`}>
                  <TrashIcon />
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
