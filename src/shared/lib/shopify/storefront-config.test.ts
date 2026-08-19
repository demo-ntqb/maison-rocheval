import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { resolveStorefrontConfig } from "./storefront-config";

const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

function setNodeEnv(value: string): void {
  Object.defineProperty(process.env, "NODE_ENV", {
    value,
    configurable: true,
    writable: true,
    enumerable: true,
  });
}

describe("resolveStorefrontConfig", () => {
  beforeEach(() => {
    delete process.env.PRIVATE_STOREFRONT_API_TOKEN;
    delete process.env.ALLOW_MOCK_CATALOG;
  });

  afterEach(() => {
    setNodeEnv(ORIGINAL_NODE_ENV ?? "test");
  });

  it("throw ở production khi thiếu token và không có cờ cho phép mock", () => {
    setNodeEnv("production");
    delete process.env.ALLOW_MOCK_CATALOG;

    expect(() => resolveStorefrontConfig()).toThrow(/PRIVATE_STOREFRONT_API_TOKEN/);
  });

  it("fallback về mock.shop ở production khi ALLOW_MOCK_CATALOG=true (CI)", () => {
    setNodeEnv("production");
    process.env.ALLOW_MOCK_CATALOG = "true";

    const config = resolveStorefrontConfig();
    expect(config.storeDomain).toBe("mock.shop");
    expect(config.privateStorefrontToken).toBe("mock-private-token");
  });

  it("fallback về mock.shop ở dev/test khi thiếu token (không throw)", () => {
    setNodeEnv("test");

    const config = resolveStorefrontConfig();
    expect(config.storeDomain).toBe("mock.shop");
  });

  it("throw khi có token nhưng thiếu store domain", () => {
    process.env.PRIVATE_STOREFRONT_API_TOKEN = "secret-token";

    expect(() => resolveStorefrontConfig()).toThrow(/NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN/);
  });
});