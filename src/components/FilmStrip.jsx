import { filmStripPhotos } from '../data/filmStripPhotos'
import filmMask from '../assets/film-strip-mask.png'
import filmMaskVertical from '../assets/film-strip-mask-vertical.png'

// One component, rendered twice in App.jsx. CSS decides what each instance
// actually looks like per breakpoint:
//  - desktop: only the "fixed" instance shows, as a persistent vertical
//    sidebar running the full page height, photos drifting upward.
//  - mobile: the fixed instance hides; both plain instances show instead,
//    as a horizontal strip, photos drifting left.
// The track is the photo list doubled so the loop has no visible seam.
//
// Each frame stacks two images: the photo itself, and the real film-strip
// mask graphic (transparent everywhere except its black border + sprocket
// holes) laid on top. The fixed/vertical variant uses a pre-rotated copy
// (sprockets on the left/right, matching that strip's orientation) so no
// CSS rotation is needed — picked here by variant, same as everything else
// that differs between the two.
export default function FilmStrip({ variant = 'inline' }) {
  const track = [...filmStripPhotos, ...filmStripPhotos]
  const mask = variant === 'fixed' ? filmMaskVertical : filmMask
  // The fixed/desktop strip is visible the moment the page loads (it's the
  // sidebar, not something you scroll down to), so its first few photos
  // should start fetching immediately rather than waiting on the lazy-load
  // heuristic — that wait is what was showing as an empty frame. The
  // inline/mobile strip is further down the page, so lazy-loading it still
  // makes sense.
  const eagerCount = 4

  return (
    <div className={`film-strip film-strip--${variant}`} aria-hidden="true">
      <div className="film-strip-track">
        {track.map((src, i) => (
          <div className="film-frame" key={i}>
            <img
              className="film-photo"
              src={src}
              alt=""
              loading={variant === 'fixed' && i < eagerCount ? 'eager' : 'lazy'}
              decoding="async"
            />
            <img className="film-mask" src={mask} alt="" aria-hidden="true" />
          </div>
        ))}
      </div>
    </div>
  )
}
