import { useMemo, useState } from 'react'
import useLocalStorage from './hooks/useLocalStorage'
import Hero from './components/Hero'
import FilmStrip from './components/FilmStrip'
import TripForm from './components/TripForm'
import PlaceForm from './components/PlaceForm'
import PlaceList from './components/PlaceList'
import MapView from './components/MapView'
import FeasibilityBanner from './components/FeasibilityBanner'
import PlanControls from './components/PlanControls'
import DayView from './components/DayView'
import PackingListCta from './components/PackingListCta'
import DownloadPlan from './components/DownloadPlan'
import RestoreFromFileCta from './components/RestoreFromFileCta'
import ContactSection from './components/ContactSection'
import { checkFeasibility } from './utils/feasibility'
import { planTrip } from './utils/planner'

const defaultTrip = { city: '', numDays: 3, startDate: '', pace: 'normal' }
const emptyPlace = {
  name: '', address: '', lat: null, lon: null,
  durationMin: 90, timeOfDay: 'any', priority: 'nice',
}

export default function App() {
  const [trip, setTrip] = useLocalStorage('tp-trip', defaultTrip)
  const [places, setPlaces] = useLocalStorage('tp-places', [])
  const [planned, setPlanned] = useLocalStorage('tp-planned', false)
  const [planSeed, setPlanSeed] = useState(0) // 0 = the plain plan; shuffle bumps this
  const [placeForm, setPlaceForm] = useState(emptyPlace)
  const hasLocation = placeForm.lat !== null

  // Adding a place and (re)planning the trip are now one action: every time
  // a place is added, the itinerary below re-plans itself immediately so
  // it's always up to date.
  function handleAddPlace(e) {
    e.preventDefault()
    if (!hasLocation || !placeForm.name.trim()) return
    setPlaces([...places, { ...placeForm, name: placeForm.name.trim(), id: crypto.randomUUID() }])
    setPlanSeed(0)
    setPlanned(true)
    setPlaceForm(emptyPlace)
  }

  function handlePickPlace(result) {
    setPlaceForm({ ...placeForm, name: result.name, address: result.address, lat: result.lat, lon: result.lon })
  }

  function deletePlace(id) {
    setPlaces(places.filter((p) => p.id !== id))
  }

  function movePlace(id, dayIndex) {
    setPlaces(places.map((p) => (p.id === id ? { ...p, pinnedDay: dayIndex } : p)))
  }

  function importBackup(data) {
    setTrip(data.trip)
    setPlaces(data.places)
    setPlanned(false)
  }

  // Reset: clears the trip back to its starting point, so the user begins a new plan from scratch.
  function resetTrip() {
    setTrip(defaultTrip)
    setPlaces([])
    setPlanned(false)
    setPlanSeed(0)
  }

  const feasibility = checkFeasibility(places, trip)
  const itinerary = useMemo(
    () => (planned ? planTrip(places, trip, planSeed) : null),
    [planned, places, trip, planSeed]
  )

  return (
    <>
      {/* Desktop (≥1025px): a real two-column layout — 20% sidebar (the
          persistent film strip) + 80% content — instead of a fixed overlay.
          Below that breakpoint this wrapper doesn't apply; the sidebar
          strip hides and the inline strips below take over instead. */}
      <div className="page-layout">
        <FilmStrip variant="fixed" />

        <main className="app">
        <Hero />

        {/* Mobile-only: the strip sits between the hero and the plan section. */}
        <FilmStrip variant="inline" />

        <section className="section plan-section" id="plan">
          <div className="section-heading">
            <h2>Your next journey starts here</h2>
            <p className="subhead">Tell us where you're going and what you don't want to miss — we'll work out the rest.</p>
          </div>

          <div className="no-print">
            <TripForm trip={trip} onChange={setTrip} />
            <form onSubmit={handleAddPlace}>
              <PlaceForm form={placeForm} onChange={setPlaceForm} onPick={handlePickPlace} city={trip.city} />
              <FeasibilityBanner result={feasibility} trip={trip} onChangeTrip={setTrip} onDeletePlace={deletePlace} />
              <button type="submit" className="secondary full-width reverse" style={{ marginTop: '25px' }} disabled={!hasLocation}>
                Add place
              </button>
            </form>

            {/* Lets someone who already has a backup get straight back to
                it, instead of being forced to add a place first just to
                reach the "Restore from file" button buried in the download
                section further down. */}
            <RestoreFromFileCta onImport={importBackup} />
          </div>

          <div className="no-print space-before-half">
            <PlaceList places={places} onDelete={deletePlace} onMove={movePlace} itinerary={itinerary} />
          </div>
        </section>

        <h1 className="print-only">{trip.city ? `${trip.city}: ` : ''}{trip.numDays}-day plan</h1>

        {itinerary && (
          <section className="section results-section space-before-half">
            <div className={`map-itinerary${itinerary.days.length >= 2 ? ' stacked' : ''}`}>
              <div className="no-print map-pane">
                <MapView places={places} />
              </div>
              <div className="itinerary-pane">
                <DayView itinerary={itinerary} places={places} trip={trip} onMove={movePlace} onDelete={deletePlace} />
              </div>
            </div>

            <PlanControls onShuffle={() => setPlanSeed((s) => s + 1)} />

            <PackingListCta />

            <div className="reset-row">
              <button type="button" className="link-reset" onClick={resetTrip}>
                Plan a new journey
              </button>
            </div>

            <div className="no-print space-before">
              <DownloadPlan itinerary={itinerary} places={places} trip={trip} onImport={importBackup} />
            </div>

            {/* Mobile-only: the strip repeats once more here, between the
                download section and the closing contact section. */}
            <FilmStrip variant="inline" />
          </section>
        )}

        <ContactSection />
        </main>
      </div>
    </>
  )
}
