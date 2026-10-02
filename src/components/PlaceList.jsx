import { formatDuration } from '../utils/format'

const timeLabels = { any: 'Any time', morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' }

export default function PlaceList({ places, onDelete }) {
  if (places.length === 0) {
    return <p className="empty">No places yet. Add your first one above.</p>
  }

  // reduce() adds up all durations into one number.
  const totalMin = places.reduce((sum, p) => sum + p.durationMin, 0)

  return (
    <section className="card">
      <h2>Places ({places.length})</h2>
      <p className="muted">Total time: {formatDuration(totalMin)}</p>
      <ul className="places">
        {/* map() turns each place into a list item. "key" helps React track each item. */}
        {places.map((p) => (
          <li key={p.id}>
            <div>
              <strong>{p.name}</strong>
              <span className="muted">
                {formatDuration(p.durationMin)} · {timeLabels[p.timeOfDay]}
                {p.priority === 'must' ? ' · Must-see' : ''}
              </span>
            </div>
            <button onClick={() => onDelete(p.id)} aria-label={`Delete ${p.name}`}>Delete</button>
          </li>
        ))}
      </ul>
    </section>
  )
}
