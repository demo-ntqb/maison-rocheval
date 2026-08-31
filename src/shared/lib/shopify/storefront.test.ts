// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("./storefront-config", () => ({
  resolveStorefrontConfig: () => ({
    privateStorefrontToken: "shpat_test_private_token",
    storeDomain: "maison-rocheval.myshopify.com",
  }),
}));

const DUMMY_QUERY = `
  query TestCatalog($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: 1) {
      nodes {
        id
        title
      }
    }
  }
`;

describe("Shopify Storefront Client — Outgoing Variables at Fetch Boundary (Phase 1 Regression)", () => {
  const originalFetch = globalThis.fetch;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            data: {
              products: {
                nodes: [{ id: "gid://shopify/Product/1", title: "Test Product" }],
              },
            },
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      ),
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  function getOutgoingPayloadFromFetch(): { query?: string; variables?: Record<string, unknown> } | undefined {
    expect(fetchMock).toHaveBeenCalled();
    const lastCall = fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
    const requestOptions = lastCall[1] as RequestInit | undefined;
    if (!requestOptions?.body) return undefined;
    return JSON.parse(requestOptions.body as string);
  }

  it("gửi country=FR và language=FR ở fetch boundary cho fr-fr route", async () => {
    const { getCatalogStorefrontClient } = await import("./storefront");
    const client = getCatalogStorefrontClient("fr-fr");
    await client.query(DUMMY_QUERY);

    const payload = getOutgoingPayloadFromFetch();
    expect(payload).toBeDefined();
    // Expected contract: fr-fr -> country: "FR", language: "FR"
    expect(payload?.variables?.country).toBe("FR");
    expect(payload?.variables?.language).toBe("FR");
  });

  it("gửi country=US và language=EN ở fetch boundary cho en-us route", async () => {
    const { getCatalogStorefrontClient } = await import("./storefront");
    const client = getCatalogStorefrontClient("en-us");
    await client.query(DUMMY_QUERY);

    const payload = getOutgoingPayloadFromFetch();
    expect(payload).toBeDefined();
    // Expected contract: en-us -> country: "US", language: "EN"
    expect(payload?.variables?.country).toBe("US");
    expect(payload?.variables?.language).toBe("EN");
  });

  it("gửi country=SG và language=FR ở fetch boundary cho fr-sg route", async () => {
    const { getCatalogStorefrontClient } = await import("./storefront");
    const client = getCatalogStorefrontClient("fr-sg");
    await client.query(DUMMY_QUERY);

    const payload = getOutgoingPayloadFromFetch();
    expect(payload).toBeDefined();
    // Expected contract: fr-sg -> country: "SG", language: "FR"
    expect(payload?.variables?.country).toBe("SG");
    expect(payload?.variables?.language).toBe("FR");
  });

  it("gửi country=SG và language=EN ở fetch boundary cho en-sg route", async () => {
    const { getCatalogStorefrontClient } = await import("./storefront");
    const client = getCatalogStorefrontClient("en-sg");
    await client.query(DUMMY_QUERY);

    const payload = getOutgoingPayloadFromFetch();
    expect(payload).toBeDefined();
    // Expected contract: en-sg -> country: "SG", language: "EN"
    expect(payload?.variables?.country).toBe("SG");
    expect(payload?.variables?.language).toBe("EN");
  });
});
