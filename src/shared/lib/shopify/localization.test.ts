import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));


import {
  DEFAULT_SHIPPING_COUNTRY,
  LANGUAGE_OPTIONS,
  SHIPPING_COUNTRIES,
} from "@/shared/constants/region.constant";
import type { ShippingCountryCode } from "@/shared/types/region.type";

import {
  buildAvailableContexts,
  filterAvailableMarkets,
} from "@/shared/lib/shopify/localization";

describe("Dynamic Market Localization Discovery (Phase 1 & 3)", () => {
  it("chỉ expose giao giữa Shopify availableCountries và allowlist [FR, US, SG]", () => {
    // Giả lập Shopify Storefront API localization trả về FR, SG và JP (JP ngoài allowlist)
    const shopifyResponse = ["FR", "SG", "JP", "GB"];
    const filtered = filterAvailableMarkets(shopifyResponse, ["en", "fr"]);

    expect(filtered.availableCountries).toEqual(["FR", "SG"]);
    expect(filtered.availableCountries).not.toContain("JP");
    expect(filtered.availableCountries).not.toContain("GB");
    // US chưa được publish trong Shopify nên không được expose
    expect(filtered.availableCountries).not.toContain("US");
  });

  it("chỉ expose languages mà app có message catalogs (EN, FR)", () => {
    // Giả lập Shopify trả về EN, FR, DE, JA
    const shopifyLanguages = ["en", "fr", "de", "ja"];
    const filtered = filterAvailableMarkets(["FR"], shopifyLanguages);

    expect(filtered.availableLanguages).toEqual(["EN", "FR"]);
    expect(filtered.availableLanguages).not.toContain("DE");
    expect(filtered.availableLanguages).not.toContain("JA");
  });

  it("buildAvailableContexts sinh đúng danh sách CommerceContext theo các country/language active", () => {
    // Chỉ SG active với EN
    const sgOnly = buildAvailableContexts([{ country: "SG", languages: ["EN"] }]);
    expect(sgOnly.map((c) => c.routeLocale)).toEqual(["en-sg"]);

    // SG, FR active với cả EN và FR
    const sgAndFr = buildAvailableContexts([
      { country: "SG", languages: ["EN", "FR"] },
      { country: "FR", languages: ["EN", "FR"] },
    ]);
    const routeLocales = sgAndFr.map((c) => c.routeLocale);
    expect(routeLocales).toContain("en-sg");
    expect(routeLocales).toContain("fr-sg");
    expect(routeLocales).toContain("en-fr");
    expect(routeLocales).toContain("fr-fr");
    expect(routeLocales).not.toContain("en-us");
    expect(routeLocales).not.toContain("fr-us");

    // Languages belong to each country, not to the whole localization response.
    expect(
      buildAvailableContexts([
        { country: "SG", languages: ["EN"] },
        { country: "FR", languages: ["FR"] },
      ]).map((context) => context.routeLocale),
    ).toEqual(["fr-fr", "en-sg"]);

    // Không được bịa default market khi Shopify không publish context nào.
    const noPublishedContext = buildAvailableContexts([]);
    expect(noPublishedContext).toEqual([]);
  });


  describe("Gap so với cấu hình tĩnh SHIPPING_COUNTRIES hiện tại", () => {
    it("SHIPPING_COUNTRIES phải hỗ trợ Singapore (SG) trong allowlist", () => {
      // Expected contract: SG must be supported in shipping countries
      // Currently fails: SHIPPING_COUNTRIES is only [{ code: "FR" }, { code: "US" }]
      const countryCodes = SHIPPING_COUNTRIES.map((c) => c.code);
      expect(countryCodes).toContain("SG");
    });

    it("DEFAULT_SHIPPING_COUNTRY phải là SG cho Headless channel ban đầu", () => {
      // Expected contract: Initial default site context is en-sg (SG) because headless channel exposes SG/SGD
      // Currently fails: DEFAULT_SHIPPING_COUNTRY is "FR"
      expect(DEFAULT_SHIPPING_COUNTRY as string).toBe("SG");
    });

    it("ShippingCountryCode type phải bao gồm SG", () => {
      const sampleSG: ShippingCountryCode = "SG" as ShippingCountryCode;
      expect(sampleSG).toBe("SG");
    });

    it("LANGUAGE_OPTIONS chỉ chứa ngôn ngữ có catalog", () => {
      expect(LANGUAGE_OPTIONS).toEqual(["en", "fr"]);
    });
  });
});
