import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { ProductDetailStepper } from "./product-detail-stepper";

describe("ProductDetailStepper", () => {
  it("renders the quantity and decrements/increments correctly", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <TooltipProvider>
        <ProductDetailStepper
          decreaseLabel="Decrease"
          increaseLabel="Increase"
          onChange={onChange}
          quantity={2}
          max={5}
          notEnoughStockLabel="Not enough stock"
        />
      </TooltipProvider>
    );

    expect(screen.getByText("2")).toBeInTheDocument();

    const decreaseBtn = screen.getByRole("button", { name: "Decrease" });
    const increaseBtn = screen.getByRole("button", { name: "Increase" });

    await user.click(decreaseBtn);
    expect(onChange).toHaveBeenCalledWith(1);

    await user.click(increaseBtn);
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("handles isMaxReached and shows tooltip instead of clicking when quantity >= max", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <TooltipProvider>
        <ProductDetailStepper
          decreaseLabel="Decrease"
          increaseLabel="Increase"
          onChange={onChange}
          quantity={5}
          max={5}
          notEnoughStockLabel="Not enough stock"
        />
      </TooltipProvider>
    );

    const increaseBtn = screen.getByRole("button", { name: "Increase" });
    expect(increaseBtn).toHaveAttribute("aria-disabled", "true");

    await user.click(increaseBtn);
    expect(onChange).not.toHaveBeenCalled();
  });
});
