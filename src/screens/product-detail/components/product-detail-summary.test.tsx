import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ProductDetailSummary } from "./product-detail-summary";

const LONG_DESCRIPTION =
  "This defining collection offers a taste of our legendary Royal Ossetra, Beluga, Daurenki, Persicus and Kaluga Huso Hybrid Caviar, assembled in a signature presentation box.";

function renderSummary(description: string, notes?: string) {
  return render(
    <ProductDetailSummary
      composition={["Amour", "L’expression", "Branded Caviar Key"]}
      description={description}
      notes={notes}
      seeLessLabel="see less"
      seeMoreLabel="see more"
      subtitle="An hybrid set of three"
      title="L’Initiation"
    />,
  );
}

describe("ProductDetailSummary", () => {
  it("renders the heading, subtitle and every composition item", () => {
    renderSummary("A composed caviar ritual.");

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("L’Initiation");
    expect(screen.getByText("An hybrid set of three")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("keeps short copy intact and offers no toggle", () => {
    renderSummary("A composed caviar ritual.");

    expect(screen.getByText(/A composed caviar ritual\./)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "see more" })).not.toBeInTheDocument();
  });

  it("truncates long copy and expands it on demand", async () => {
    const user = userEvent.setup();
    renderSummary(LONG_DESCRIPTION);

    const toggle = screen.getByRole("button", { name: "see more" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText(new RegExp(LONG_DESCRIPTION))).not.toBeInTheDocument();

    await user.click(toggle);

    expect(screen.getByText(new RegExp(LONG_DESCRIPTION))).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "see less" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("renders the caviar tasting profile above the copy when provided", () => {
    renderSummary("A composed caviar ritual.", "Creamy · Cheese · Delicate");

    expect(screen.getByText("Creamy · Cheese · Delicate")).toBeInTheDocument();
  });
});
