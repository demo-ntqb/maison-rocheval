import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildClientSchema, parse, validate } from "graphql";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SHOPIFY_LIB = path.join(PROJECT_ROOT, "src/shared/lib/shopify");
const GRAPHQL_DOCUMENT = /`#graphql\s*([\s\S]*?)`/g;

async function findSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return findSourceFiles(entryPath);
      return /\.[cm]?[jt]sx?$/.test(entry.name) ? [entryPath] : [];
    }),
  );

  return files.flat();
}

const schemaPath = fileURLToPath(import.meta.resolve("@shopify/hydrogen/storefront.schema.json"));
const introspection = JSON.parse(await readFile(schemaPath, "utf8"));
const schema = buildClientSchema(introspection);
const sourceFiles = await findSourceFiles(SHOPIFY_LIB);
const failures = [];
let documentCount = 0;

for (const sourceFile of sourceFiles) {
  const source = await readFile(sourceFile, "utf8");

  for (const match of source.matchAll(GRAPHQL_DOCUMENT)) {
    documentCount += 1;

    try {
      const errors = validate(schema, parse(match[1]));
      for (const error of errors) {
        failures.push(`${path.relative(PROJECT_ROOT, sourceFile)}: ${error.message}`);
      }
    } catch (error) {
      failures.push(
        `${path.relative(PROJECT_ROOT, sourceFile)}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

if (documentCount === 0) {
  failures.push("No `#graphql` Storefront operations were found.");
}

if (failures.length > 0) {
  console.error(["Shopify Storefront GraphQL validation failed:", ...failures].join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${documentCount} Shopify Storefront GraphQL operation(s).`);
}
