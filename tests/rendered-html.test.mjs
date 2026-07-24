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

test("server-renders the complete Boxes homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Boxes \| Intelligent Communications<\/title>/i);
  assert.match(html, /Your Global Partner/);
  assert.match(html, /for Creative Solutions/);
  assert.match(html, /id="about"/);
  assert.match(html, /id="services"/);
  assert.match(html, /id="case-studies"/);
  assert.match(html, /id="testimonials"/);
  assert.match(html, /id="contact"/);
  assert.match(html, /\/QUESTIONS/);
  assert.match(html, /aria-label="Toggle navigation"/);
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
  assert.match(css, /--purple: #8958fe/);
  assert.match(css, /--navy: #030d28/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await assert.rejects(
    access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)),
  );
});
