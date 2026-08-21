#!/usr/bin/env node
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const SOURCE_FILE = path.join(ROOT, "tmp", "source-chefs.png");
const OUTPUT_DIR = path.join(ROOT, "public", "images", "home");

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const name = "source-chefs";
  const base = path.join(OUTPUT_DIR, name);

  console.log(`Optimizing ${SOURCE_FILE}...`);

  await Promise.all([
    sharp(SOURCE_FILE)
      .avif({ quality: 55, effort: 6 })
      .toFile(`${base}.avif`),
    sharp(SOURCE_FILE)
      .webp({ quality: 78, effort: 6 })
      .toFile(`${base}.webp`),
    sharp(SOURCE_FILE)
      .png({ compressionLevel: 9, palette: true })
      .toFile(`${base}.png`),
  ]);

  console.log(`Optimized images generated successfully at ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
