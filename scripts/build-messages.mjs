import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = join(rootDir, "messages", "source");
const outputDir = join(rootDir, "messages");
const checkOnly = process.argv.includes("--check");

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function merge(target, source, path = "") {
  for (const [key, sourceValue] of Object.entries(source)) {
    const nextPath = path ? `${path}.${key}` : key;
    const targetValue = target[key];

    if (targetValue === undefined) {
      target[key] = sourceValue;
    } else if (isRecord(targetValue) && isRecord(sourceValue)) {
      merge(targetValue, sourceValue, nextPath);
    } else {
      throw new Error(`Translation key is defined more than once: ${nextPath}`);
    }
  }
}

function assertSameShape(reference, candidate, path = "") {
  if (Array.isArray(reference) || Array.isArray(candidate)) {
    if (!Array.isArray(reference) || !Array.isArray(candidate) || reference.length !== candidate.length) {
      throw new Error(`Translation shape differs at ${path || "root"}`);
    }

    reference.forEach((value, index) => assertSameShape(value, candidate[index], `${path}[${index}]`));
    return;
  }

  if (isRecord(reference) || isRecord(candidate)) {
    if (!isRecord(reference) || !isRecord(candidate)) {
      throw new Error(`Translation shape differs at ${path || "root"}`);
    }

    const referenceKeys = Object.keys(reference).sort();
    const candidateKeys = Object.keys(candidate).sort();
    if (referenceKeys.join("\0") !== candidateKeys.join("\0")) {
      throw new Error(`Translation keys differ at ${path || "root"}`);
    }

    referenceKeys.forEach((key) => {
      assertSameShape(reference[key], candidate[key], path ? `${path}.${key}` : key);
    });
    return;
  }

  if (typeof reference !== typeof candidate) {
    throw new Error(`Translation value type differs at ${path || "root"}`);
  }
}

async function loadLocale(locale) {
  const localeDir = join(sourceDir, locale);
  const files = (await readdir(localeDir, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort();

  if (files.length === 0) {
    throw new Error(`No translation fragments found for locale: ${locale}`);
  }

  const messages = {};
  for (const file of files) {
    const source = JSON.parse(await readFile(join(localeDir, file), "utf8"));
    if (!isRecord(source)) {
      throw new Error(`Translation fragment must contain an object: ${locale}/${file}`);
    }
    merge(messages, source);
  }

  return messages;
}

const locales = (await readdir(sourceDir, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

if (locales.length === 0) {
  throw new Error("No translation locales found.");
}

const catalogs = await Promise.all(locales.map(async (locale) => [locale, await loadLocale(locale)]));
const [, reference] = catalogs[0];

for (const [locale, messages] of catalogs.slice(1)) {
  assertSameShape(reference, messages, locale);
}

for (const [locale, messages] of catalogs) {
  const outputPath = join(outputDir, `${locale}.json`);
  const output = `${JSON.stringify(messages, null, 2)}\n`;

  if (checkOnly) {
    const current = await readFile(outputPath, "utf8");
    if (current !== output) {
      throw new Error(`Generated catalog is stale: messages/${locale}.json. Run yarn messages:build.`);
    }
  } else {
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, output);
  }
}
