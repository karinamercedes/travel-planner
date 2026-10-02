// The overload check: does the plan fit in the days the traveller has?
// It is plain maths (no AI): add up the time the places need, compare with the time available.

// Time available in one day, in minutes. Gaps between windows are meals and rest:
// morning 09:00-13:00, afternoon 14:00-18:00, evening 19:00-22:00.
export const WINDOWS = { morning: 240, afternoon: 240, evening: 180 }
export const DAY_MIN = 660 // 240 + 240 + 180

// Pace = how much of the day the traveller wants to use.
export const PACE = { relaxed: 0.7, normal: 0.85, packed: 1 }

// Extra minutes added per place to get there (walking, queueing).
export const WALK_BUFFER_MIN = 15

const timeNeeded = (places) =>
  places.reduce((sum, p) => sum + p.durationMin + WALK_BUFFER_MIN, 0)

export function checkFeasibility(places, trip) {
  if (places.length === 0) return { status: 'empty' }

  const factor = PACE[trip.pace] ?? PACE.normal
  const numDays = Math.max(1, trip.numDays || 1)
  const capacity = Math.round(DAY_MIN * factor * numDays)
  const needed = timeNeeded(places)
  const percent = Math.round((needed / capacity) * 100)

  let status = 'fits'
  if (needed > capacity) status = 'toomuch'
  else if (needed > capacity * 0.9) status = 'tight'

  // Second check: too many places that want the same part of the day.
  const slotIssues = []
  for (const slot of Object.keys(WINDOWS)) {
    const slotNeeded = timeNeeded(places.filter((p) => p.timeOfDay === slot))
    const slotCapacity = Math.round(WINDOWS[slot] * factor * numDays)
    if (slotNeeded > slotCapacity) slotIssues.push({ slot, needed: slotNeeded, capacity: slotCapacity })
  }
  if (slotIssues.length > 0) status = 'toomuch'

  // Fix suggestions
  const daysNeeded = Math.ceil(needed / (DAY_MIN * factor))
  const fitsIfPacked = trip.pace !== 'packed' && needed <= DAY_MIN * numDays

  // Suggest dropping the longest "nice to have" places first (never the must-sees).
  const suggestedRemovals = []
  let excess = needed - capacity
  const removable = places
    .filter((p) => p.priority === 'nice')
    .sort((a, b) => b.durationMin - a.durationMin)
  for (const p of removable) {
    if (excess <= 0) break
    suggestedRemovals.push(p)
    excess -= p.durationMin + WALK_BUFFER_MIN
  }

  return { status, needed, capacity, percent, numDays, daysNeeded, slotIssues, fitsIfPacked, suggestedRemovals }
}
