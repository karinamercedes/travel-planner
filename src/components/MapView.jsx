import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Leaflet's default pin points at PNG files that routinely come out broken
// once a bundler gets involved (paths resolve relative to Leaflet's own
// package rather than the built app). Simplest fix that can't break the
// same way: a self-contained red pin as an inline SVG data URI — no image
// file to lose track of, and it's the brand red instead of Leaflet's blue.
const redPinSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="36" viewBox="0 0 25 36">
  <path d="M12.5 0C5.6 0 0 5.6 0 12.5 0 21.9 12.5 36 12.5 36S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z" fill="#ca0013"/>
</svg>`
const redPinIcon = L.icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(redPinSvg)}`,
  iconSize: [22, 29],
  iconAnchor: [11, 29],
  popupAnchor: [0, -27],
})

// A small helper component: zooms the map so every pin is visible.
function FitBounds({ places }) {
  const map = useMap()
  useEffect(() => {
    // The map mounts inside a section that can still be animating/resizing
    // (film strip, layout shifts) when Leaflet first measures its container,
    // so it can end up with a stale size and misplaced (or invisible) pins
    // until something forces a re-measure.
    map.invalidateSize()
    if (places.length === 0) return
    const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lon]))
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
  }, [places, map])
  return null
}

export default function MapView({ places }) {
  // Places saved in stage 1 have no coordinates, so we skip those.
  const located = places.filter((p) => p.lat != null && p.lon != null)

  return (
    <section className="map-section">
      <MapContainer center={[20, 0]} zoom={2} className="map" scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds places={located} />
        {located.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lon]} icon={redPinIcon}>
            <Popup>{p.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </section>
  )
}
