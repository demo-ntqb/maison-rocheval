#!/usr/bin/env node
/**
 * Generates pre-optimized <picture> assets for the about-the-brand screen.
 *
 * The project deliberately does not use next/image (see AGENTS.md), so every
 * asset is resized and encoded ahead of time and served as a static file.
 *
 * Sources live in assets/about-brand/ — the Figma exports committed earlier (the
 * original PNGs). Each image gets an AVIF, a WebP and a JPEG fallback plus the
 * width variants the <Picture> component references in its srcset.
 *
 * Usage:
 *   node scripts/pre-optimization-images/generate-about-brand-images.mjs
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const SOURCE_DIR = path.join(ROOT, "assets", "about-brand");
const OUTPUT_DIR = path.join(ROOT, "public", "images", "about-brand");

/** [output name, fallback ext, responsive widths] — widths match each section's `sizes`. */
const IMAGES = [
  // Hero (LCP, 100vw full-bleed).
  ["hero-maison-lake-desktop", "jpg", [640, 1000, 1400, 1920]],
  ["hero-maison-lake-mobile", "jpg", [640, 1000, 1400, 1920]],
  // Ritual photo, max 1000px wide.
  ["ritual-table-desktop", "jpg", [640, 1000, 1400]],
  ["ritual-table-mobile", "jpg", [640, 1000, 1400]],
  // Selection photo, max 1000px wide.
  ["harvest-sturgeon-desktop", "jpg", [640, 1000]],
  ["harvest-sturgeon-mobile", "jpg", [640, 1000]],
  // Story photo, max ~470px wide.
  ["story-source", "jpg", [480, 640, 1000]],
  // Source-to-ritual pair, max ~484px wide.
  ["source-to-ritual-preparation", "jpg", [480, 640, 1000]],
  ["source-to-ritual-service", "jpg", [480, 640, 1000]],
  // Venue cards, max 500px wide (86vw on mobile).
  ["venue-company-b", "jpg", [500, 1000]],
  ["venue-alliance-figma", "jpg", [500, 1000]],
  ["venue-company-c", "jpg", [500, 1000]],
];

async function encodeBase(pipeline, outputDir, name, fallback) {
  const base = path.join(outputDir, name);
  const buffer = await pipeline.toBuffer();
  const { width, height } = await sharp(buffer).metadata();

  await Promise.all([
    sharp(buffer).avif({ quality: 55, effort: 6 }).toFile(`${base}.avif`),
    sharp(buffer).webp({ quality: 78, effort: 6 }).toFile(`${base}.webp`),
    fallback === "png"
      ? sharp(buffer).png({ compressionLevel: 9, palette: true }).toFile(`${base}.png`)
      : sharp(buffer).jpeg({ quality: 82, mozjpeg: true }).toFile(`${base}.jpg`),
  ]);

  return { name, width, height };
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  for (const [name, fallback, widths] of IMAGES) {
    const sourcePath = path.join(SOURCE_DIR, `${name}.png`);
    const { width, height } = await encodeBase(sharp(sourcePath), OUTPUT_DIR, name, fallback);

    for (const targetWidth of widths) {
      const base = path.join(OUTPUT_DIR, `${name}-${targetWidth}`);
      const buffer = await sharp(sourcePath)
        .resize({ width: targetWidth, withoutEnlargement: true })
        .toBuffer();

      await Promise.all([
        sharp(buffer).avif({ quality: 55, effort: 6 }).toFile(`${base}.avif`),
        sharp(buffer).webp({ quality: 78, effort: 6 }).toFile(`${base}.webp`),
        fallback === "png"
          ? sharp(buffer).png({ compressionLevel: 9, palette: true }).toFile(`${base}.png`)
          : sharp(buffer).jpeg({ quality: 82, mozjpeg: true }).toFile(`${base}.jpg`),
      ]);
    }

    console.log(`${name.padEnd(32)} ${width}x${height}  avif/webp/jpg + ${widths.join("/")} variants`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});