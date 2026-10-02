// Turns minutes into readable text: 90 -> "1h 30m"
export function formatDuration(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

// Minutes since midnight -> "09:30"
export function formatTime(minutes) {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0')
  const m = String(minutes % 60).padStart(2, '0')
  return `${h}:${m}`
}

// "Tue 6 Oct" for day number `index` of a trip starting on startDate (or "" if no date was set).
export function dayLabel(startDate, index) {
  if (!startDate) return ''
  const date = new Date(`${startDate}T00:00:00`)
  date.setDate(date.getDate() + index)
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}
