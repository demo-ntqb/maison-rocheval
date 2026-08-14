import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

function parseEnv(text) {
  const values = {};
  for (const rawLine of text.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

export async function loadLocalEnv(repoRoot, env = process.env) {
  for (const filename of [".env", ".env.local"]) {
    try {
      const values = parseEnv(await readFile(resolve(repoRoot, filename), "utf8"));
      for (const [key, value] of Object.entries(values)) {
        if (env[key] === undefined) env[key] = value;
      }
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  return env;
}
