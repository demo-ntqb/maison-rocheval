import { afterEach, describe, expect, it, vi } from "vitest";

import { createAccessGateGrant, hasAccessGateGrant } from "./access-gate";

describe("access gate grant", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("does not expose the PIN in the cookie grant", () => {
    vi.stubEnv("ACCESS_GATE_PIN_US", "priority-2026");
    vi.stubEnv("ACCESS_GATE_SECRET", "server-secret");

    const grant = createAccessGateGrant();
    expect(grant).not.toBe("priority-2026");
    expect(hasAccessGateGrant(grant ?? undefined)).toBe(true);

    vi.stubEnv("ACCESS_GATE_SECRET", "rotated-secret");
    expect(hasAccessGateGrant(grant ?? undefined)).toBe(false);
  });
});
