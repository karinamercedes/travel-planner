import { useState, useEffect, useRef } from 'react'
import { searchPlaces } from '../utils/geocode'
import useDebounce from '../hooks/useDebounce'

export default function PlaceSearch({ city, onPick }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | empty | error
  const debouncedQuery = useDebounce(query, 500)
  const controllerRef = useRef(null) // lets us cancel a search that's no longer needed

  useEffect(() => {
    const q = debouncedQuery.trim()
    if (q.length < 3) { setResults([]); setStatus('idle'); return }

    controllerRef.current?.abort() // cancel any search still in flight
    const controller = new AbortController()
    controllerRef.current = controller

    setStatus('loading')
    searchPlaces(q, city, controller.signal)
      .then((found) => { setResults(found); setStatus(found.length ? 'idle' : 'empty') })
      .catch((err) => { if (err.name !== 'AbortError') setStatus('error') })

    return () => controller.abort()
  }, [debouncedQuery, city])

  function pick(result) {
    onPick(result)
    setResults([])
    setQuery('')
  }

  return (
    <div className="search">
      <label htmlFor="place-search">Search for a place</label>
      <input
        id="place-search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g. Louvre"
        autoComplete="off"
      />
      {status === 'loading' && <p className="muted">Searching...</p>}
      {status === 'error' && <p className="error" role="alert">Search failed. Please try again in a moment.</p>}
      {status === 'empty' && <p className="muted">No results. Try a different name.</p>}
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
    </div>
  )
}
