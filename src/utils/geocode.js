// Place search using OpenStreetMap's free Nominatim service.
// Rules of the free service: search only when the user asks (no search-as-you-type),
// at most 1 request per second, and show the OpenStreetMap attribution (the map does).
const cache = new Map() // remembers past searches so we don't ask the server twice

export async function searchPlaces(query, city) {
  const q = city ? `${query}, ${city}` : query // adding the city keeps results local
  if (cache.has(q)) return cache.get(q)

  const url =
    'https://nominatim.openstreetmap.org/search?' +
    new URLSearchParams({ q, format: 'jsonv2', limit: '5' })

  const res = await fetch(url)
  if (!res.ok) throw new Error('Search failed')
  const data = await res.json()

  // Keep only the fields we need, in our own format.
  const results = data.map((r) => ({
    id: r.place_id,
    name: r.name || r.display_name.split(',')[0],
    address: r.display_name,
    lat: Number(r.lat),
    lon: Number(r.lon),
  }))
  cache.set(q, results)
  return results
}
