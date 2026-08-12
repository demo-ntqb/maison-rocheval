import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repoRoot = new URL("../../", import.meta.url);

async function readSource(path) {
  if (process.env.SOURCE_REF) {
    return execFileSync("git", ["show", `${process.env.SOURCE_REF}:${path}`], {
      cwd: repoRoot,
      encoding: "utf8",
    });
  }

  return readFile(new URL(path, repoRoot), "utf8");
}

test("Products content wrapper thích ứng theo nội dung", async () => {
  const source = await readSource("src/app/[locale]/products/page.tsx");

  assert.doesNotMatch(source, /h-\[3646px\]/);
  assert.match(source, /gap-\[200px\]/);
  assert.match(source, /pb-\[200px\]/);
  assert.match(source, /pt-\[100px\]/);
});

test("FAQ Products dùng full-width responsive spacing", async () => {
  const source = await readSource("src/screens/shop/sections/shop-faq.section.tsx");

  assert.doesNotMatch(source, /h-\[846px\]/);
  assert.match(source, /w-full/);
  assert.match(source, /py-24/);
  assert.match(source, /lg:py-\[200px\]/);
  assert.match(source, /<FaqSection/);
});
