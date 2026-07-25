"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";

const services = [
  {
    key: "automation",
    glyph: "strategic",
    title: "AI Automation",
    description:
      "Turn repetitive, error-prone work into dependable AI-assisted workflows built around your team and data.",
    tags: [
      "AI Agents",
      "Workflow Automation",
      "Internal Copilots",
      "Document Processing",
      "CRM & API Integration",
    ],
  },
  {
    key: "web",
    glyph: "financial",
    title: "Web Development",
    description:
      "Fast, accessible websites and web applications designed to communicate clearly and convert confidently.",
    tags: [
      "Marketing Websites",
      "Web Applications",
      "E-Commerce",
      "Technical SEO",
      "Performance",
    ],
  },
  {
    key: "design",
    glyph: "digital",
    title: "Product Design",
    description:
      "Make the right product easier to understand and use through research, prototyping and purposeful interface design.",
    tags: [
      "Product Strategy",
      "UX Research",
      "UI Design",
      "Prototyping",
      "Design Systems",
    ],
  },
  {
    key: "software",
    glyph: "strategic",
    title: "Software Development",
    description:
      "Custom software engineered for real operations, with maintainable architecture, testing and a clear handover.",
    tags: [
      "Custom Applications",
      "Frontend & Backend",
      "API Engineering",
      "Cloud & DevOps",
      "QA & Modernisation",
    ],
  },
  {
    key: "saas",
    glyph: "financial",
    title: "SaaS Development",
    description:
      "Move from a validated idea to a scalable SaaS product with one team covering product, design and engineering.",
    tags: [
      "MVP Development",
      "Authentication",
      "Billing",
      "Multi-Tenant Systems",
      "Analytics & Scale",
    ],
  },
];

const principles = [
  {
    title: "Discovery before delivery",
    text:
      "We map the workflow, users, constraints and commercial goal before choosing the technology.",
    marker: "01",
  },
  {
    title: "One integrated team",
    text:
      "Product thinking, interface design and engineering stay connected from the first workshop to launch.",
    marker: "02",
  },
  {
    title: "Weekly proof of progress",
    text:
      "You see working software, clear decisions and the next milestone throughout the engagement.",
    marker: "03",
  },
  {
    title: "Privacy by design",
    text:
      "Data minimisation, access controls and responsible AI decisions are considered early, not added at the end.",
    marker: "04",
  },
  {
    title: "Accessible by default",
    text:
      "We design for keyboard access, readable interfaces, responsive devices and inclusive customer journeys.",
    marker: "05",
  },
  {
    title: "Built for ownership",
    text:
      "Clean documentation and a practical handover help your team operate and improve what we ship.",
    marker: "06",
  },
];

const faqs = [
  {
    question: "What does FindFlow build?",
    answer:
      "FindFlow designs and develops AI automations, high-performance websites, custom software and SaaS products. We can support the full journey from discovery and product design to engineering, launch and iteration.",
  },
  {
    question: "Do you work with companies across Europe?",
    answer:
      "Yes. FindFlow is a remote-first partner for European startups, SMEs and product teams, with planned collaboration windows for UK and Central European working hours.",
  },
  {
    question: "Can you automate an existing business process?",
    answer:
      "Yes. We begin by mapping the current workflow, data, tools and exceptions. We then identify where rules, integrations or AI can reduce manual work without removing necessary human oversight.",
  },
  {
    question: "Can FindFlow build an MVP and continue after launch?",
    answer:
      "Yes. We can validate the scope, design the core experience, build the MVP and continue with analytics, product iteration, integrations and scaling after launch.",
  },
  {
    question: "How do you approach GDPR, security and the EU AI Act?",
    answer:
      "We consider privacy, access, data minimisation, security and AI transparency during discovery and architecture. Final legal and regulatory compliance remains a shared process with your qualified legal or compliance advisers.",
  },
  {
    question: "What happens first?",
    answer:
      "We start with a focused conversation about the business goal, users, current systems and constraints. You then receive a recommended scope, delivery approach and clear next milestone.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "FindFlow",
      description:
        "An AI automation and software development company serving startups, SMEs and product teams across Europe.",
      areaServed: "Europe",
      knowsAbout: [
        "AI automation",
        "Web development",
        "Product design",
        "Software development",
        "SaaS development",
      ],
    },
    {
      "@type": "Service",
      name: "AI Automation and Software Development",
      provider: { "@type": "Organization", name: "FindFlow" },
      areaServed: "Europe",
      serviceType: services.map((service) => service.title),
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ],
};

function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <a className={`brand ${inverse ? "brand--inverse" : ""}`} href="#home">
      <span className="brand__mark" aria-hidden="true">
        <i />
        <i />
      </span>
      <span className="brand__copy">
        <b>FindFlow</b>
        <small>AI · Product · Software</small>
      </span>
    </a>
  );
}

