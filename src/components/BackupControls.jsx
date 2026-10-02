import { useState } from 'react'
import { download, parseBackup, slug } from '../utils/exporters'

export default function BackupControls({ trip, places, onImport }) {
  const [message, setMessage] = useState('')

  function handleExport() {
    const text = JSON.stringify({ version: 1, trip, places }, null, 2)
    download(`${slug(trip.city)}-backup.json`, text, 'application/json')
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
    e.target.value = '' // lets you pick the same file again later
  }

  return (
    <section className="card">
      <h2>Backup</h2>
      <p className="muted">Your trip is saved in this browser only. Download a backup to keep it safe or move it to another device.</p>
      <div className="fixes">
        <button type="button" onClick={handleExport}>Download backup (.json)</button>
        <label className="file-button">
          Restore from file
          <input type="file" accept="application/json,.json" onChange={handleFile} />
        </label>
      </div>
      {message && <p role="status">{message}</p>}
    </section>
  )
}
