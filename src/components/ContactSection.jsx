// Closing section of the page: a simple contact call-to-action, styled to
// read as the page's last "editorial" beat — same red/navy heading pairing
// as everywhere else, with the hero's own gradient graphic reused (not a
// new asset) positioned behind just the red heading rather than running the
// full section height the way it does behind the hero.
export default function ContactSection() {
  return (
    <section className="section contact-section" id="contact">
      <div className="contact-gradient" aria-hidden="true" />
      <p className="contact-intro subhead">We’re here to solve problems, with you.</p>
      <h2 className="contact-heading">Let’s talk about your project</h2>
      <div className="contact-email">
        <h3 className="contact-label">Get in touch</h3>
        <a className="contact-link" href="mailto:hello@karinamercedes.com">
          hello@karinamercedes.com
        </a>
      </div>
    </section>
  )
}
