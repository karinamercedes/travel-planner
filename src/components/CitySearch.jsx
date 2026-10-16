import { useState, useEffect, useRef } from 'react'
import { searchCities } from '../utils/geocode'
import useDebounce from '../hooks/useDebounce'

// Same live-suggestion feel as "Add a place", but searching for cities/towns
// instead of points of interest, and feeding a plain text field (trip.city)
// rather than a lat/lon pick.
export default function CitySearch({ value, onChange }) {
  const [query, setQuery] = useState(value || '')
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | empty | error
  const [open, setOpen] = useState(false)
  const debouncedQuery = useDebounce(query, 500)
  const controllerRef = useRef(null)
  const boxRef = useRef(null)

  // Keep the field in sync if the trip is reset/imported from elsewhere.
  useEffect(() => { setQuery(value || '') }, [value])

  useEffect(() => {
    const q = debouncedQuery.trim()
    if (!open || q.length < 2) { setResults([]); setStatus('idle'); return }

    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    setStatus('loading')
    searchCities(q, controller.signal)
      .then((found) => { setResults(found); setStatus(found.length ? 'idle' : 'empty') })
      .catch((err) => { if (err.name !== 'AbortError') setStatus('error') })

    return () => controller.abort()
  }, [debouncedQuery, open])

  // Close the suggestion list on an outside click.
  useEffect(() => {
    function handleClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function pick(result) {
    setQuery(result.name)
    onChange(result.name)
    setResults([])
    setOpen(false)
  }

  function handleType(e) {
    const v = e.target.value
    setQuery(v)
    onChange(v) // the plain text still drives the trip, suggestions are a shortcut
    setOpen(true)
  }

  return (
    <div className="search city-search" ref={boxRef}>
      <label htmlFor="trip-city">City</label>
      <input
        id="trip-city"
        value={query}
        onChange={handleType}
        onFocus={() => setOpen(true)}
        placeholder="e.g. Lisbon"
        autoComplete="off"
      />
      {open && status === 'loading' && <p className="muted">Searching...</p>}
      {open && status === 'error' && <p className="error" role="alert">Search failed. Please try again in a moment.</p>}
      {open && results.length > 0 && (
        <ul className="results">
          {results.map((r) => (
            <li key={r.id}>
              <button type="button" onClick={() => pick(r)}>
                <strong>{r.name}</strong>
                <span className="muted">{r.address}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
