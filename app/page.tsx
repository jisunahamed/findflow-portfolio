"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";

const services = [
  {
    key: "strategic",
    title: "Strategic Services",
    description:
      "We shape reputations, navigate complex moments and build communication strategies that move people.",
    tags: [
      "Crisis Management",
      "Reputation Management",
      "Media Relations",
      "Public Relations",
      "Advertising",
    ],
  },
  {
    key: "financial",
    title: "Financial Services",
    description:
      "Clear, credible financial communications designed for investors, boards and fast-moving markets.",
    tags: [
      "Investor Relations",
      "Rights Issues",
      "Mergers & Acquisitions",
      "IPO Communications",
      "Funds Management",
      "Bonds Issuances",
      "Financial Analysis",
      "Regulatory Compliance",
    ],
  },
  {
    key: "digital",
    title: "Digital Services",
    description:
      "Connected digital experiences that turn attention into trust, action and measurable growth.",
    tags: [
      "SEO & PPC",
      "Content Marketing",
      "E-Commerce Solutions",
      "Tech Integration",
      "Social Media Management",
    ],
  },
];

const testimonials = [
  {
    quote:
      "Boxes understood the nuance of our market and transformed it into a clear, confident story.",
    name: "Amir Al-Hassan",
    role: "Chief Strategy Officer",
  },
  {
    quote:
      "The team brought discipline, speed and a level of creative thinking that changed the outcome.",
    name: "Noura Salem",
    role: "Director of Communications",
  },
  {
    quote:
      "From the first workshop to launch, every detail felt considered and commercially grounded.",
    name: "David Mercer",
    role: "Managing Partner",
  },
  {
    quote:
      "They made a complicated financial narrative simple, human and genuinely compelling.",
    name: "Rana Al-Khatib",
    role: "Head of Investor Relations",
  },
  {
    quote:
      "A rare partner that can challenge the brief while still protecting the heart of the brand.",
    name: "Maya Chen",
    role: "Global Brand Lead",
  },
  {
    quote:
      "Boxes gave our leadership team clarity and gave our audience a reason to believe.",
    name: "Omar Fadel",
    role: "Founder & CEO",
  },
];

const faqs = [
  {
    question: "What services does Boxes provide?",
    answer:
      "Boxes offers comprehensive services across three main areas: financial communications, strategic public relations and digital transformation, including brand, web, content and performance marketing.",
  },
  {
    question: "How can Boxes help my business grow?",
    answer:
      "We connect research, positioning, creative execution and distribution into one practical communication system built around your commercial goals.",
  },
  {
    question: "What industries does Boxes specialize in?",
    answer:
      "Our experience spans financial services, technology, real estate, government, consumer brands and fast-growing international businesses.",
  },
];

function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <a className={`brand ${inverse ? "brand--inverse" : ""}`} href="#home">
      <span className="brand__mark" aria-hidden="true">
        <i />
        <i />
      </span>
      <span className="brand__copy">
        <b>BOXES</b>
        <small>Intelligent Communications</small>
      </span>
    </a>
  );
}

