import { useState, useEffect } from 'react'

// A custom hook: works like useState, but the value is also saved in the browser
// (localStorage), so it is still there after a page refresh. No sign-up needed.
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    // This function runs only once, when the component first appears.
    try {
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : initialValue
    } catch {
      return initialValue
    }
  })

  // useEffect runs after the screen updates. Here: save whenever the value changes.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage can be full or blocked; the app still works, it just won't save.
    }
  }, [key, value])

  return [value, setValue]
}
