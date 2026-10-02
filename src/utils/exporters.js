// Turning the plan into files: CSV (opens in Excel), ICS (calendar), and JSON (backup).
import { formatTime } from './format'

const pad = (n) => String(n).padStart(2, '0')

// Date of day number `index` (0 = first day), or null if the trip has no start date.
function dateFor(startDate, index) {
  if (!startDate) return null
  const d = new Date(`${startDate}T00:00:00`)
  d.setDate(d.getDate() + index)
  return d
}
const ymd = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` // 20261006
const isoDate = (d) => (d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : '')

// "Lisbon Trip!" -> "lisbon-trip" (safe for file names)
export function slug(text) {
  return String(text || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'trip'
}

// ---------- CSV ----------
export function buildCsv(itinerary, places, trip) {
  const byId = new Map(places.map((p) => [p.id, p]))
  const header = ['Day', 'Date', 'Start', 'End', 'Place', 'Duration (min)', 'Priority', 'Address', 'Latitude', 'Longitude']
  const row = (label, date, start, end, p) => [
    label, date, start, end, p.name, p.durationMin,
    p.priority === 'must' ? 'Must-see' : 'Nice to have', p.address, p.lat ?? '', p.lon ?? '',
  ]

  const rows = []
  for (const day of itinerary.days) {
    const date = isoDate(dateFor(trip.startDate, day.index))
    for (const s of day.stops) rows.push(row(`Day ${day.index + 1}`, date, formatTime(s.start), formatTime(s.end), byId.get(s.placeId)))
  }
  for (const id of itinerary.unscheduled) rows.push(row('Unscheduled', '', '', '', byId.get(id)))

  // Every value goes in quotes, and a quote inside a value is doubled ("").
  const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n')
  return '\uFEFF' + csv // the BOM makes Excel read accents correctly
}

// ---------- Calendar (.ics) ----------
const escapeIcs = (t) =>
  String(t ?? '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')

// The ICS format wants lines under 75 characters: longer lines continue on the next line after a space.
function fold(line) {
  const parts = []
  let rest = line
  while (rest.length > 60) { parts.push(rest.slice(0, 60)); rest = rest.slice(60) }
  parts.push(rest)
  return parts.join('\r\n ')
}

export function buildIcs(itinerary, places, trip) {
  const byId = new Map(places.map((p) => [p.id, p]))
  const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const time = (m) => `${pad(Math.floor(m / 60))}${pad(m % 60)}00`

  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Travel Planner//EN', 'CALSCALE:GREGORIAN']
  for (const day of itinerary.days) {
    const date = dateFor(trip.startDate, day.index)
    if (!date) continue
    for (const s of day.stops) {
      const p = byId.get(s.placeId)
      // No time zone on purpose ("floating" time): 09:00 stays 09:00 wherever the calendar is.
      lines.push(
        'BEGIN:VEVENT',
        `UID:${p.id}-${ymd(date)}@travel-planner`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${ymd(date)}T${time(s.start)}`,
        `DTEND:${ymd(date)}T${time(s.end)}`,
        `SUMMARY:${escapeIcs(p.name)}`
      )
      if (p.address) lines.push(`LOCATION:${escapeIcs(p.address)}`)
      if (p.lat != null && p.lon != null) lines.push(`GEO:${p.lat};${p.lon}`)
      lines.push('END:VEVENT')
    }
  }
  lines.push('END:VCALENDAR')
  return lines.map(fold).join('\r\n') + '\r\n'
}

// ---------- Saving a file ----------
// Builds a temporary link to the text and "clicks" it, so the browser downloads it.
export function download(filename, text, mime) {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ---------- Backup file: read it back safely ----------
// A file from outside is never trusted: check its shape and rebuild clean objects.
export function parseBackup(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('This file is not valid JSON.') }
  if (!data || typeof data !== 'object' || !data.trip || !Array.isArray(data.places)) {
    throw new Error('This does not look like a Travel Planner backup.')
  }
  const days = Math.min(14, Math.max(1, Number(data.trip.numDays) || 3))
  const trip = {
    city: String(data.trip.city ?? ''),
    numDays: days,
    startDate: String(data.trip.startDate ?? ''),
    pace: ['relaxed', 'normal', 'packed'].includes(data.trip.pace) ? data.trip.pace : 'normal',
  }
  const places = data.places
    .filter((p) => p && typeof p.name === 'string' && Number(p.durationMin) > 0)
    .map((p) => ({
      id: typeof p.id === 'string' ? p.id : crypto.randomUUID(),
      name: p.name,
      address: String(p.address ?? ''),
      lat: Number.isFinite(p.lat) ? p.lat : null,
      lon: Number.isFinite(p.lon) ? p.lon : null,
      durationMin: Number(p.durationMin),
      timeOfDay: ['morning', 'afternoon', 'evening', 'any'].includes(p.timeOfDay) ? p.timeOfDay : 'any',
      priority: p.priority === 'must' ? 'must' : 'nice',
      pinnedDay: Number.isInteger(p.pinnedDay) ? p.pinnedDay : null,
    }))
  return { trip, places }
}
