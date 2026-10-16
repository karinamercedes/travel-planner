import { useState, useEffect } from 'react'

// Returns `value`, but only after it has stopped changing for `delayMs`.
// Used so the search box waits for a pause in typing before calling the API,
// instead of firing a request on every single keystroke.
export default function useDebounce(value, delayMs = 500) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer) // cancels the previous timer if value changes again
  }, [value, delayMs])
  return debounced
}
