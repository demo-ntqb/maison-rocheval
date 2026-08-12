import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const constantsUrl = new URL("../../src/screens/products/constants/products.constant.ts", import.meta.url);

test("Products catalog định nghĩa đúng 5 handle và asset semantic", async () => {
  let source = "";

  try {
    source = await readFile(constantsUrl, "utf8");
  } catch (error) {
    if (!error || typeof error !== "object" || !("code" in error) || error.code !== "ENOENT") {
      throw error;
    }
  }

  const handles = [...source.matchAll(/handle:\s*"([^"]+)"/g)].map((match) => match[1]);
  const imagePaths = [...source.matchAll(/imageBasePath:\s*"([^"]+)"/g)].map((match) => match[1]);

  assert.equal(handles.length, 5);
  assert.equal(new Set(handles).size, 5);
  assert.equal(imagePaths.length, 5);
  assert.ok(imagePaths.every((path) => path.startsWith("/images/")));
  assert.match(source, /export const PRODUCTS/);
  assert.match(source, /satisfies readonly ProductsProduct\[\]/);
});
