export type NavigationItem = {
  label: string;
  target: string;
};

export type ServiceItem = {
  key: string;
  glyph: string;
  title: string;
  description: string;
  tags: string[];
};

export type AboutSegment = {
  text: string;
  emphasis?: boolean;
};

export type ValueItem = {
  icon: string;
  label: string;
};

export type ProcessItem = {
  title: string;
  text: string;
  marker: string;
};

export type ContactInfoItem = {
  label: string;
  value: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type SiteContent = {
  navigation: {
    items: NavigationItem[];
    ctaLabel: string;
    ctaTarget: string;
  };
  hero: {
    titleLead: string;
    titleMain: string;
    description: string;
    primaryCtaLabel: string;
    primaryCtaTarget: string;
    secondaryCtaLabel: string;
    secondaryCtaTarget: string;
  };
  services: {
    eyebrow: string;
    items: ServiceItem[];
  };
  whatWeBuild: {
    eyebrow: string;
    title: string;
    ctaLabel: string;
    ctaTarget: string;
    allProjectsEyebrow: string;
    allProjectsTitle: string;
  };
  about: {
    eyebrow: string;
    statement: AboutSegment[];
    values: ValueItem[];
  };
  process: {
    eyebrow: string;
    items: ProcessItem[];
  };
  contact: {
    eyebrow: string;
    title: string;
    description: string;
    legend: string;
    info: ContactInfoItem[];
  };
  faq: {
    eyebrow: string;
    items: FaqItem[];
  };
  footer: {
    description: string;
    ctaLabel: string;
    copyright: string;
    policyText: string;
  };
};

export const EDITABLE_SITE_SECTION_KEYS = [
  "navigation",
  "hero",
  "services",
  "whatWeBuild",
  "about",
  "process",
  "contact",
  "faq",
  "footer",
] as const;

export type EditableSiteSectionKey = (typeof EDITABLE_SITE_SECTION_KEYS)[number];

export const SITE_SECTION_LABELS: Record<EditableSiteSectionKey, string> = {
  navigation: "Navigation",
  hero: "Home",
  services: "Services",
  whatWeBuild: "What We Build",
  about: "About Us",
  process: "How We Work",
  contact: "Plan a Project",
  faq: "Questions",
  footer: "Footer",
};

export const DEFAULT_SITE_CONTENT: SiteContent = {
  navigation: {
    items: [
      { label: "Home", target: "home" },
      { label: "Services", target: "services" },
      { label: "What We Build", target: "case-studies" },
      { label: "About Us", target: "about" },
      { label: "How We Work", target: "process" },
    ],
    ctaLabel: "Plan a Project",
    ctaTarget: "contact",
  },
  hero: {
    titleLead: "AI Automation &",
    titleMain: "Software Built to Flow",
    description:
      "FindFlow helps European startups and SMEs automate operations, launch SaaS products and build high-performance digital experiences with one integrated product and engineering team.",
    primaryCtaLabel: "Plan Your Project",
    primaryCtaTarget: "contact",
    secondaryCtaLabel: "Explore Services",
    secondaryCtaTarget: "services",
  },
  services: {
    eyebrow: "/SERVICES",
    items: [
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
    ],
  },
  whatWeBuild: {
    eyebrow: "/WHAT WE BUILD",
    title: "From the first workflow map to production software, one team owns the delivery path.",
    ctaLabel: "Plan Your Project",
    ctaTarget: "contact",
    allProjectsEyebrow: "/ALL PROJECTS",
    allProjectsTitle:
      "Explore the automation systems, websites, and digital products FindFlow has delivered for teams that needed sharper operations and stronger digital experiences.",
  },
  about: {
    eyebrow: "/ABOUT US",
    statement: [
      { text: "FindFlow is an " },
      { text: "AI-first product and software company", emphasis: true },
      { text: " helping European teams turn " },
      { text: "manual work into intelligent workflows", emphasis: true },
      { text: " and promising ideas into " },
      { text: "useful, scalable digital products", emphasis: true },
      { text: " with strategy, design and engineering connected from day one." },
    ],
    values: [
      { icon: "*", label: "Outcome-led Discovery" },
      { icon: "+", label: "Product Thinking" },
      { icon: "<", label: "Privacy by Design" },
      { icon: "x", label: "Reliable Engineering" },
      { icon: "o", label: "Clear Partnership" },
    ],
  },
  process: {
    eyebrow: "/HOW WE WORK",
    items: [
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
    ],
  },
  contact: {
    eyebrow: "/START A PROJECT",
    title: "Let's Map the Opportunity",
    description:
      "Tell us what is slowing the team down or what you want to launch. We'll turn it into a practical first scope.",
    legend: "What do you need help with?",
    info: [
      { label: "Collaboration", value: "UK & CET overlap" },
      { label: "Delivery", value: "Remote-first" },
      { label: "First Step", value: "Focused discovery call" },
    ],
  },
  faq: {
    eyebrow: "/QUESTIONS",
    items: [
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
    ],
  },
  footer: {
    description: "AI automation and software development for ambitious European teams.",
    ctaLabel: "Plan your project",
    copyright: "(c) 2026 FindFlow. All rights reserved.",
    policyText: "Privacy by design  Accessible delivery",
  },
};
