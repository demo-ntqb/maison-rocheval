import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PREFERENCE_KEY } from "@/shared/lib/region-preference";
import { COMMERCE_CONTEXTS } from "@/shared/constants/commerce-context.constant";

const replace = vi.fn();
const mockPathname = "/products";
let activeLocale = "en-sg";

vi.mock("next-intl", () => ({
  useLocale: () => activeLocale,
}));

vi.mock("@/i18n/routing", () => ({
  routing: {
    locales: ["en-fr", "fr-fr", "en-us", "fr-us", "en-sg", "fr-sg"],
    defaultLocale: "en-sg",
  },
}));

vi.mock("@/i18n/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ replace }),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next/dynamic", () => ({
  default: () => function MockDialog() {
    return <div>region dialog</div>;
  },
}));

import { RegionPreferenceGate } from "./region-preference-gate";

const preference = JSON.stringify({ routeLocale: "fr-sg" });
const availableContexts = Object.values(COMMERCE_CONTEXTS);

function seedStorage({
  preference = "",
  dismissed = "",
  redirected = "",
}: {
  preference?: string;
  dismissed?: string;
  redirected?: string;
} = {}) {
  window.localStorage.setItem(PREFERENCE_KEY, preference);
  window.sessionStorage.setItem("mr:region-preference-dismissed", dismissed);
  window.sessionStorage.setItem("mr:region-redirected", redirected);
}

describe("RegionPreferenceGate", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    replace.mockReset();
    activeLocale = "en-sg";
  });

  it("redirect về routeLocale đã lưu một lần khi bắt đầu phiên", async () => {
    seedStorage({ preference });
    render(<RegionPreferenceGate availableContexts={availableContexts} />);

    await waitFor(() => expect(replace).toHaveBeenCalledTimes(1));
    expect(replace).toHaveBeenCalledWith(mockPathname, { locale: "fr-sg" });
  });

  it("không redirect lại lần thứ hai trong cùng phiên (không đánh bật điều hướng chủ đích)", async () => {
    seedStorage({ preference, redirected: "1" });
    render(<RegionPreferenceGate availableContexts={availableContexts} />);

    expect(replace).not.toHaveBeenCalled();
  });

  it("không redirect khi routeLocale hiện tại khớp preference đã lưu", async () => {
    activeLocale = "fr-sg";
    seedStorage({ preference });
    render(<RegionPreferenceGate availableContexts={availableContexts} />);

    expect(replace).not.toHaveBeenCalled();
  });

  it("hiện dialog khi chưa có lựa chọn và chưa đóng popup", () => {
    render(<RegionPreferenceGate availableContexts={availableContexts} />);

    expect(screen.getByText("region dialog")).toBeInTheDocument();
  });
});
