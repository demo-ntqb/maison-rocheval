#!/usr/bin/env node
/**
 * Generates the pre-optimized <picture> assets for the "Our Collection"
 * (about-the-product) screen.
 *
 * The project deliberately does not use next/image (see AGENTS.md), so every
 * asset is cropped and encoded ahead of time and served as a static file.
 *
 * Sources live in assets/collection/ and are the raw image fills exported
 * from Figma file nF4lv9QLYzPqrPGBMfkWjz (desktop frame 409:18437, mobile
 * frame 410:22758). The crops below reproduce the image transforms Figma
 * applies inside each frame, converted from the percentage offsets reported
 * by the design context into source pixels.
 *
 * Usage:
 *   node scripts/pre-optimization-images/generate-collection-images.mjs
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const SOURCE_DIR = path.join(ROOT, "assets", "collection");
const OUTPUT_DIR = path.join(ROOT, "public", "images", "about-product", "collection");

const PRODUCTS = ["amour", "expression", "harmonie", "oscietra", "kaluga"];

/**
 * Photographic assets: opaque, so JPEG is the widest-support fallback.
 * `crop` is {left, top, width, height} in source pixels; `resize` caps the
 * encoded width so nothing ships larger than 2x its CSS box.
 */
const PHOTOS = [
  // Hero, desktop frame 1400x800 (Figma: w 104.67%, left -4.71%, h 128.21%, top -15.05%).
  { source: "hero.png", output: "hero-desktop", crop: { left: 66, top: 120, width: 1397, height: 799 } },
  // Hero, mobile frame 428x800 (Figma: w 339.03%, left -129.09%, h 126.95%, top -14.77%).
  { source: "hero.png", output: "hero-mobile", crop: { left: 557, top: 119, width: 431, height: 805 } },
  // Sturgeon pond, desktop 1000x700 (Figma: w 125.63%, left -8.2%, h 115.92%).
  { source: "sturgeon-pond.png", output: "sturgeon-desktop", crop: { left: 100, top: 0, width: 1222, height: 855 } },
  // Sturgeon pond, mobile 396x600 — centred crop at the same aspect ratio.
  { source: "sturgeon-pond.png", output: "sturgeon-mobile", crop: { left: 430, top: 0, width: 676, height: 1024 } },
  // Plated dishes, rendered in a square box on both breakpoints.
  { source: "dish-amour.png", output: "dish-amour", crop: { left: 0, top: 146, width: 842, height: 842 } },
  { source: "dish-expression.png", output: "dish-expression", crop: { left: 0, top: 178, width: 1024, height: 1024 } },
  { source: "dish-house.png", output: "dish-house", crop: { left: 0, top: 128, width: 736, height: 736 } },
];

/**
 * The Open Graph / Twitter card image for the collection page: a single,
 * un-responsive 1200x630 JPEG (the standard OG size), cropped from the same
 * source as the hero so the two stay recognisably the same photograph. Cropped
 * to the OG aspect (1.905) rather than reusing the hero's own crop (1.748) —
 * feeding a mismatched-aspect source into a fixed 1200x630 slot lets Facebook
 * and Twitter's own crawler crop it unpredictably instead of us. Centred on
 * the hero crop's own vertical centre so the framing still matches.
 */
const OG_IMAGE = {
  source: "hero.png",
  output: "og-hero",
  crop: { left: 0, top: 136, width: 1463, height: 768 },
  resize: 1200,
};

/**
 * Cut-out tins: they carry an alpha channel and sit on the beige/white card
 * backgrounds, so PNG is the fallback and every format keeps transparency.
 */
const CUTOUTS = [
  // Open tin above the "Understanding our collection" heading, 148x90 box
  // (Figma: w 141.18%, left -7.08%, h 154.45%, top -29.56%). Encoded at 2x.
  { source: "tin-open-hero.png", output: "tin-hero", crop: { left: 77, top: 196, width: 1088, height: 662 }, resize: 296 },
  // Closed tins: 80x82 in a carousel card, 275x280 in the detail panel.
  ...PRODUCTS.map((product) => ({ source: `tin-closed-${product}.png`, output: `tin-closed-${product}`, resize: 556 })),
  // Open tins: 79x79 on a hovered card, 270x272 in the detail panel.
  ...PRODUCTS.map((product) => ({ source: `tin-open-${product}.png`, output: `tin-open-${product}`, resize: 560 })),
];

async function encode(spec, { fallback }) {
  const pipeline = sharp(path.join(SOURCE_DIR, spec.source));
  if (spec.crop) pipeline.extract(spec.crop);
  if (spec.resize) pipeline.resize({ width: spec.resize, withoutEnlargement: true });

  const base = path.join(OUTPUT_DIR, spec.output);
  const buffer = await pipeline.toBuffer();
  const { width, height } = await sharp(buffer).metadata();

  await Promise.all([
    sharp(buffer).avif({ quality: fallback === "png" ? 60 : 55, effort: 6 }).toFile(`${base}.avif`),
    sharp(buffer).webp({ quality: fallback === "png" ? 88 : 78, effort: 6 }).toFile(`${base}.webp`),
    fallback === "png"
      ? sharp(buffer).png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(`${base}.png`)
      : sharp(buffer).jpeg({ quality: 82, mozjpeg: true }).toFile(`${base}.jpg`),
  ]);

  return { name: spec.output, width, height };
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  for (const spec of PHOTOS) {
    const { name, width, height } = await encode(spec, { fallback: "jpg" });
    console.log(`${name.padEnd(20)} ${width}x${height}  avif/webp/jpg`);
  }

  {
    const pipeline = sharp(path.join(SOURCE_DIR, OG_IMAGE.source))
      .extract(OG_IMAGE.crop)
      .resize({ width: OG_IMAGE.resize });
    const outPath = path.join(OUTPUT_DIR, `${OG_IMAGE.output}.jpg`);
    await pipeline.jpeg({ quality: 85, mozjpeg: true }).toFile(outPath);
    console.log(`${OG_IMAGE.output.padEnd(20)} 1200x630  jpg (og:image)`);
  }

  for (const spec of CUTOUTS) {
    const { name, width, height } = await encode(spec, { fallback: "png" });
    console.log(`${name.padEnd(20)} ${width}x${height}  avif/webp/png`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
