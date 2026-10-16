import { useState } from 'react'
import { parseBackup } from '../utils/exporters'

// A second way in to "Restore from file" — the one inside "Download your
// plan" only appears once an itinerary already exists (i.e. once there's
// at least one place), which is no help to someone who lands on the page
// with an existing backup and wants it back before adding anything. Same
// outline look as every other secondary CTA, not the solid one used in
// the download row, so it reads as the alternative to "Add place" above it.
export default function RestoreFromFileCta({ onImport }) {
  const [message, setMessage] = useState('')

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
    <div className="restore-cta">
      <label className="file-button secondary">
        Restore from file
        <input type="file" accept="application/json,.json" onChange={handleFile} />
      </label>
      {message && <p role="status" className="muted">{message}</p>}
    </div>
  )
}
