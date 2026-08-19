import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PREFERENCE_KEY } from "@/shared/lib/region-preference";

const replace = vi.fn();
const mockPathname = "/en";
let activeLocale = "fr";

vi.mock("next-intl", () => ({
  useLocale: () => activeLocale,
}));

vi.mock("@/i18n/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ replace }),
}));

vi.mock("next/dynamic", () => ({
  default: () => function MockDialog() {
    return <div>region dialog</div>;
  },
}));

import { RegionPreferenceGate } from "./region-preference-gate";

const preference = JSON.stringify({ countryCode: "FR", locale: "fr" });

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
    activeLocale = "en";
  });

  it("redirect về locale đã lưu một lần khi bắt đầu phiên", async () => {
    seedStorage({ preference });
    render(<RegionPreferenceGate />);

    await waitFor(() => expect(replace).toHaveBeenCalledTimes(1));
    expect(replace).toHaveBeenCalledWith(mockPathname, { locale: "fr" });
  });

  it("không redirect lại lần thứ hai trong cùng phiên (không đánh bật điều hướng chủ đích)", async () => {
    seedStorage({ preference, redirected: "1" });
    render(<RegionPreferenceGate />);

    expect(replace).not.toHaveBeenCalled();
  });

  it("không redirect khi locale hiện tại khớp preference đã lưu", async () => {
    activeLocale = "fr";
    seedStorage({ preference });
    render(<RegionPreferenceGate />);

    expect(replace).not.toHaveBeenCalled();
  });

  it("hiện dialog khi chưa có lựa chọn và chưa đóng popup", () => {
    render(<RegionPreferenceGate />);

    expect(screen.getByText("region dialog")).toBeInTheDocument();
  });
});