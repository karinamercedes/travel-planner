import { formatDuration } from '../utils/format'

export default function FeasibilityBanner({ result, trip, onChangeTrip, onDeletePlace }) {
  if (result.status === 'empty') return null
  const { status, needed, capacity, percent, numDays, daysNeeded, slotIssues, fitsIfPacked, suggestedRemovals } = result

  if (status === 'fits') {
    return (
      <div className="banner fits" role="status">
        Your plan fits. About {percent}% of your available time is used.
      </div>
    )
  }

  if (status === 'tight') {
    return (
      <div className="banner tight" role="status">
        This will be a rushed trip: {percent}% of your available time is used.
      </div>
    )
  }

  // status === 'toomuch'
  return (
    <div className="banner toomuch" role="alert">
      <strong>This plan does not fit.</strong>
      {needed > capacity && (
        <p>
          Your places need {formatDuration(needed)}, but {numDays} {numDays === 1 ? 'day' : 'days'} at a{' '}
          {trip.pace} pace gives about {formatDuration(capacity)}. You would need about {daysNeeded} days.
        </p>
      )}
      {slotIssues.map((s) => (
        <p key={s.slot}>
          Too many {s.slot} places: {formatDuration(s.needed)} needed, about {formatDuration(s.capacity)} available.
          Try changing some to "Any time".
        </p>
      ))}

      <div className="fixes">
        {numDays < 14 && (
          <button type="button" onClick={() => onChangeTrip({ ...trip, numDays: numDays + 1 })}>
            Add a day
          </button>
        )}
        {fitsIfPacked && (
          <button type="button" onClick={() => onChangeTrip({ ...trip, pace: 'packed' })}>
            Switch to packed pace
          </button>
        )}
      </div>

      {needed > capacity && suggestedRemovals.length > 0 && (
        <div>
          <p>Or drop some nice-to-have places:</p>
          <ul className="removals">
            {suggestedRemovals.map((p) => (
              <li key={p.id}>
                <span>{p.name} ({formatDuration(p.durationMin)})</span>
                <button type="button" onClick={() => onDeletePlace(p.id)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
