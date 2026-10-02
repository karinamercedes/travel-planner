import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Leaflet's default pin images break with bundlers, so we point to them ourselves.
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow })

// A small helper component: zooms the map so every pin is visible.
function FitBounds({ places }) {
  const map = useMap()
  useEffect(() => {
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
    <section className="card">
      <h2>Map</h2>
      <MapContainer center={[20, 0]} zoom={2} className="map" scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds places={located} />
        {located.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lon]}>
            <Popup>{p.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </section>
  )
}
