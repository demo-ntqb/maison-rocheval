import { buildProvisionPlan } from "./planner.mjs";

const SUPPORTED_COMMANDS = new Set(["plan", "apply", "verify"]);

function printPlan(plan, write) {
  if (plan.length === 0) {
    write("Shopify provisioning: desired state is converged (0 changes).\n");
    return;
  }

  write(`Shopify provisioning: ${plan.length} change(s).\n`);
  for (const action of plan) {
    write(`${action.operation.padEnd(6)} ${action.phase.padEnd(15)} ${action.key}\n`);
  }
}

export async function runProvisioningCommand({
  command,
  manifest,
  loadCurrentResources,
  applyProvisionPlan,
  write = (line) => process.stdout.write(line),
}) {
  if (!SUPPORTED_COMMANDS.has(command)) {
    throw new Error(
      `Unsupported provisioning command: ${String(command)}. Use plan, apply, or verify.`,
    );
  }

  const currentResources = await loadCurrentResources({ manifest });
  const actions = buildProvisionPlan(manifest, currentResources);
  printPlan(actions, write);

  if (command === "plan") return { command, actions, exitCode: 0 };
  if (command === "verify") {
    return { command, actions, exitCode: actions.length === 0 ? 0 : 1 };
  }

  if (actions.length > 0) {
    await applyProvisionPlan({ manifest, plan: actions, write });
  }
  const finalResources = await loadCurrentResources({ manifest });
  const remainingActions = buildProvisionPlan(manifest, finalResources);
  if (remainingActions.length > 0) {
    throw new Error(
      `Shopify provisioning apply did not converge: ${remainingActions.length} change(s) remain.`,
    );
  }
  write("Shopify provisioning apply converged successfully.\n");
  return { command, actions, remainingActions, exitCode: 0 };
}
