import { describe, expect, it } from "vitest";

import { routing } from "@/i18n/routing";
import {
  getCommerceContextOrDefault,
  isRouteLocale,
  parseCommerceContext,
} from "./commerce-context";
import { getShopifyMarket } from "@/shared/lib/shopify/config";

describe("Commerce Context & Route Contract (Phase 1 & 2)", () => {
  const EXPECTED_ROUTE_LOCALES = [
    "en-fr",
    "fr-fr",
    "en-us",
    "fr-us",
    "en-sg",
    "fr-sg",
  ] as const;

  it("routing.locales phải hỗ trợ đầy đủ 6 BCP-47 route combinations", () => {
    for (const locale of EXPECTED_ROUTE_LOCALES) {
      expect(routing.locales).toContain(locale);
    }
  });

  describe("Shopify market resolution cho 6 commerce context combinations", () => {
    it("giải quyết đúng context cho France (en-fr và fr-fr)", () => {
      const enFr = getShopifyMarket("en-fr");
      expect(enFr).toEqual({ country: "FR", language: "EN" });

      const frFr = getShopifyMarket("fr-fr");
      expect(frFr).toEqual({ country: "FR", language: "FR" });
    });

    it("giải quyết đúng context cho United States (en-us và fr-us)", () => {
      const enUs = getShopifyMarket("en-us");
      expect(enUs).toEqual({ country: "US", language: "EN" });

      const frUs = getShopifyMarket("fr-us");
      expect(frUs).toEqual({ country: "US", language: "FR" });
    });

    it("giải quyết đúng context cho Singapore (en-sg và fr-sg)", () => {
      const enSg = getShopifyMarket("en-sg");
      expect(enSg).toEqual({ country: "SG", language: "EN" });

      const frSg = getShopifyMarket("fr-sg");
      expect(frSg).toEqual({ country: "SG", language: "FR" });
    });
  });

  describe("Validation và rejection cho country/language ngoài allowlist", () => {
    it("từ chối các route ngoài allowlist các nước FR, US, SG", () => {
      const invalidCountryRoutes = ["en-gb", "de-de", "es-es", "ja-jp", "fr-ca"];

      for (const route of invalidCountryRoutes) {
        expect((routing.locales as readonly string[]).includes(route)).toBe(false);
        expect(isRouteLocale(route)).toBe(false);
      }
    });

    it("từ chối các locale cũ đơn lẻ như 'en' và 'fr' vì không phải BCP-47 routeLocale", () => {
      expect(isRouteLocale("en")).toBe(false);
      expect(isRouteLocale("fr")).toBe(false);
      expect(() => parseCommerceContext("en")).toThrow(/Invalid or unsupported/);
      expect(() => parseCommerceContext("fr")).toThrow(/Invalid or unsupported/);
    });
  });

  describe("parseCommerceContext & getCommerceContextOrDefault", () => {
    it("parse đúng commerce context cho từng routeLocale", () => {
      expect(parseCommerceContext("en-us")).toEqual({
        routeLocale: "en-us",
        appLocale: "en",
        country: "US",
        language: "EN",
      });

      expect(parseCommerceContext("fr-fr")).toEqual({
        routeLocale: "fr-fr",
        appLocale: "fr",
        country: "FR",
        language: "FR",
      });

      expect(parseCommerceContext("en-sg")).toEqual({
        routeLocale: "en-sg",
        appLocale: "en",
        country: "SG",
        language: "EN",
      });

      expect(parseCommerceContext("fr-sg")).toEqual({
        routeLocale: "fr-sg",
        appLocale: "fr",
        country: "SG",
        language: "FR",
      });

      expect(parseCommerceContext("en-fr")).toEqual({
        routeLocale: "en-fr",
        appLocale: "en",
        country: "FR",
        language: "EN",
      });

      expect(parseCommerceContext("fr-us")).toEqual({
        routeLocale: "fr-us",
        appLocale: "fr",
        country: "US",
        language: "FR",
      });
    });

    it("fallback an toàn về default context en-sg khi input rỗng hoặc invalid", () => {
      expect(getCommerceContextOrDefault(null)).toEqual({
        routeLocale: "en-sg",
        appLocale: "en",
        country: "SG",
        language: "EN",
      });

      expect(getCommerceContextOrDefault("invalid-route")).toEqual({
        routeLocale: "en-sg",
        appLocale: "en",
        country: "SG",
        language: "EN",
      });

      expect(getCommerceContextOrDefault("fr")).toEqual({
        routeLocale: "en-sg",
        appLocale: "en",
        country: "SG",
        language: "EN",
      });
    });
  });
});
