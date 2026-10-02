// The planner: turns a list of places into a day-by-day itinerary.
// Steps: 1) choose a day for each place (nearby places share a day)
//        2) inside each day, order the places and give them times
// It never silently drops a place: anything that does not fit goes to "unscheduled".
import { distanceKm } from './geo'
import { WINDOWS, DAY_MIN, PACE, WALK_BUFFER_MIN } from './feasibility'

const SLOT_ORDER = ['morning', 'afternoon', 'evening']
const SLOT_START = { morning: 9 * 60, afternoon: 14 * 60, evening: 19 * 60 } // minutes after midnight
const DAY_END = 22 * 60

const cost = (p) => p.durationMin + WALK_BUFFER_MIN

function centre(list) {
  const lat = list.reduce((sum, p) => sum + p.lat, 0) / list.length
  const lon = list.reduce((sum, p) => sum + p.lon, 0) / list.length
  return { lat, lon }
}

function distToCentre(p, list) {
  const c = centre(list)
  return distanceKm(p.lat, p.lon, c.lat, c.lon)
}

// ---------- Step 1: which day? ----------
// Idea: every day gets a "centre" in a different part of the city, and each place joins the day
// with the nearest centre (a simple version of the k-means clustering algorithm).

function nearestIndex(p, centres) {
  let best = -1
  let bestDist = Infinity
  centres.forEach((c, i) => {
    if (!c) return
    const d = distanceKm(p.lat, p.lon, c.lat, c.lon)
    if (d < bestDist) { best = i; bestDist = d }
  })
  return best
}

function assignToDays(places, trip) {
  const numDays = Math.max(1, trip.numDays || 1)
  const factor = PACE[trip.pace] ?? PACE.normal
  const hardCap = DAY_MIN * factor // the most a day can hold, in minutes

  const days = Array.from({ length: numDays }, () => ({ places: [], minutes: 0 }))
  const unscheduled = []

  // Places the traveller moved to a specific day stay there.
  const isPinned = (p) => Number.isInteger(p.pinnedDay) && p.pinnedDay >= 0 && p.pinnedDay < numDays
  for (const p of places.filter(isPinned)) days[p.pinnedDay].places.push(p)
  const free = places.filter((p) => !isPinned(p))

  // 1. Starting centres. Days with pinned places start there. Other days start at the place
  //    that is farthest from the centres chosen so far, so days begin in different areas.
  const centres = days.map((d) => (d.places.length > 0 ? centre(d.places) : null))
  for (let i = 0; i < numDays && free.length > 0; i++) {
    if (centres[i]) continue
    const reference = centres.filter(Boolean)
    if (reference.length === 0) reference.push(centre(free))
    let seed = free[0]
    let seedDist = -1
    for (const p of free) {
      const nearest = Math.min(...reference.map((c) => distanceKm(p.lat, p.lon, c.lat, c.lon)))
      if (nearest > seedDist) { seed = p; seedDist = nearest }
    }
    centres[i] = { lat: seed.lat, lon: seed.lon }
  }

  // 2. Repeat 4 times: each place joins the nearest centre, then every centre moves to the middle of its group.
  let groups = days.map(() => [])
  for (let round = 0; round < 4; round++) {
    groups = days.map(() => [])
    for (const p of free) groups[nearestIndex(p, centres)].push(p)
    days.forEach((d, i) => {
      const all = [...d.places, ...groups[i]]
      if (all.length > 0) centres[i] = centre(all)
    })
  }
  days.forEach((d, i) => d.places.push(...groups[i]))
  days.forEach((d) => { d.minutes = d.places.reduce((sum, p) => sum + cost(p), 0) })

  // 3. Capacity: if a day holds too much, move its least important place (nice-to-have first,
  //    then the one farthest from the day's centre) to the nearest day with room, or to unscheduled.
  days.forEach((day) => {
    while (day.minutes > hardCap) {
      const c = centre(day.places)
      const out = day.places
        .filter((p) => !isPinned(p))
        .sort((a, b) =>
          a.priority === b.priority
            ? distanceKm(b.lat, b.lon, c.lat, c.lon) - distanceKm(a.lat, a.lon, c.lat, c.lon)
            : a.priority === 'nice' ? -1 : 1
        )[0]
      if (!out) break // only fixed places are left; leave them
      day.places = day.places.filter((p) => p !== out)
      day.minutes -= cost(out)

      const options = days.filter((d) => d !== day && d.minutes + cost(out) <= hardCap)
      let target = null
      let targetDist = Infinity
      for (const d of options) {
        const dist = d.places.length > 0 ? distToCentre(out, d.places) : 0
        if (dist < targetDist) { target = d; targetDist = dist }
      }
      if (target) { target.places.push(out); target.minutes += cost(out) }
      else unscheduled.push(out)
    }
  })
  return { days, unscheduled }
}

