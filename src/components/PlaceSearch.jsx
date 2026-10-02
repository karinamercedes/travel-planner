import { useState } from 'react'
import { searchPlaces } from '../utils/geocode'

export default function PlaceSearch({ city, onPick }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | empty | error

  async function handleSearch() {
    if (!query.trim()) return
    setStatus('loading')
    try {
      const found = await searchPlaces(query.trim(), city)
      setResults(found)
      setStatus(found.length ? 'idle' : 'empty')
    } catch {
      setStatus('error')
    }
  }

  // Inside a <form>, Enter would submit the whole form, so we catch it here.
  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  function pick(result) {
    onPick(result)
    setResults([])
    setQuery('')
  }

  return (
    <div className="search">
      <label htmlFor="place-search">Search for a place</label>
      <div className="row">
        <input
          id="place-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Louvre"
        />
        <button type="button" onClick={handleSearch} disabled={status === 'loading'}>
          {status === 'loading' ? 'Searching...' : 'Search'}
        </button>
      </div>
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
