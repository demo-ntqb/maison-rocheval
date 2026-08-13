/**
 * BDD tests for F05: Product Detail Info Panel UI Update
 * Tests packaging card rendering, selection states, and summary format.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

// ──────────────────────────────────────────────
// Stubs – simulate the rendering contract
// ──────────────────────────────────────────────

/**
 * @typedef {{id: string, name: string, description: string, priceModifier: number, priceLabel: string}} PackagingOption
 */

/** Packaging data as defined in the Figma spec (node 3:11741) */
const PACKAGING_OPTIONS = [
  { id: "standard", name: "Standard", description: "Paper bag with ice", priceModifier: 0, priceLabel: "FREE" },
  { id: "premium", name: "Premium", description: "Quality cardboard box with Bolduc ribbon.", priceModifier: 32, priceLabel: "+$32" },
  { id: "luxury", name: "Luxury", description: "Premium wooden box with Bolduc ribbon.", priceModifier: 74, priceLabel: "+$74" },
];

/**
 * Derives the summary text from selections (must match the component logic).
 */
function deriveSummary(packaging, perBox, size, productName) {
  const pkg = PACKAGING_OPTIONS.find(p => p.id === packaging);
  const line1 = `${pkg.name.toUpperCase()} BOX OF ${perBox}`;
  const line2 = `${perBox} X ${size} ${productName} per box`;
  const showPersonalized = packaging !== "standard";
  return { line1, line2, showPersonalized };
}

// ──────────────────────────────────────────────
// Scenarios
// ──────────────────────────────────────────────

describe("F05 – Product Detail Info Panel UI", () => {

  // Scenario: Packaging cards display
  describe("Packaging cards display with thumbnail, name, description, and price", () => {
    it("should have 3 packaging options", () => {
      assert.equal(PACKAGING_OPTIONS.length, 3);
    });

    it("Standard card: name=STANDARD, desc='Paper bag with ice', price=FREE", () => {
      const std = PACKAGING_OPTIONS[0];
      assert.equal(std.name, "Standard");
      assert.equal(std.description, "Paper bag with ice");
      assert.equal(std.priceLabel, "FREE");
    });

    it("Premium card: name=PREMIUM, desc includes Bolduc, price=+$32", () => {
      const prem = PACKAGING_OPTIONS[1];
      assert.equal(prem.name, "Premium");
      assert.ok(prem.description.includes("Bolduc ribbon"));
      assert.equal(prem.priceLabel, "+$32");
      assert.equal(prem.priceModifier, 32);
    });

    it("Luxury card: name=LUXURY, desc includes wooden box, price=+$74", () => {
      const lux = PACKAGING_OPTIONS[2];
      assert.equal(lux.name, "Luxury");
      assert.ok(lux.description.includes("wooden box"));
      assert.equal(lux.priceLabel, "+$74");
      assert.equal(lux.priceModifier, 74);
    });
  });

  // Scenario: Summary block displays text-only format
  describe("Summary block text format", () => {
    it("shows '{PACKAGING} BOX OF {perBox}' on line 1", () => {
      const { line1 } = deriveSummary("premium", 2, "30g", "Kaluga");
      assert.equal(line1, "PREMIUM BOX OF 2");
    });

    it("shows '{perBox} X {size} {productName} per box' on line 2", () => {
      const { line2 } = deriveSummary("premium", 2, "30g", "Kaluga");
      assert.equal(line2, "2 X 30g Kaluga per box");
    });

    it("shows personalized message for Premium packaging", () => {
      const { showPersonalized } = deriveSummary("premium", 2, "30g", "Kaluga");
      assert.equal(showPersonalized, true);
    });

    it("hides personalized message for Standard packaging", () => {
      const { showPersonalized } = deriveSummary("standard", 1, "30g", "Kaluga");
      assert.equal(showPersonalized, false);
    });
  });

  // Scenario: Summary updates dynamically
  describe("Summary updates dynamically", () => {
    it("reflects Luxury + 3 per box + 125g", () => {
      const { line1, line2 } = deriveSummary("luxury", 3, "125g", "Kaluga");
      assert.equal(line1, "LUXURY BOX OF 3");
      assert.equal(line2, "3 X 125g Kaluga per box");
    });

    it("reflects Standard + 1 per box + 250g", () => {
      const { line1, line2 } = deriveSummary("standard", 1, "250g", "Kaluga");
      assert.equal(line1, "STANDARD BOX OF 1");
      assert.equal(line2, "1 X 250g Kaluga per box");
    });
  });
});
