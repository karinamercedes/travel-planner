import { buildCsv, buildIcs, download, slug } from '../utils/exporters'

export default function ExportMenu({ itinerary, places, trip }) {
  const name = slug(trip.city)
  const hasDate = Boolean(trip.startDate) // calendar events need real dates

  return (
    <section className="card">
      <h2>Export your plan</h2>
      <div className="fixes">
        <button type="button" disabled={!hasDate}
          onClick={() => download(`${name}-plan.ics`, buildIcs(itinerary, places, trip), 'text/calendar')}>
          Calendar (.ics)
        </button>
        <button type="button"
          onClick={() => download(`${name}-plan.csv`, buildCsv(itinerary, places, trip), 'text/csv')}>
          Excel / CSV
        </button>
        <button type="button" onClick={() => window.print()}>PDF (print)</button>
      </div>
      {!hasDate && <p className="muted">Set a start date in "Your trip" to enable the calendar export.</p>}
      <p className="muted">For PDF, choose "Save as PDF" as the destination in the print window.</p>
    </section>
  )
}
