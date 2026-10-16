// Section 1: mirrors the karinamercedes.com hero (eyebrow, heading, CTA) so
// the app and the site read as one piece. The CTA just scrolls to section 2.
export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="gradient-blob" aria-hidden="true" />
      <div className="hero-inner">
        <p className="eyebrow">Plan Smart</p>
        <div className="hero-group">
          <h1>Travel<br />Planner</h1>
          <div className="hero-copy">
            <p className="subhead">Plan a trip around your places, your timing, and your mood. We handle the logistics.</p>
            <a href="#plan" className="secondary">TRY NOW</a>
          </div>
        </div>
      </div>
    </section>
  )
}
