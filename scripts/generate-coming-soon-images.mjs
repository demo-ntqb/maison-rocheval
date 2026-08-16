#!/usr/bin/env node
/**
 * Generates the pre-optimized <picture> assets for the Coming Soon screen.
 *
 * The project deliberately does not use next/image (see AGENTS.md), so hero
 * assets are cropped and encoded ahead of time and served as static files.
 *
 * Sources: assets/coming-soon/desktop.webp (3000x2100) and mobile.webp
 * (1200x1800) — two independently-framed exports of the same photo, one per
 * breakpoint (desktop shows the wide valley, mobile a narrower slice of the
 * lake), matching the desktop (1400x800, node 430:73517) and mobile
 * (428x800, node 430:73555) frames in Figma file bAM5IqQi7EzgsBHqmFwsfb.
 * Neither source is already at the frame's exact aspect ratio, so each is
 * still center-cropped to it below before encoding. They live outside
 * public/ on purpose: they're 2.2 MB combined and are build inputs, not
 * something to serve to browsers.
 *
 * Output is encoded at 2x the CSS frame size (2800x1600 / 856x1600) for
 * sharpness on high-DPI screens, which both sources comfortably cover
 * without upscaling.
 *
 * Usage:
 *   node scripts/generate-coming-soon-images.mjs
 */

import { mkdir } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const OUT_DIR = path.join(process.cwd(), "public/images/coming-soon");
const SRC_DIR = path.join(process.cwd(), "assets/coming-soon");

const VARIANTS = [
  {
    name: "coming-soon-hero-desktop",
    source: path.join(SRC_DIR, "desktop.webp"),
    // Frame aspect 1400/800 = 1.75, narrower than the 3000x2100 (1.4286) source,
    // so height is cropped down (width-limited) around a centered crop.
    frameAspect: 1400 / 800,
    out: { width: 2800, height: 1600 },
  },
  {
    name: "coming-soon-hero-mobile",
    source: path.join(SRC_DIR, "mobile.webp"),
    // Frame aspect 428/800 = 0.535, narrower than the 1200x1800 (0.6667) source,
    // so width is cropped down (height-limited) around a centered crop.
    frameAspect: 428 / 800,
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

function centeredCrop(sourceWidth, sourceHeight, targetAspect) {
  const sourceAspect = sourceWidth / sourceHeight;

  if (sourceAspect > targetAspect) {
    const width = Math.round(sourceHeight * targetAspect);
    return { left: Math.round((sourceWidth - width) / 2), top: 0, width, height: sourceHeight };
  }

  const height = Math.round(sourceWidth / targetAspect);
  return { left: 0, top: Math.round((sourceHeight - height) / 2), width: sourceWidth, height };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  for (const variant of VARIANTS) {
    const { width, height } = await sharp(variant.source).metadata();
    const crop = centeredCrop(width, height, variant.frameAspect);

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
