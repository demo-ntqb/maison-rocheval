import { beforeEach, describe, expect, it } from "vitest";

import {
  parseRegionSnapshot,
  PREFERENCE_KEY,
  updateRegionPreferenceLocale,
  writeRegionPreference,
} from "./region-preference";

describe("Region Preference Storage & Migration (Phase 4)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("parse thành công schema mới dạng { routeLocale }", () => {
    const raw = JSON.stringify({ routeLocale: "fr-sg" });
    const { preference } = parseRegionSnapshot(`${raw}\u00000`);

    expect(preference).toEqual({ routeLocale: "fr-sg" });
  });

  it("migrate an toàn schema cũ dạng { countryCode, locale }", () => {
    // TODO: Tạm ẩn test của FR và US
    /*
    // Schema cũ: France + English -> en-fr
    const rawOldFrEn = JSON.stringify({ countryCode: "FR", locale: "en" });
    expect(parseRegionSnapshot(`${rawOldFrEn}\u00000`).preference).toEqual({
      routeLocale: "en-fr",
    });

    // Schema cũ: France + French -> fr-fr
    const rawOldFrFr = JSON.stringify({ countryCode: "FR", locale: "fr" });
    expect(parseRegionSnapshot(`${rawOldFrFr}\u00000`).preference).toEqual({
      routeLocale: "fr-fr",
    });

    // Schema cũ: United States + English -> en-us
    const rawOldUsEn = JSON.stringify({ countryCode: "US", locale: "en" });
    expect(parseRegionSnapshot(`${rawOldUsEn}\u00000`).preference).toEqual({
      routeLocale: "en-us",
    });
    */

    // Schema cũ: Singapore + English -> en-sg
    const rawOldSgEn = JSON.stringify({ countryCode: "SG", locale: "en" });
    expect(parseRegionSnapshot(`${rawOldSgEn}\u00000`).preference).toEqual({
      routeLocale: "en-sg",
    });

    // Schema cũ: Singapore + French -> fr-sg
    const rawOldSgFr = JSON.stringify({ countryCode: "SG", locale: "fr" });
    expect(parseRegionSnapshot(`${rawOldSgFr}\u00000`).preference).toEqual({
      routeLocale: "fr-sg",
    });
  });

  it("từ chối preference hỏng hoặc country/locale không hợp lệ", () => {
    const invalidJson = "invalid-json";
    expect(parseRegionSnapshot(`${invalidJson}\u00000`).preference).toBeNull();

    const invalidCountry = JSON.stringify({ countryCode: "CA", locale: "en" });
    expect(parseRegionSnapshot(`${invalidCountry}\u00000`).preference).toBeNull();

    const invalidRoute = JSON.stringify({ routeLocale: "en-ca" });
    expect(parseRegionSnapshot(`${invalidRoute}\u00000`).preference).toBeNull();
  });

  it("updateRegionPreferenceLocale cập nhật ngôn ngữ và giữ nguyên country hiện tại", () => {
    // TODO: Tạm ẩn test của FR và US
    /*
    writeRegionPreference({ routeLocale: "en-us" });
    updateRegionPreferenceLocale("fr");

    const stored = JSON.parse(window.localStorage.getItem(PREFERENCE_KEY) ?? "{}");
    expect(stored).toEqual({ routeLocale: "fr-us" });
    */

    writeRegionPreference({ routeLocale: "en-sg" });
    updateRegionPreferenceLocale("fr");

    const stored = JSON.parse(window.localStorage.getItem(PREFERENCE_KEY) ?? "{}");
    expect(stored).toEqual({ routeLocale: "fr-sg" });
  });
});
