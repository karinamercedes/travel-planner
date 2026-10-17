import { useEffect } from 'react'

// Browsers try to scroll to a URL's #hash the instant the page loads -- but
// in a client-rendered React app, that target element (e.g. id="plan")
// usually doesn't exist in the DOM yet at that moment, since nothing's been
// rendered. The browser's one-shot scroll attempt finds nothing, gives up
// silently, and never retries -- so the page just sits at the top. This
// hook stands in for that: it retries once the app has actually rendered,
// and keeps working afterwards for any in-page hash link clicked later
// (a "TRY NOW" style button, nav links), with no router needed.
//
// Drop this hook into any of these small apps that link to an #id section
// (either from its own Hero, or from another app in the trio linking over)
// and call it once, near the top of App.jsx: useScrollToHash().
export default function useScrollToHash() {
  useEffect(() => {
    function scrollToCurrentHash(behavior) {
      const id = window.location.hash.slice(1)
      if (!id) return
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior, block: 'start' })
    }

    // First attempt, right after mount: jump straight there, no animation --
    // this is standing in for the browser's own failed initial-load scroll,
    // not something the user just clicked.
    scrollToCurrentHash('instant')

    // Images, fonts and lazy content loading in above the target can still
    // shift its position after that first pass -- one more try once things
    // have had a moment to settle.
    const settle = setTimeout(() => scrollToCurrentHash('instant'), 350)

    // A hash link clicked while already on the page fires this event even
    // without a router -- scrolled smoothly, since that one *is* a deliberate
    // navigation.
    function onHashChange() { scrollToCurrentHash('smooth') }
    window.addEventListener('hashchange', onHashChange)

    return () => {
      clearTimeout(settle)
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [])
}
