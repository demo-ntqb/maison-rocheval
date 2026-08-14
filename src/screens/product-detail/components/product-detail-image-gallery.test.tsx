import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentPropsWithoutRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { ProductDetailImageGallery } from "./product-detail-image-gallery";

vi.mock("@/shared/components/ui/carousel", () => ({
  Carousel: ({ children }: ComponentPropsWithoutRef<"div">) => <div>{children}</div>,
  CarouselContent: ({ children }: ComponentPropsWithoutRef<"div">) => <div>{children}</div>,
  CarouselItem: ({ children }: ComponentPropsWithoutRef<"div">) => <div>{children}</div>,
}));

const image = {
  altText: "Kaluga tin",
  height: 550,
  url: "https://cdn.shopify.com/kaluga.png",
  width: 400,
};

describe("ProductDetailImageGallery", () => {
  it("mở Dialog có title và cung cấp zoom control semantic", async () => {
    const user = userEvent.setup();
    render(<ProductDetailImageGallery images={[image]} title="Kaluga" />);

    await user.click(screen.getByRole("button", { name: "Enlarge Kaluga image 1" }));

    expect(screen.getByRole("dialog")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Kaluga image viewer" })).toBeInTheDocument();
    const zoom = screen.getByRole("button", { name: "Zoom in Kaluga" });
    expect(zoom).toHaveAttribute("aria-pressed", "false");

    await user.click(zoom);

    expect(screen.getByRole("button", { name: "Zoom out Kaluga" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
