import assert from "node:assert/strict";
import test from "node:test";

const baseUrl = process.env.E2E_BASE_URL ?? "http://127.0.0.1:3000";

async function renderHomepage() {
  const response = await fetch(`${baseUrl}/en`);
  assert.equal(response.status, 200);
  return response.text();
}

function count(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

test("Homepage render đúng composition và Plumb IDs của Figma", async () => {
  const html = await renderHomepage();
  assert.equal(count(html, /<main\b/g), 1, "cần đúng một main landmark");
  assert.equal(count(html, /<h1\b/g), 1, "cần đúng một h1");

  const ids = [
    "frame-2085667109",
    "frame-2085667100",
    "frame-2085667104",
    "frame-2085667107",
  ];
  const offsets = ids.map((id) => html.indexOf(`data-plumb-id="${id}"`));
  assert.ok(offsets.every((offset) => offset >= 0), "thiếu root data-plumb-id");
  assert.deepEqual(offsets, [...offsets].sort((a, b) => a - b), "sai thứ tự section");
  assert.ok(!html.includes('data-home-section="faq"'), "Homepage không có FAQ trong Figma");
  assert.ok(html.indexOf("<footer") > html.indexOf("</main>"), "footer phải nằm sau main");
});

test("Homepage đáp ứng native image contract", async () => {
  const html = await renderHomepage();
  assert.match(html, /<source[^>]+type="image\/avif"/);
  assert.match(html, /<source[^>]+type="image\/webp"/);
  assert.match(
    html,
    /<img[^>]+fetchPriority="high"[^>]+loading="eager"[^>]+decoding="async"[^>]+width="\d+"[^>]+height="\d+"[^>]+sizes="[^"]+"/,
  );
  assert.match(html, /<img[^>]+loading="lazy"[^>]+decoding="async"/);
});