function ServiceGlyph({ type }: { type: string }) {
  return <span className={`service-glyph service-glyph--${type}`} aria-hidden="true" />;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("automation");
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
    setFormStatus(
      "Your brief is ready. Connect a verified contact endpoint before the production launch.",
    );
    form.reset();
  }

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
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
            <a href="#case-studies" onClick={closeMenu}>What We Build</a>
            <a href="#about" onClick={closeMenu}>About Us</a>
            <a href="#process" onClick={closeMenu}>How We Work</a>
            <a className="nav-cta" href="#contact" onClick={closeMenu}>Plan a Project</a>
          </nav>
        </header>

        <div className="hero-copy reveal">
          <h1>
            <span>AI Automation &amp;</span>
            Software Built to Flow
          </h1>
          <p>
            FindFlow helps European startups and SMEs automate operations, launch
            SaaS products and build high-performance digital experiences with one
            integrated product and engineering team.
          </p>
          <div className="hero-actions">
            <a className="button button--primary" href="#contact">Plan Your Project</a>
            <a className="text-link" href="#services">Explore Services <span>↗</span></a>
          </div>
        </div>

          <div className="mosaic reveal">
            <div className="mosaic-column mosaic-column--one">
              <article className="mosaic-card mosaic-card--purple mosaic-card--financial">
                <p className="mosaic-title">AI<br />Automation</p>
                <div className="mosaic-line" />
                <div className="floating-tags">
                  <span>AI Agents</span><span>Lead Routing</span><span>CRM Sync</span>
                  <span>Document Processing</span><span>Support Workflows</span>
                </div>
              </article>
              <article className="mosaic-card mosaic-card--photo mosaic-card--projects">
                <Image
                  src="/office.jpg"
                  alt="A team planning an AI automation workflow"
                  fill
                  sizes="(max-width: 720px) 50vw, 20vw"
                  unoptimized
                />
                <div className="photo-stat photo-stat--compact"><b>Less admin</b><small>More focused work</small></div>
              </article>
              <div className="mosaic-fade mosaic-fade--brand" aria-hidden="true" />
            </div>

            <div className="mosaic-column mosaic-column--two">
              <article className="mosaic-card mosaic-card--photo mosaic-card--clients">
                <Image
                  src="/team.jpg"
                  alt="A cross-functional product team collaborating around a table"
                  fill
                  sizes="(max-width: 720px) 50vw, 22vw"
                  priority
                  unoptimized
                />
                <span className="date-chip">Discover → Deliver</span>
                <div className="photo-stat"><b>One team</b><small>Strategy, design &amp; engineering</small></div>
              </article>
              <article className="mosaic-card mosaic-card--figures">
                <p>FindFlow<br />Delivery</p>
                <div>
                  <span><small>Understand<br />the goal</small><b>01</b></span>
                  <span><small>Design &amp;<br />build</small><b>02</b></span>
                  <span><small>Launch &amp;<br />improve</small><b>03</b></span>
                </div>
              </article>
            </div>

            <div className="mosaic-column mosaic-column--three">
              <article className="mosaic-card mosaic-card--cyan mosaic-card--comprehensive">
                <p className="mosaic-title">Product<br />Design</p>
                <div className="pattern" aria-hidden="true">F F F<br />F F F<br />F F F</div>
              </article>
              <article className="mosaic-card mosaic-card--photo mosaic-card--digital">
                <Image
                  src="/phone.jpg"
                  alt="A designer reviewing a digital product interface"
                  fill
                  sizes="(max-width: 720px) 50vw, 20vw"
                  unoptimized
                />
                <p>Web<br />Experiences</p>
              </article>
              <div className="mosaic-fade mosaic-fade--cyan" aria-hidden="true" />
            </div>

            <div className="mosaic-column mosaic-column--four">
              <article className="mosaic-card mosaic-card--photo mosaic-card--success">
                <Image
                  src="/consulting.jpg"
                  alt="Product specialists planning a software delivery roadmap"
                  fill
                  sizes="(max-width: 720px) 50vw, 22vw"
                  unoptimized
                />
                <p className="mosaic-title">Idea to<br />Launch</p>
              </article>
              <article className="mosaic-card mosaic-card--strategy">
                <p className="mosaic-title">SaaS<br />Development</p>
                <div className="strategy-mark" aria-hidden="true"><i /><i /><i /></div>
                <div className="strategy-tags">
                  <span>MVP</span><span>Billing &amp; Auth</span>
                  <span>Multi-Tenant</span><span>Analytics</span>
                </div>
              </article>
            </div>

            <div className="mosaic-column mosaic-column--five">
              <article className="mosaic-card mosaic-card--lavender mosaic-card--growth">
                <p className="mosaic-title">Software<br />Development</p>
                <div className="chart" aria-hidden="true">
                  <i /><i /><i /><i /><span>↗</span>
                </div>
                <b className="growth-value">Scale</b>
              </article>
              <article className="mosaic-card mosaic-card--stakeholders">
                <b>UK / CET</b><small>Planned collaboration<br />windows</small>
              </article>
              <div className="mosaic-fade mosaic-fade--photo" aria-hidden="true" />
            </div>
          </div>
        </section>

        <section className="about-section section-pad" id="about">
          <p className="eyebrow reveal">/ABOUT US</p>
          <h2 className="about-statement reveal">
            <span>FindFlow is an </span><b>AI-first product and software company</b><span> helping
            European teams turn </span><b>manual work into intelligent workflows</b><span> and
            promising ideas into </span><b>useful, scalable digital products</b><span>—with
            strategy, design and engineering connected from day one.</span>
          </h2>

          <div className="values reveal">
            {[
              ["✦", "Outcome-led Discovery"],
              ["✳", "Product Thinking"],
              ["◀", "Privacy by Design"],
              ["✕", "Reliable Engineering"],
              ["◒", "Clear Partnership"],
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
          <p>/BUILT FOR EUROPEAN TEAMS</p>
          <div className="client-logos" aria-label="Teams FindFlow works with">
            <span>STARTUPS</span>
            <span>SMEs</span>
            <span>SAAS TEAMS</span>
            <span>OPERATIONS</span>
            <span>INNOVATION</span>
          </div>
        </div>
      </section>

      <section className="services-section section-pad" id="services">
        <p className="eyebrow reveal">/SERVICES</p>
        <div className="services-grid">
          {services.map((service) => (
            <article className="service-column reveal" key={service.key}>
              <ServiceGlyph type={service.glyph} />
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
          <p className="eyebrow eyebrow--light reveal">/WHAT WE BUILD</p>
          <div className="case-intro reveal">
            <h2>From the first workflow map to production software, one team owns the delivery path.</h2>
            <a className="button button--outline" href="#contact">Plan Your Project <span>↗</span></a>
          </div>
          <div className="case-grid" id="more-work">
            <article className="case-card reveal">
              <div className="case-image notched-media">
                <Image
                  src="/phone.jpg"
                  alt="An AI workflow and customer portal being reviewed on a laptop"
                  fill
                  sizes="(max-width: 720px) 100vw, 50vw"
                  unoptimized
                />
              </div>
              <h3>Automate a High-Friction Operation</h3>
              <p>Connect forms, documents, inboxes, CRM data and human approvals into one reliable AI-assisted workflow.</p>
            </article>
            <article className="case-card case-card--lower reveal">
              <div className="case-image notched-media">
                <Image
                  src="/consulting.jpg"
                  alt="A SaaS product discovery and planning workshop in progress"
                  fill
                  sizes="(max-width: 720px) 100vw, 50vw"
                  unoptimized
                />
              </div>
              <h3>Launch a Market-Ready SaaS Product</h3>
              <p>Shape the MVP, design the user journey and build the product foundation for launch, learning and scale.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="testimonial-section" id="process">
        <div className="section-pad section-pad--dark">
          <p className="eyebrow eyebrow--light reveal">/HOW WE WORK</p>
          <div className="testimonial-grid">
            {principles.map((principle, index) => (
              <article className="testimonial reveal" key={principle.title}>
                <div className="quote-mark">{principle.marker}</div>
                <p>{principle.text}</p>
                <footer>
                  <span className={`avatar avatar--${index + 1}`}>{principle.marker}</span>
                  <span><b>{principle.title}</b><small>FindFlow delivery principle</small></span>
                </footer>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="section-pad">
          <p className="eyebrow reveal">/START A PROJECT</p>
          <div className="contact-panel reveal">
            <form className="contact-form" onSubmit={submitForm}>
              <h2>Let&apos;s Map the Opportunity</h2>
              <p>Tell us what is slowing the team down or what you want to launch. We&apos;ll turn it into a practical first scope.</p>
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
                      <ServiceGlyph type={service.glyph} />
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
              <button className="button button--primary button--submit" type="submit">Prepare Project Brief</button>
              <p className="form-status" role="status">{formStatus}</p>
            </form>
            <aside className="contact-visual">
              <Image
                src="/handshake.jpg"
                alt="A collaborative software partnership beginning with a handshake"
                fill
                sizes="(max-width: 980px) 100vw, 50vw"
                unoptimized
              />
              <div className="contact-info">
                <div><small>Collaboration</small><b>UK &amp; CET overlap</b></div>
                <div><small>Delivery</small><b>Remote-first</b></div>
                <div><small>First Step</small><b>Focused discovery call</b></div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="trusted-strip">
        <div className="trusted-strip__inner">
          <p>/DELIVERY FLOW</p>
          <div>
            <span>DISCOVER</span><span>DESIGN</span><span className="script-logo">BUILD</span><span>LAUNCH</span><span>IMPROVE</span>
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
          <p>AI automation and software development for ambitious European teams.</p>
          <a className="footer-cta" href="#contact">Plan your project <span>↗</span></a>
        </div>
        <div className="footer-bottom">
          <span>© 2026 FindFlow. All rights reserved.</span>
          <span>Privacy by design · Accessible delivery</span>
        </div>
      </footer>
    </main>
  );
}