// ---------- Step 2: order and times inside a day ----------

// Nearest-neighbour route: always walk to the closest place not yet visited.
function orderNearest(list, previous, dayPlaces) {
  const left = [...list]
  const ordered = []
  let from = previous
  if (!from && left.length > 0) {
    // First stop of the day: start at the place farthest from the day's centre, so the route sweeps inward.
    const c = centre(dayPlaces)
    left.sort((a, b) => distanceKm(b.lat, b.lon, c.lat, c.lon) - distanceKm(a.lat, a.lon, c.lat, c.lon))
    from = left.shift()
    ordered.push(from)
  }
  while (left.length > 0) {
    let bestIndex = 0
    let bestDist = Infinity
    left.forEach((p, i) => {
      const d = distanceKm(from.lat, from.lon, p.lat, p.lon)
      if (d < bestDist) { bestDist = d; bestIndex = i }
    })
    from = left.splice(bestIndex, 1)[0]
    ordered.push(from)
  }
  return ordered
}

function scheduleDay(dayPlaces) {
  const slots = { morning: [], afternoon: [], evening: [] }
  const anyTime = []
  for (const p of dayPlaces) {
    if (SLOT_ORDER.includes(p.timeOfDay)) slots[p.timeOfDay].push(p)
    else anyTime.push(p)
  }

  const slotMinutes = (s) => slots[s].reduce((sum, p) => sum + cost(p), 0)
  const unscheduled = []

  // "Any time" places go to a part of the day that has room, preferring the one with nearby places.
  for (const p of anyTime.sort((a, b) => cost(b) - cost(a))) {
    const withRoom = SLOT_ORDER.filter((s) => slotMinutes(s) + cost(p) <= WINDOWS[s])
    if (withRoom.length === 0) { unscheduled.push(p); continue }
    let target = withRoom[0]
    let bestDist = Infinity
    for (const s of withRoom.filter((s) => slots[s].length > 0)) {
      const d = distToCentre(p, slots[s])
      if (d < bestDist) { bestDist = d; target = s }
    }
    slots[target].push(p)
  }

  // Walk through the day: give every place a start and end time.
  const stops = []
  let cursor = 0
  let previous = null
  for (const s of SLOT_ORDER) {
    cursor = Math.max(cursor, SLOT_START[s])
    for (const p of orderNearest(slots[s], previous, dayPlaces)) {
      if (cursor + p.durationMin > DAY_END) { unscheduled.push(p); continue }
      stops.push({ placeId: p.id, start: cursor, end: cursor + p.durationMin })
      cursor += cost(p) // duration plus the walking buffer
      previous = p
    }
  }
  return { stops, unscheduled }
}

// ---------- The one function the app calls ----------

export function planTrip(places, trip) {
  const located = places.filter((p) => p.lat != null && p.lon != null)
  const noLocation = places.filter((p) => p.lat == null || p.lon == null) // old places without coordinates

  const { days, unscheduled } = assignToDays(located, trip)
  const plannedDays = days.map((d, index) => {
    const { stops, unscheduled: extra } = scheduleDay(d.places)
    unscheduled.push(...extra)
    return { index, stops }
  })
  return { days: plannedDays, unscheduled: [...unscheduled, ...noLocation].map((p) => p.id) }
}
