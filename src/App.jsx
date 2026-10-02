import { useMemo } from 'react'
import useLocalStorage from './hooks/useLocalStorage'
import TripForm from './components/TripForm'
import PlaceForm from './components/PlaceForm'
import PlaceList from './components/PlaceList'
import MapView from './components/MapView'
import FeasibilityBanner from './components/FeasibilityBanner'
import PlanControls from './components/PlanControls'
import DayView from './components/DayView'
import ExportMenu from './components/ExportMenu'
import BackupControls from './components/BackupControls'
import { checkFeasibility } from './utils/feasibility'
import { planTrip } from './utils/planner'

const defaultTrip = { city: '', numDays: 3, startDate: '', pace: 'normal' }

export default function App() {
  // "State" = data that can change and that the screen depends on.
  const [trip, setTrip] = useLocalStorage('tp-trip', defaultTrip)
  const [places, setPlaces] = useLocalStorage('tp-places', [])
  const [planned, setPlanned] = useLocalStorage('tp-planned', false)

  function addPlace(place) {
    // Never change state directly: build a NEW array with the spread operator.
    setPlaces([...places, { ...place, id: crypto.randomUUID() }])
  }

  function deletePlace(id) {
    setPlaces(places.filter((p) => p.id !== id))
  }

  // dayIndex = a day to pin the place to, or null to let the planner choose again.
  function movePlace(id, dayIndex) {
    setPlaces(places.map((p) => (p.id === id ? { ...p, pinnedDay: dayIndex } : p)))
  }

  // Derived state: not stored, just calculated from trip + places.
  const feasibility = checkFeasibility(places, trip)

  // useMemo remembers the itinerary and only recalculates when places, trip or planned change.
  const itinerary = useMemo(() => (planned ? planTrip(places, trip) : null), [planned, places, trip])

  function importBackup(data) {
    setTrip(data.trip)
    setPlaces(data.places)
    setPlanned(false)
  }

  // Elements with className "no-print" are hidden when printing, so the PDF shows only the plan.
  return (
    <main className="app">
      <header className="no-print">
        <h1>Travel Planner</h1>
        <p className="muted">Add the places you want to visit. Everything is saved in your browser.</p>
      </header>
      <h1 className="print-only">{trip.city ? `${trip.city}: ` : ''}{trip.numDays}-day plan</h1>

      <div className="no-print">
        <TripForm trip={trip} onChange={setTrip} />
        <PlaceForm onAdd={addPlace} city={trip.city} />
        <FeasibilityBanner result={feasibility} trip={trip} onChangeTrip={setTrip} onDeletePlace={deletePlace} />
        <PlanControls
          status={feasibility.status}
          planned={planned}
          hasPlaces={places.length > 0}
          onPlan={() => setPlanned(true)}
          onClear={() => setPlanned(false)}
        />
      </div>

      {itinerary && (
        <>
          <div className="no-print">
            <ExportMenu itinerary={itinerary} places={places} trip={trip} />
          </div>
          <DayView itinerary={itinerary} places={places} trip={trip} onMove={movePlace} />
        </>
      )}

      <div className="no-print">
        <MapView places={places} />
        <PlaceList places={places} onDelete={deletePlace} />
        <BackupControls trip={trip} places={places} onImport={importBackup} />
      </div>
    </main>
  )
}
