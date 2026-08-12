import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workflowUrl = new URL("../../.github/workflows/ci-cd.yml", import.meta.url);

async function workflowSource() {
  try {
    return await readFile(workflowUrl, "utf8");
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return "";
    }
    throw error;
  }
}

test("workflow chạy quality gate trên pull request và main", async () => {
  const workflow = await workflowSource();

  assert.match(workflow, /pull_request:\s*\n\s+branches:\s*\[main\]/);
  assert.match(workflow, /push:\s*\n\s+branches:\s*\[main\]/);
  assert.match(workflow, /quality:\s*\n/);
  assert.match(workflow, /yarn install --frozen-lockfile/);
  assert.match(workflow, /run: yarn lint/);
  assert.match(workflow, /run: yarn typecheck/);
  assert.match(workflow, /run: yarn build/);
});

test("Preview chỉ deploy pull request nội bộ sau quality gate", async () => {
  const workflow = await workflowSource();

  assert.match(workflow, /deploy_preview:\s*\n/);
  assert.match(workflow, /needs: quality/);
  assert.match(workflow, /github\.event_name == 'pull_request'/);
  assert.match(workflow, /github\.event\.pull_request\.head\.repo\.full_name == github\.repository/);
  assert.match(workflow, /pull --yes --environment=preview/);
  assert.match(workflow, /build --token="\$VERCEL_TOKEN"/);
  assert.match(workflow, /deploy --prebuilt --token="\$VERCEL_TOKEN"/);
  assert.doesNotMatch(workflow, /pull_request_target/);
});

test("push main deploy Production prebuilt artifact", async () => {
  const workflow = await workflowSource();

  assert.match(workflow, /deploy_production:\s*\n/);
  assert.match(workflow, /github\.event_name == 'push'/);
  assert.match(workflow, /github\.ref == 'refs\/heads\/main'/);
  assert.match(workflow, /pull --yes --environment=production/);
  assert.match(workflow, /build --prod --token="\$VERCEL_TOKEN"/);
  assert.match(workflow, /deploy --prebuilt --prod --token="\$VERCEL_TOKEN"/);
});

test("workflow pin CLI, giới hạn quyền và chỉ đọc Vercel credentials từ secrets", async () => {
  const workflow = await workflowSource();

  assert.match(workflow, /permissions:\s*\n\s+contents: read/);
  assert.match(workflow, /VERCEL_CLI_VERSION: "58\.9\.4"/);
  assert.match(workflow, /VERCEL_TOKEN: \$\{\{ secrets\.VERCEL_TOKEN \}\}/);
  assert.match(workflow, /VERCEL_ORG_ID: \$\{\{ secrets\.VERCEL_ORG_ID \}\}/);
  assert.match(workflow, /VERCEL_PROJECT_ID: \$\{\{ secrets\.VERCEL_PROJECT_ID \}\}/);
  assert.match(workflow, /\$GITHUB_STEP_SUMMARY/);
  assert.match(workflow, /cancel-in-progress: true/);
});

