import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { AboutCollectionCarousel } from "./about-collection-carousel";
import type { CollectionCaviarContent } from "../types/about-the-product.type";

const caviars: CollectionCaviarContent[] = ["amour", "expression", "kaluga"].map((id) => ({
  id,
  closedTin: `/images/tin-closed-${id}`,
  openTin: `/images/tin-open-${id}`,
  dish: `/images/dish-${id}`,
  name: `Name ${id}`,
  latinName: `Latin ${id}`,
  note: `Note ${id}`,
  tastingNotes: `Tasting ${id}`,
  description: `Description ${id}`,
  descriptionSecondary: `Secondary ${id}`,
  atTable: `At table ${id}`,
  tinAlt: `Tin ${id}`,
  dishAlt: `Dish ${id}`,
}));

const labels = {
  atTable: "At the table",
  next: "Next caviar",
  previous: "Previous caviar",
  selectorLabel: "Choose a caviar",
};

function renderCarousel() {
  return render(<AboutCollectionCarousel caviars={caviars} labels={labels} />);
}

/**
 * Every panel stays mounted so the swap can cross-dissolve, so "the panel" is
 * the one Radix marks active rather than the only one in the document.
 */
function activePanel() {
  const panel = document.querySelector<HTMLElement>('[role="tabpanel"][data-state="active"]');
  if (!panel) throw new Error("no active tabpanel");
  return panel;
}

const panelFor = (id: string) =>
  screen.getByRole("tab", { name: new RegExp(`Name ${id}`) }).getAttribute("aria-controls");

describe("AboutCollectionCarousel", () => {
  it("selects the first caviar and marks only its panel active", () => {
    renderCarousel();

    expect(screen.getByRole("tab", { name: /Name amour/ })).toHaveAttribute("aria-selected", "true");
    expect(within(activePanel()).getByText("Name amour")).toBeInTheDocument();
    expect(screen.getAllByRole("tabpanel")).toHaveLength(caviars.length);
    expect(document.querySelectorAll('[role="tabpanel"][data-state="active"]')).toHaveLength(1);
  });

  it("keeps unselected panels mounted but inert, so a swap never waits on a fetch", () => {
    renderCarousel();

    const kalugaPanel = document.getElementById(panelFor("kaluga") ?? "");
    expect(kalugaPanel).toHaveAttribute("data-state", "inactive");
    expect(kalugaPanel).toHaveAttribute("inert");
    expect(within(kalugaPanel!).getByAltText("Dish kaluga")).toBeInTheDocument();
  });

  it("swaps the panel when another caviar is chosen", async () => {
    const user = userEvent.setup();
    renderCarousel();

    await user.click(screen.getByRole("tab", { name: /Name kaluga/ }));

    const panel = activePanel();
    expect(within(panel).getByText("Name kaluga")).toBeInTheDocument();
    expect(within(panel).getByText("Latin kaluga")).toBeInTheDocument();
    expect(within(panel).getByText("Tasting kaluga")).toBeInTheDocument();
    expect(within(panel).getByText("At table kaluga")).toBeInTheDocument();
    expect(within(panel).getByAltText("Dish kaluga")).toBeInTheDocument();
  });

  it("pages forward and wraps around at the end", async () => {
    const user = userEvent.setup();
    renderCarousel();
    const next = screen.getByRole("button", { name: labels.next });

    await user.click(next);
    expect(within(activePanel()).getByText("Name expression")).toBeInTheDocument();

    await user.click(next);
    await user.click(next);
    expect(within(activePanel()).getByText("Name amour")).toBeInTheDocument();
  });

  it("pages backwards from the first caviar to the last", async () => {
    const user = userEvent.setup();
    renderCarousel();

    await user.click(screen.getByRole("button", { name: labels.previous }));

    expect(within(activePanel()).getByText("Name kaluga")).toBeInTheDocument();
  });

  it("labels the selector strip and the plated dish for assistive technology", () => {
    renderCarousel();

    expect(screen.getByRole("tablist")).toHaveAccessibleName(labels.selectorLabel);
    expect(within(activePanel()).getByAltText("Tin amour")).toBeInTheDocument();
  });
});
