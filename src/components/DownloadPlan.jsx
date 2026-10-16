import { useState } from 'react'
import { buildCsv, buildIcs, download, parseBackup, slug } from '../utils/exporters'

export default function DownloadPlan({ itinerary, places, trip, onImport }) {
  const [message, setMessage] = useState('')
  const name = slug(trip.city)
  const hasDate = Boolean(trip.startDate)

  function handleBackupExport() {
    const text = JSON.stringify({ version: 1, trip, places }, null, 2)
    download(`${name}-backup.json`, text, 'application/json')
  }

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        onImport(parseBackup(String(reader.result)))
        setMessage('Backup restored.')
      } catch (err) {
        setMessage(err.message)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <section className="section">
      <div className="section-heading">
        <h2>Download your plan</h2>
        <p className="subhead">
          Make sure to download your itinerary and share it with your travel mates. Come back to edit it together.
        </p>
      </div>

      <div className="fixes fixes-fill">
        <button type="button" className="secondary square" disabled={!hasDate}
          onClick={() => download(`${name}-plan.ics`, buildIcs(itinerary, places, trip), 'text/calendar')}>
          Calendar (.ics)
        </button>
        <button type="button" className="secondary square"
          onClick={() => download(`${name}-plan.csv`, buildCsv(itinerary, places, trip), 'text/csv')}>
          Excel / CSV
        </button>
        <button type="button" className="secondary square" onClick={() => window.print()}>PDF (print)</button>
      </div>
      {!hasDate && <p className="muted">Set a start date in "Your trip" to enable the calendar export.</p>}

      <p className="backup-note">
        Your trip is only saved in this browser. Download a backup to keep it safe or move it to another device.
      </p>
      <div className="fixes fixes-fill">
        <button type="button" className="secondary square" onClick={handleBackupExport}>Download backup (.json)</button>
        <label className="file-button primary square">
          Restore from file
          <input type="file" accept="application/json,.json" onChange={handleFile} />
        </label>
      </div>
      {message && <p role="status" className="muted">{message}</p>}
    </section>
  )
}
