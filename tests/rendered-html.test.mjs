import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("Next.js prerenders the complete FindFlow homepage", async () => {
  const html = await readFile(
    new URL("../.next/server/app/index.html", import.meta.url),
    "utf8",
  );
  assert.match(
    html,
    /<title>FindFlow \| AI Automation &amp; Software Development<\/title>/i,
  );
  assert.match(
    html,
    /<meta name="description" content="FindFlow designs AI automation, SaaS products, custom software and high-performance websites for ambitious startups, SMEs and product teams across Europe\."/i,
  );
  assert.match(html, /AI Automation &amp;/);
  assert.match(html, /Software Built to Flow/);
  assert.match(html, /FindFlow is an/);
  assert.match(html, /Software Development/);
  assert.match(html, /SaaS Development/);
  assert.match(html, /id="about"/);
  assert.match(html, /id="services"/);
  assert.match(html, /id="case-studies"/);
  assert.match(html, /id="process"/);
  assert.match(html, /id="contact"/);
  assert.match(html, /\/QUESTIONS/);
  assert.match(html, /aria-label="Toggle navigation"/);
  assert.match(html, /type="application\/ld\+json"/);
  assert.match(html, /FAQPage/);
  assert.match(html, /Privacy by design/);
  assert.doesNotMatch(html, /\bBOXES\b|boxes\.agency|500\+ CLIENTS|King Fahd Road/i);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/i);

  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelHost) {
    assert.match(
      html,
      new RegExp(
        `<link rel="canonical" href="https://${vercelHost.replaceAll(".", "\\.")}/?"`,
      ),
    );
  }
});

test("keeps the Vercel build interactive and removes the starter preview", async () => {
  const [page, css, packageJson, robots, sitemap] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../.next/server/app/robots.txt.body", import.meta.url), "utf8"),
    readFile(new URL("../.next/server/app/sitemap.xml.body", import.meta.url), "utf8"),
  ]);

  assert.match(page, /^"use client";/);
  assert.match(page, /setMenuOpen/);
  assert.match(page, /setSelectedService/);
  assert.match(page, /form\.checkValidity/);
  assert.match(page, /role="status"/);
  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /--purple: #67d8f7/);
  assert.match(css, /--navy: #030d28/);
  assert.match(css, /:focus-visible/);
  assert.match(packageJson, /"name": "findflow-website"/);
  assert.match(packageJson, /"build": "next build"/);
  assert.match(packageJson, /"start": "next start"/);
  assert.match(robots, /User-Agent: \*/);
  assert.match(robots, /Allow: \//);
  assert.match(sitemap, /<urlset/);
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    assert.match(sitemap, new RegExp(process.env.VERCEL_PROJECT_PRODUCTION_URL));
  }
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await assert.rejects(
    access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)),
  );
});
