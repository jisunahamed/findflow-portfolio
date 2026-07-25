# FindFlow Website

The public website for FindFlow, an AI automation and software development
company serving startups, SMEs, and product teams across Europe.

## Services represented

- AI automation
- Web development
- Product design
- Software development
- SaaS development

## Local development

Requires Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verification

```bash
npm run lint
npm run test
```

The test command creates a production build and checks the rendered homepage,
metadata, structured data, responsive styling, and interactive client bundle.

## Vercel deployment

Import the GitHub repository into Vercel. The project uses Vercel's standard
Next.js defaults:

- Framework preset: Next.js
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: managed automatically by Next.js
- Node.js: 22.x

Every push creates a preview deployment. Changes merged or pushed to the Vercel
production branch create a production deployment.

## Production SEO setup

Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin before the production build:

```text
NEXT_PUBLIC_SITE_URL=https://www.your-domain.example
```

When configured, FindFlow adds the self-referencing canonical URL and production
sitemap location to `robots.txt`. On Vercel, the production deployment domain is
used automatically when `NEXT_PUBLIC_SITE_URL` is not set. The sitemap stays
empty on localhost so a development URL cannot accidentally become canonical.

Cloudflare/vinext tooling remains available as an optional fallback through
`npm run dev:cloudflare` and `npm run build:cloudflare`.

Before launch, also add:

- a verified contact email and working form endpoint
- approved portfolio projects and client evidence
- privacy, cookie, and terms pages
- analytics and Google Search Console

The working company profile, audience, messaging, and research rationale are in
`.agents/product-marketing-context.md`.
