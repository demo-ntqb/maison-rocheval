#!/usr/bin/env node
import { mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TMP_DESKTOP = path.join(ROOT, "tmp", "Rectangle 487.png");
const TMP_MOBILE = path.join(ROOT, "tmp", "Group 100000512.png");

const ASSETS_DIR = path.join(ROOT, "assets", "about-brand");
const OUTPUT_HOME_DIR = path.join(ROOT, "public", "images", "home");

async function encodeImage(sourcePath, outputBase, formats, width = null) {
  let pipeline = sharp(sourcePath);
  if (width) {
    pipeline = pipeline.resize({ width, withoutEnlargement: true });
  }

  const buffer = await pipeline.toBuffer();

  const promises = [];
  if (formats.includes("avif")) {
    promises.push(sharp(buffer).avif({ quality: 55, effort: 6 }).toFile(`${outputBase}.avif`));
  }
  if (formats.includes("webp")) {
    promises.push(sharp(buffer).webp({ quality: 78, effort: 6 }).toFile(`${outputBase}.webp`));
  }
  if (formats.includes("png")) {
    promises.push(sharp(buffer).png({ compressionLevel: 9, palette: true }).toFile(`${outputBase}.png`));
  }
  if (formats.includes("jpg")) {
    promises.push(sharp(buffer).jpeg({ quality: 82, mozjpeg: true }).toFile(`${outputBase}.jpg`));
  }

  await Promise.all(promises);
  console.log(`Generated formats for: ${outputBase} ${width ? `(width: ${width})` : "(original width)"}`);
}

async function main() {
  // 1. Ghi đè assets/about-brand/ritual-table-desktop.png và ritual-table-mobile.png
  console.log("1. Copying source images to assets/about-brand/...");
  await mkdir(ASSETS_DIR, { recursive: true });
  await copyFile(TMP_DESKTOP, path.join(ASSETS_DIR, "ritual-table-desktop.png"));
  await copyFile(TMP_MOBILE, path.join(ASSETS_DIR, "ritual-table-mobile.png"));

  // 2. Chạy script generate-about-brand-images.mjs để cập nhật ảnh about-brand
  console.log("2. Running generate-about-brand-images.mjs...");
  execSync("node scripts/generate-about-brand-images.mjs", { stdio: "inherit", cwd: ROOT });

  // 3. Xử lý các ảnh home
  console.log("3. Optimizing home screen assets...");
  await mkdir(OUTPUT_HOME_DIR, { recursive: true });

  // 3.1. source-ritual-table-desktop (jpg fallback)
  await encodeImage(
    TMP_DESKTOP,
    path.join(OUTPUT_HOME_DIR, "source-ritual-table-desktop"),
    ["avif", "webp", "jpg"]
  );

  // 3.2. source-ritual-table (png fallback)
  await encodeImage(
    TMP_DESKTOP,
    path.join(OUTPUT_HOME_DIR, "source-ritual-table"),
    ["avif", "webp", "png"]
  );

  // 3.3. source-ritual-table-640 (png fallback)
  await encodeImage(
    TMP_DESKTOP,
    path.join(OUTPUT_HOME_DIR, "source-ritual-table-640"),
    ["avif", "webp", "png"],
    640
  );

  // 3.4. source-ritual-table-1000 (png fallback)
  await encodeImage(
    TMP_DESKTOP,
    path.join(OUTPUT_HOME_DIR, "source-ritual-table-1000"),
    ["avif", "webp", "png"],
    1000
  );

  // 3.5. source-ritual-table-mobile (jpg fallback)
  await encodeImage(
    TMP_MOBILE,
    path.join(OUTPUT_HOME_DIR, "source-ritual-table-mobile"),
    ["avif", "webp", "jpg"]
  );

  console.log("All ritual-table assets optimized successfully!");
}

main().catch((error) => {
  console.error("Error optimizing assets:", error);
  process.exit(1);
});
