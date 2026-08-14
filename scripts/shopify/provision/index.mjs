#!/usr/bin/env node

import { resolve } from "node:path";

import { createAdminClient } from "./admin-client.mjs";
import { runProvisioningCommand } from "./command.mjs";
import { loadLocalEnv } from "./env.mjs";
import { applyProvisionPlan } from "./executor.mjs";
import { SHOPIFY_PROVISIONING_MANIFEST } from "./manifest.mjs";
import { loadCurrentResources } from "./state.mjs";

const repoRoot = resolve(import.meta.dirname, "../../../");
const command = process.argv[2] ?? "plan";

try {
  const env = await loadLocalEnv(repoRoot);
  const client = createAdminClient({ env, readOnly: command !== "apply" });
  const result = await runProvisioningCommand({
    command,
    manifest: SHOPIFY_PROVISIONING_MANIFEST,
    loadCurrentResources: ({ manifest }) => loadCurrentResources({ client, manifest }),
    applyProvisionPlan: ({ manifest, plan, write }) => applyProvisionPlan({
      client,
      manifest,
      plan,
      repoRoot,
      write,
    }),
  });
  process.exitCode = result.exitCode;
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
