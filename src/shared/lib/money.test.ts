import { describe, expect, it } from "vitest";

import { formatBrandPrice } from "./money";

describe("Money Formatting — Disambiguation for SGD, USD, EUR (Phase 1 Regression)", () => {
  it("phân biệt rõ ràng giữa SGD và USD trong cùng locale (không cùng hiển thị dưới dạng '$' đơn độc)", () => {
    const sgdPrice = formatBrandPrice(100, "SGD", "en");
    const usdPrice = formatBrandPrice(100, "USD", "en");

    // Expected contract: SGD and USD must not format to identical string with ambiguous '$'
    // Currently fails: both formatBrandPrice(100, "SGD", "en") and formatBrandPrice(100, "USD", "en") return "100.00$"
    expect(sgdPrice).not.toBe(usdPrice);
  });

  it("hiển thị currency code hoặc prefix rõ ràng cho SGD (ví dụ 'SGD' hoặc 'S$')", () => {
    const sgdPrice = formatBrandPrice(250, "SGD", "en");

    // Expected contract: Currency code must appear when symbol is ambiguous with USD
    // Currently fails: returns "250.00$"
    expect(sgdPrice).toMatch(/SGD|S\$/);
  });

  it("định dạng đúng tiền EUR theo locale tiếng Pháp", () => {
    const eurPriceFr = formatBrandPrice(159, "EUR", "fr");

    // French format: trailing € with non-breaking / regular space and comma decimal
    expect(eurPriceFr).toMatch(/159[,.]00\s?€/);
  });

  it("định dạng đúng tiền USD theo locale tiếng Anh", () => {
    const usdPriceEn = formatBrandPrice(159, "USD", "en");

    expect(usdPriceEn).toMatch(/159\.00/);
  });
});
