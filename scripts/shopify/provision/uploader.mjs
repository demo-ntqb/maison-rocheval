import { readFile, stat } from "node:fs/promises";
import { basename, extname, resolve } from "node:path";

import { mutationPayload } from "./operations.mjs";

const MIME_TYPES = new Map([
  [".avif", "image/avif"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
]);

export function createLocalImageUploader({ client, repoRoot, fetchImpl = fetch }) {
  return async function uploadLocalImage(relativePath) {
    const absolutePath = resolve(repoRoot, relativePath);
    const normalizedRoot = `${resolve(repoRoot)}/`;
    if (!absolutePath.startsWith(normalizedRoot)) {
      throw new Error(`Image path must stay inside repository root: ${relativePath}`);
    }

    const extension = extname(absolutePath).toLowerCase();
    const mimeType = MIME_TYPES.get(extension);
    if (!mimeType) throw new Error(`Unsupported product image type: ${extension || "unknown"}`);
    const [{ size }, bytes] = await Promise.all([stat(absolutePath), readFile(absolutePath)]);
    const filename = basename(absolutePath);

    const data = await client.request(`#graphql
      mutation StageManagedImage($input: [StagedUploadInput!]!) {
        stagedUploadsCreate(input: $input) {
          stagedTargets { url resourceUrl parameters { name value } }
          userErrors { field message }
        }
      }
    `, {
      input: [{
        filename,
        mimeType,
        fileSize: String(size),
        httpMethod: "POST",
        resource: "IMAGE",
      }],
    });
    const payload = mutationPayload(data, "stagedUploadsCreate", filename);
    const target = payload.stagedTargets?.[0];
    if (!target?.url || !target.resourceUrl) {
      throw new Error(`Staged upload target is missing for ${filename}.`);
    }

    const form = new FormData();
    for (const parameter of target.parameters) form.append(parameter.name, parameter.value);
    form.append("file", new Blob([bytes], { type: mimeType }), filename);
    const response = await fetchImpl(target.url, { method: "POST", body: form });
    if (!response.ok) {
      throw new Error(`Staged upload failed for ${filename} with HTTP ${response.status}.`);
    }
    return target.resourceUrl;
  };
}
