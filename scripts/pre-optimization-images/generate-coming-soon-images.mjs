#!/usr/bin/env node
/**
 * Generates the pre-optimized <picture> assets for the Coming Soon screen.
 *
 * The project deliberately does not use next/image (see AGENTS.md), so hero
 * assets are cropped and encoded ahead of time and served as static files.
 *
 * Sources: assets/coming-soon/desktop.png (4200x2400) and mobile.png
 * (2100x2400) — two independently-framed exports of the same photo, one per
 * breakpoint (desktop shows the wide valley, mobile a narrower slice of the
 * lake), matching the desktop (1400x800, node 430:73517) and mobile
 * (428x800, node 430:73555) frames in Figma file bAM5IqQi7EzgsBHqmFwsfb.
 * They live outside public/ on purpose: they're ~14 MB combined and are
 * build inputs, not something to serve to browsers.
 *
 * Output is encoded at 2x the CSS frame size (2800x1600 / 856x1600) for
 * sharpness on high-DPI screens, which both sources comfortably cover
 * without upscaling.
 *
 *   node scripts/pre-optimization-images/generate-coming-soon-images.mjs
 */

import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT_DIR = path.join(ROOT, "public/images/coming-soon");
const SRC_DIR = path.join(ROOT, "assets/coming-soon");

const VARIANTS = [
  {
    name: "hero-desktop",
    source: path.join(SRC_DIR, "desktop.png"),
    // Source is already exactly 1400/800 = 1.75 — no crop needed, only downscale.
    frameAspect: 1400 / 800,
    focalX: 0.5,
    out: { width: 2800, height: 1600 },
  },
  {
    name: "hero-mobile",
    source: path.join(SRC_DIR, "mobile.png"),
    // Frame aspect 428/800 = 0.535 vs source 2100/2400 = 0.875, so width is
    // cropped down (height-limited) by 816px total. The house sits close to
    // the left edge, so a centered crop (left=408) loses it entirely — biased
    // hard toward the left edge (left=60, focalX=60/816) keeps the house plus
    // two rearing pens in frame, verified visually against the alternatives.
    frameAspect: 428 / 800,
    focalX: 0.0735,
    out: { width: 856, height: 1600 },
  },
];

const ENCODERS = [
  { extension: "avif", apply: (pipeline) => pipeline.avif({ quality: 58, effort: 6 }) },
  { extension: "webp", apply: (pipeline) => pipeline.webp({ quality: 82, effort: 6 }) },
  {
    extension: "jpg",
    apply: (pipeline) => pipeline.jpeg({ quality: 82, mozjpeg: true, progressive: true }),
  },
];

function biasedCrop(sourceWidth, sourceHeight, targetAspect, focalX) {
  const sourceAspect = sourceWidth / sourceHeight;

  if (sourceAspect > targetAspect) {
    const width = Math.round(sourceHeight * targetAspect);
    const maxLeft = sourceWidth - width;
    return { left: Math.round(maxLeft * focalX), top: 0, width, height: sourceHeight };
  }

  const height = Math.round(sourceWidth / targetAspect);
  const maxTop = sourceHeight - height;
  return { left: 0, top: Math.round(maxTop * focalX), width: sourceWidth, height };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  for (const variant of VARIANTS) {
    const { width, height } = await sharp(variant.source).metadata();
    const crop = biasedCrop(width, height, variant.frameAspect, variant.focalX);

    for (const encoder of ENCODERS) {
      const file = path.join(OUT_DIR, `${variant.name}.${encoder.extension}`);
      const pipeline = sharp(variant.source)
        .extract(crop)
        .resize(variant.out.width, variant.out.height, { fit: "fill", kernel: "lanczos3" });

      const { size } = await encoder.apply(pipeline).toFile(file);
      console.log(
        `${path.relative(process.cwd(), file)}  ${variant.out.width}x${variant.out.height}  ${(size / 1024).toFixed(1)} KB`,
      );
    }
  }
}

await main();
