import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the complete FindFlow homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
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
});

test("keeps the final build interactive and removes the starter preview", async () => {
  const [page, css, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
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
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await assert.rejects(
    access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)),
  );
});