function ServiceGlyph({ type }: { type: string }) {
  return <span className={`service-glyph service-glyph--${type}`} aria-hidden="true" />;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("strategic");
  const [formStatus, setFormStatus] = useState("");

  function closeMenu() {
    setMenuOpen(false);
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setFormStatus("Thank you. Our team will be in touch within one business day.");
    form.reset();
  }

  return (
    <main>
      <div className="intro-frame">
        <section className="hero-shell" id="home">
        <header className="site-header">
          <Brand />
          <button
            className="menu-button"
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
          <nav className={menuOpen ? "main-nav main-nav--open" : "main-nav"} aria-label="Main navigation">
            <a href="#home" onClick={closeMenu}>Home</a>
            <a href="#services" onClick={closeMenu}>Services</a>
            <a href="#case-studies" onClick={closeMenu}>Case Studies</a>
            <a href="#about" onClick={closeMenu}>About Us</a>
            <a href="#testimonials" onClick={closeMenu}>Careers</a>
            <a className="nav-cta" href="#contact" onClick={closeMenu}>Contact Us</a>
          </nav>
        </header>

        <div className="hero-copy reveal">
          <h1>
            <span>Your Global Partner</span>
            for Creative Solutions
          </h1>
          <p>
            Blending innovative digital strategies with traditional approaches,
            Boxes delivers comprehensive solutions, particularly excelling in
            financial communications and strategic public relations.
          </p>
          <div className="hero-actions">
            <a className="button button--primary" href="#contact">Contact Us</a>
            <a className="text-link" href="#case-studies">Case Studies <span>↗</span></a>
          </div>
        </div>

          <div className="mosaic reveal">
            <div className="mosaic-column mosaic-column--one">
              <article className="mosaic-card mosaic-card--purple mosaic-card--financial">
                <p className="mosaic-title">Financial<br />Services</p>
                <div className="mosaic-line" />
                <div className="floating-tags">
                  <span>IPO</span><span>Investor Relations</span><span>M&amp;A</span>
                  <span>Bonds Issuances</span><span>Financial Analysis</span>
                </div>
              </article>
              <article className="mosaic-card mosaic-card--photo mosaic-card--projects">
                <Image
                  src="/office.jpg"
                  alt="A modern communications office"
                  fill
                  sizes="(max-width: 720px) 50vw, 20vw"
                  unoptimized
                />
                <div className="photo-stat photo-stat--compact"><b>120+</b><small>Capital Market Projects</small></div>
              </article>
              <div className="mosaic-fade mosaic-fade--brand" aria-hidden="true" />
            </div>

            <div className="mosaic-column mosaic-column--two">
              <article className="mosaic-card mosaic-card--photo mosaic-card--clients">
                <Image
                  src="/team.jpg"
                  alt="Team collaborating around a table"
                  fill
                  sizes="(max-width: 720px) 50vw, 22vw"
                  priority
                  unoptimized
                />
                <span className="date-chip">2018 - 2025</span>
                <div className="photo-stat"><b>500+</b><small>Clients Served</small></div>
              </article>
              <article className="mosaic-card mosaic-card--figures">
                <p>Boxes<br />In Figures</p>
                <div>
                  <span><small>Strategic<br />Campaigns</small><b>200</b></span>
                  <span><small>Years of<br />Experience</small><b>7+</b></span>
                  <span><small>Sectors<br />Covered</small><b>50+</b></span>
                </div>
              </article>
            </div>

            <div className="mosaic-column mosaic-column--three">
              <article className="mosaic-card mosaic-card--cyan mosaic-card--comprehensive">
                <p className="mosaic-title">Comprehensive<br />Service</p>
                <div className="pattern" aria-hidden="true">B B B<br />B B B<br />B B B</div>
              </article>
              <article className="mosaic-card mosaic-card--photo mosaic-card--digital">
                <Image
                  src="/phone.jpg"
                  alt="Digital communications work on a laptop"
                  fill
                  sizes="(max-width: 720px) 50vw, 20vw"
                  unoptimized
                />
                <p>Digital<br />Services</p>
              </article>
              <div className="mosaic-fade mosaic-fade--cyan" aria-hidden="true" />
            </div>

            <div className="mosaic-column mosaic-column--four">
              <article className="mosaic-card mosaic-card--photo mosaic-card--success">
                <Image
                  src="/consulting.jpg"
                  alt="Consultants in a collaborative meeting"
                  fill
                  sizes="(max-width: 720px) 50vw, 22vw"
                  unoptimized
                />
                <p className="mosaic-title">Customer<br />Success</p>
              </article>
              <article className="mosaic-card mosaic-card--strategy">
                <p className="mosaic-title">Strategic<br />Services</p>
                <div className="strategy-mark" aria-hidden="true"><i /><i /><i /></div>
                <div className="strategy-tags">
                  <span>Crisis Management</span><span>Media Relations</span>
                  <span>Reputation Management</span><span>Advertising</span>
                </div>
              </article>
            </div>

            <div className="mosaic-column mosaic-column--five">
              <article className="mosaic-card mosaic-card--lavender mosaic-card--growth">
                <p className="mosaic-title">Investment<br />Benefits</p>
                <div className="chart" aria-hidden="true">
                  <i /><i /><i /><i /><span>↗</span>
                </div>
                <b className="growth-value">$1.5Bill</b>
              </article>
              <article className="mosaic-card mosaic-card--stakeholders">
                <b>50,000</b><small>Stakeholder<br />Engagements</small>
              </article>
              <div className="mosaic-fade mosaic-fade--photo" aria-hidden="true" />
            </div>
          </div>
        </section>

        <section className="about-section section-pad" id="about">
          <p className="eyebrow reveal">/ABOUT US</p>
          <h2 className="about-statement reveal">
            <span>BOXES is a </span><b>Next-Generation Global Agency</b><span> founded to </span>
            <b>Pioneer a New Era of Communications</b><span>, as it broadly combines all the skills,
            talents and tools used by </span><b>Modern Communication Systems</b><span>, &amp; modern or renewed brands.</span>
          </h2>

          <div className="values reveal">
            {[
              ["✦", "Strategic Excellence"],
              ["✳", "Creative Solutions"],
              ["◀", "Financial Expertise"],
              ["✕", "Comprehensive Service"],
              ["◒", "Transparency & Partnership"],
            ].map(([icon, label]) => (
              <div className="value" key={label}>
                <span>{icon}</span><small>{label}</small>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="client-strip">
        <div className="client-strip__inner">
          <p>/500+ CLIENTS SERVED</p>
          <div className="client-logos" aria-label="Selected client names">
            <span>SQUARESTONE</span>
            <span>VERTEX</span>
            <span>Matroma</span>
            <span>MARTINO</span>
            <span>VISTRA</span>
          </div>
        </div>
      </section>

      <section className="services-section section-pad" id="services">
        <p className="eyebrow reveal">/SERVICES</p>
        <div className="services-grid">
          {services.map((service) => (
            <article className="service-column reveal" key={service.key}>
              <ServiceGlyph type={service.key} />
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <div className="tags">
                {service.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="case-section" id="case-studies">
        <div className="case-inner">
          <p className="eyebrow eyebrow--light reveal">/CASE STUDIES</p>
          <div className="case-intro reveal">
            <h2>We Blend innovative digital strategies with traditional approaches, To deliver comprehensive solutions</h2>
            <a className="button button--outline" href="#more-work">More Case Studies <span>↗</span></a>
          </div>
          <div className="case-grid" id="more-work">
            <article className="case-card reveal">
              <div className="case-image notched-media">
                <Image
                  src="/phone.jpg"
                  alt="Digital experience on a laptop"
                  fill
                  sizes="(max-width: 720px) 100vw, 50vw"
                  unoptimized
                />
              </div>
              <h3>Financial Narrative, Reframed</h3>
              <p>Investor positioning, identity and digital communications for a fast-moving market leader.</p>
            </article>
            <article className="case-card case-card--lower reveal">
              <div className="case-image notched-media">
                <Image
                  src="/consulting.jpg"
                  alt="Creative strategy workshop in progress"
                  fill
                  sizes="(max-width: 720px) 100vw, 50vw"
                  unoptimized
                />
              </div>
              <h3>One Brand, Global Momentum</h3>
              <p>A connected communication system created to support expansion across markets and audiences.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="testimonial-section" id="testimonials">
        <div className="section-pad section-pad--dark">
          <p className="eyebrow eyebrow--light reveal">/TESTIMONIALS</p>
          <div className="testimonial-grid">
            {testimonials.map((testimonial, index) => (
              <article className="testimonial reveal" key={testimonial.name}>
                <div className="quote-mark">“</div>
                <p>{testimonial.quote}</p>
                <footer>
                  <span className={`avatar avatar--${index + 1}`}>{testimonial.name.charAt(0)}</span>
                  <span><b>{testimonial.name}</b><small>{testimonial.role}</small></span>
                </footer>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="section-pad">
          <p className="eyebrow reveal">/CONTACT US</p>
          <div className="contact-panel reveal">
            <form className="contact-form" onSubmit={submitForm}>
              <h2>Let&apos;s Work Together</h2>
              <p>We deliver comprehensive solutions, particularly excelling in financial communications and strategic public relations.</p>
              <fieldset>
                <legend>What do you need help with?</legend>
                <div className="service-selector">
                  {services.map((service) => (
                    <button
                      className={selectedService === service.key ? "selector-card selector-card--active" : "selector-card"}
                      type="button"
                      key={service.key}
                      onClick={() => setSelectedService(service.key)}
                      aria-pressed={selectedService === service.key}
                    >
                      <ServiceGlyph type={service.key} />
                      <span>{service.title}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
              <input type="hidden" name="service" value={selectedService} />
              <div className="input-row">
                <label>First Name<input name="firstName" required autoComplete="given-name" /></label>
                <label>Last Name<input name="lastName" required autoComplete="family-name" /></label>
              </div>
              <div className="input-row">
                <label>Email<input name="email" type="email" required autoComplete="email" /></label>
                <label>Phone Number<input name="phone" type="tel" autoComplete="tel" /></label>
              </div>
              <label>Message<textarea name="message" rows={3} required /></label>
              <button className="button button--primary button--submit" type="submit">Submit</button>
              <p className="form-status" role="status">{formStatus}</p>
            </form>
            <aside className="contact-visual">
              <Image
                src="/handshake.jpg"
                alt="Business partners shaking hands"
                fill
                sizes="(max-width: 980px) 100vw, 50vw"
                unoptimized
              />
              <div className="contact-info">
                <div><small>Office Hours</small><b>Sun - Thu, 9AM - 6PM</b></div>
                <div><small>Address</small><b>King Fahd Road, Riyadh</b></div>
                <div><small>Get in Touch</small><b>hello@boxes.agency</b></div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="trusted-strip">
        <div className="trusted-strip__inner">
          <p>/TRUSTED PARTNERS</p>
          <div>
            <span>SquareStone</span><span>VERTEX</span><span className="script-logo">Matroma</span><span>martino</span><span>Vistula</span>
          </div>
        </div>
      </section>

      <section className="faq-section section-pad">
        <p className="eyebrow">/QUESTIONS</p>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <details key={faq.question} open={index === 0}>
              <summary>{faq.question}<span aria-hidden="true" /></summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-main">
          <Brand inverse />
          <p>Intelligent communication for ambitious brands and modern markets.</p>
          <a className="footer-cta" href="#contact">Start a conversation <span>↗</span></a>
        </div>
        <div className="footer-bottom">
          <span>© 2026. All Rights Reserved</span>
          <span><a href="#home">Privacy Policy</a><a href="#home">Terms Of Service</a></span>
        </div>
      </footer>
    </main>
  );
}
