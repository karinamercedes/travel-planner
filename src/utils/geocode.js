// Place search using OpenStreetMap's free Nominatim service.
// Nominatim's usage policy caps requests at roughly 1 per second and discourages
// raw keystroke-by-keystroke autocomplete, so results update live but debounced
// (we wait until typing pauses) rather than firing on every keystroke.
const cache = new Map()

export async function searchPlaces(query, city, signal) {
  const q = city ? `${query}, ${city}` : query
  if (cache.has(q)) return cache.get(q)

  const url =
    'https://nominatim.openstreetmap.org/search?' +
    new URLSearchParams({ q, format: 'jsonv2', limit: '5' })

  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error('Search failed')
  const data = await res.json()

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

// City/town search for the trip's "City" field — same Nominatim endpoint, but
// biased toward place-type results (cities, towns, villages) instead of
// points of interest, so typing "Lis" suggests Lisbon rather than a cafe.
const cityCache = new Map()

export async function searchCities(query, signal) {
  const q = query.trim()
  if (cityCache.has(q)) return cityCache.get(q)

  const url =
    'https://nominatim.openstreetmap.org/search?' +
    new URLSearchParams({ q, format: 'jsonv2', limit: '10', featureType: 'city', addressdetails: '1' })

  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error('Search failed')
  const data = await res.json()

  // Nominatim often returns several entries for the same place — the city
  // itself, plus its surrounding province, metropolitan area, region, etc.
  // Those outer administrative levels don't have an address.city of their
  // own (they ARE that level), so a plain name+country dedupe still let
  // them through under their own label ("Province of Milan"). Nominatim
  // tags every result with the kind of place it actually is (addresstype):
  // filtering down to settlement-level kinds first drops those admin
  // entries outright, then the name+country dedupe collapses whatever's
  // left (e.g. the city's point and its boundary polygon) into one
  // canonical result per place, the way Google Maps does.
  const SETTLEMENT_TYPES = new Set(['city', 'town', 'village', 'municipality', 'hamlet'])
  const settlements = data.filter((r) => !r.addresstype || SETTLEMENT_TYPES.has(r.addresstype))

  const seen = new Set()
  const results = []
  for (const r of settlements) {
    const cityName =
      r.address?.city || r.address?.town || r.address?.village ||
      r.address?.municipality || r.name || r.display_name.split(',')[0]
    // Keyed on city + state/region + country, not just city + country —
    // two different real towns can share both a name and a country (Milan,
    // Tennessee vs. Milan, Ohio are both "milan, united states"), and only
    // the state tells them apart.
    const region = r.address?.state || r.address?.state_district || r.address?.region || ''
    const key = `${cityName.toLowerCase()}|${region.toLowerCase()}|${(r.address?.country || '').toLowerCase()}`
    if (seen.has(key)) continue
    seen.add(key)
    results.push({
      id: r.place_id,
      name: r.name || cityName,
      address: r.display_name,
      lat: Number(r.lat),
      lon: Number(r.lon),
    })
    if (results.length >= 5) break
  }

  cityCache.set(q, results)
  return results
}
