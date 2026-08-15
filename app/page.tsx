"use client";

import { FormEvent, MouseEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import ProjectsShowcase from "@/components/ProjectsShowcase";
import {
  DEFAULT_SITE_CONTENT,
  type AboutSegment,
  type ServiceItem,
  type SiteContent,
} from "@/lib/default-site-content";

function buildStructuredData(siteContent: SiteContent) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "FindFlow",
        description:
          "An AI automation and software development company serving startups, SMEs and product teams across Europe.",
        areaServed: "Europe",
        knowsAbout: siteContent.services.items.map((service) => service.title),
      },
      {
        "@type": "Service",
        name: "AI Automation and Software Development",
        provider: { "@type": "Organization", name: "FindFlow" },
        areaServed: "Europe",
        serviceType: siteContent.services.items.map((service) => service.title),
      },
      {
        "@type": "FAQPage",
        mainEntity: siteContent.faq.items.map((faq) => ({
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
}

function renderAboutStatement(statement: AboutSegment[]) {
  return statement.map((segment, index) =>
    segment.emphasis ? <b key={`${segment.text}-${index}`}>{segment.text}</b> : <span key={`${segment.text}-${index}`}>{segment.text}</span>,
  );
}

function Brand({ inverse = false, onNavigate }: { inverse?: boolean; onNavigate?: () => void }) {
  return (
    <a
      className={`brand ${inverse ? "brand--inverse" : ""}`}
      href="/"
      onClick={(event) => {
        if (!onNavigate) {
          return;
        }

        event.preventDefault();
        onNavigate();
      }}
    >
      <span className="brand__mark" aria-hidden="true">
        <i />
        <i />
      </span>
      <span className="brand__copy">
        <b>FindFlow</b>
        <small>AI &middot; Product &middot; Software</small>
      </span>
    </a>
  );
}

function ServiceGlyph({ type }: { type: string }) {
  return <span className={`service-glyph service-glyph--${type}`} aria-hidden="true" />;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [siteContent, setSiteContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [selectedService, setSelectedService] = useState(DEFAULT_SITE_CONTENT.services.items[0]?.key ?? "automation");
  const [formStatus, setFormStatus] = useState("");

  const services = siteContent.services.items;
  const principles = siteContent.process.items;
  const structuredData = useMemo(() => buildStructuredData(siteContent), [siteContent]);

  useEffect(() => {
    let active = true;

    async function loadSiteContent() {
      try {
        const response = await fetch("/api/site-content", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Site content request failed with ${response.status}`);
        }

        const payload: { siteContent?: SiteContent } = await response.json();
        if (active && payload.siteContent) {
          setSiteContent(payload.siteContent);
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadSiteContent();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!services.some((service) => service.key === selectedService)) {
      setSelectedService(services[0]?.key ?? "automation");
    }
  }, [selectedService, services]);

  useEffect(() => {
    const queryTarget = new URLSearchParams(window.location.search).get("section");
    const storedTarget = window.sessionStorage.getItem("findflow-scroll-target");
    const target = storedTarget || queryTarget;

    if (!target) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const element = document.getElementById(target);
      if (!element) {
        return;
      }

      element.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState({}, "", "/");
      if (storedTarget) {
        window.sessionStorage.removeItem("findflow-scroll-target");
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  function navigateToSection(target: string) {
    const element = document.getElementById(target);
    closeMenu();

    if (!element) {
      window.history.replaceState({}, "", "/");
      return;
    }

    element.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState({}, "", "/");
  }

  function handleNavigationClick(event: MouseEvent<HTMLAnchorElement>, target: string) {
    event.preventDefault();
    navigateToSection(target);
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    try {
      setFormStatus("Saving your brief...");
      const service = services.find((item) => item.key === selectedService);
      const formData = new FormData(form);
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: String(formData.get("firstName") ?? ""),
          lastName: String(formData.get("lastName") ?? ""),
          email: String(formData.get("email") ?? ""),
          phone: String(formData.get("phone") ?? ""),
          serviceKey: selectedService,
          serviceLabel: service?.title ?? selectedService,
          message: String(formData.get("message") ?? ""),
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Could not submit your project brief right now.");
      }

      setFormStatus(payload.message || "Your brief has been saved.");
      form.reset();
      setSelectedService(services[0]?.key ?? "automation");
    } catch (error) {
      setFormStatus(error instanceof Error ? error.message : "Could not submit your project brief right now.");
    }
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
            <Brand onNavigate={() => navigateToSection("home")} />
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
              {siteContent.navigation.items.map((item) => (
                <a key={item.label} href="/" onClick={(event) => handleNavigationClick(event, item.target)}>
                  {item.label}
                </a>
              ))}
              <a
                className="nav-cta"
                href="/"
                onClick={(event) => handleNavigationClick(event, siteContent.navigation.ctaTarget)}
              >
                {siteContent.navigation.ctaLabel}
              </a>
            </nav>
          </header>

          <div className="hero-copy reveal">
            <h1>
              <span>{siteContent.hero.titleLead}</span>
              {siteContent.hero.titleMain}
            </h1>
            <p>{siteContent.hero.description}</p>
            <div className="hero-actions">
              <a
                className="button button--primary"
                href="/"
                onClick={(event) => handleNavigationClick(event, siteContent.hero.primaryCtaTarget)}
              >
                {siteContent.hero.primaryCtaLabel}
              </a>
              <a
                className="text-link"
                href="/"
                onClick={(event) => handleNavigationClick(event, siteContent.hero.secondaryCtaTarget)}
              >
                {siteContent.hero.secondaryCtaLabel} <span>-&gt;</span>
              </a>
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
                />
                <span className="date-chip">Discover -&gt; Deliver</span>
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
                  <i /><i /><i /><i /><span>-&gt;</span>
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
          <p className="eyebrow reveal">{siteContent.about.eyebrow}</p>
          <h2 className="about-statement reveal">{renderAboutStatement(siteContent.about.statement)}</h2>
          <div className="values reveal">
            {siteContent.about.values.map((value) => (
              <div className="value" key={value.label}>
                <span>{value.icon}</span><small>{value.label}</small>
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
        <p className="eyebrow reveal">{siteContent.services.eyebrow}</p>
        <div className="services-grid">
          {services.map((service: ServiceItem) => (
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

      <ProjectsShowcase
        id="case-studies"
        limit={9}
        showFilters={false}
        showViewAll
        contactHref={`scroll:${siteContent.whatWeBuild.ctaTarget}`}
        ctaLabel={siteContent.whatWeBuild.ctaLabel}
        eyebrow={siteContent.whatWeBuild.eyebrow}
        title={siteContent.whatWeBuild.title}
      />

      <section className="testimonial-section" id="process">
        <div className="section-pad section-pad--dark">
          <p className="eyebrow eyebrow--light reveal">{siteContent.process.eyebrow}</p>
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
          <p className="eyebrow reveal">{siteContent.contact.eyebrow}</p>
          <div className="contact-panel reveal">
            <form className="contact-form" onSubmit={submitForm}>
              <h2>{siteContent.contact.title}</h2>
              <p>{siteContent.contact.description}</p>
              <fieldset>
                <legend>{siteContent.contact.legend}</legend>
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
              />
              <div className="contact-info">
                {siteContent.contact.info.map((item) => (
                  <div key={item.label}><small>{item.label}</small><b>{item.value}</b></div>
                ))}
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
        <p className="eyebrow">{siteContent.faq.eyebrow}</p>
        <div className="faq-list">
          {siteContent.faq.items.map((faq, index) => (
            <details key={faq.question} open={index === 0}>
              <summary>{faq.question}<span aria-hidden="true" /></summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-main">
          <Brand inverse onNavigate={() => navigateToSection("home")} />
          <p>{siteContent.footer.description}</p>
          <a className="footer-cta" href="/" onClick={(event) => handleNavigationClick(event, siteContent.navigation.ctaTarget)}>
            {siteContent.footer.ctaLabel} <span>-&gt;</span>
          </a>
        </div>
        <div className="footer-bottom">
          <span>{siteContent.footer.copyright}</span>
          <span>{siteContent.footer.policyText}</span>
        </div>
      </footer>
    </main>
  );
}




