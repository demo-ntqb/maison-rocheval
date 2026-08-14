import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { CarouselApi } from "@/shared/components/ui/carousel";
import { useProductDetailCarouselSelection } from "./product-detail-gallery.hook";

function carouselApi(selectedIndex: number): NonNullable<CarouselApi> {
  return {
    off: vi.fn(),
    on: vi.fn(),
    scrollTo: vi.fn(),
    selectedScrollSnap: vi.fn(() => selectedIndex),
  } as unknown as NonNullable<CarouselApi>;
}

describe("useProductDetailCarouselSelection", () => {
  it("đồng bộ active index và cleanup đúng select listener", () => {
    const api = carouselApi(2);
    const { result, unmount } = renderHook(() => useProductDetailCarouselSelection(api));

    expect(result.current.activeIndex).toBe(2);
    expect(api.on).toHaveBeenCalledWith("select", expect.any(Function));
    const listener = vi.mocked(api.on).mock.calls[0]?.[1];

    unmount();

    expect(api.off).toHaveBeenCalledWith("select", listener);
  });
});
