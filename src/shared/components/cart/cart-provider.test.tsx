import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CartProvider, useCart } from "./cart-provider";

const IMAGE = { altText: "Amour", height: 500, url: "/images/caviar/amour.png", width: 500 };

function Probe() {
  const cart = useCart();

  return (
    <div>
      <p data-testid="is-open">{String(cart.isOpen)}</p>
      <p data-testid="item-count">{cart.itemCount}</p>
      <p data-testid="total">{cart.totalPrice}</p>
      <ul data-testid="entries">
        {cart.entries.map((entry) =>
          entry.kind === "line" ? (
            <li key={entry.line.id}>
              line:{entry.line.title}:{entry.line.quantity}
            </li>
          ) : (
            <li key={entry.group.id}>
              group:{entry.group.title}:{entry.group.lines.length}
            </li>
          ),
        )}
      </ul>
      <button
        type="button"
        onClick={() =>
          cart.addLine({
            currencyCode: "EUR",
            id: "amour-30",
            image: IMAGE,
            quantity: 1,
            title: "Amour",
            unitPrice: 75,
            weight: "30g",
          })
        }
      >
        add caviar
      </button>
      <button
        type="button"
        onClick={() =>
          cart.addGiftSetUnits({
            group: { addHref: "/products/gift-set/linitiation", id: "gift-linitiation", title: "L'Initiation" },
            quantity: 2,
            unit: {
              currencyCode: "EUR",
              image: IMAGE,
              title: "L'Initiation",
              unitPrice: 100,
              weight: "Three 30g Tins",
            },
          })
        }
      >
        add gift set
      </button>
    </div>
  );
}

function renderProbe() {
  return render(
    <CartProvider>
      <Probe />
    </CartProvider>,
  );
}

describe("CartProvider", () => {
  it("adds a new standalone line and opens the drawer", async () => {
    renderProbe();

    await act(async () => {
      screen.getByRole("button", { name: "add caviar" }).click();
    });

    expect(screen.getByTestId("is-open").textContent).toBe("true");
    expect(screen.getByTestId("item-count").textContent).toBe("1");
    expect(screen.getByTestId("total").textContent).toBe("75");
    expect(screen.getByText("line:Amour:1")).toBeInTheDocument();
  });

  it("bumps the quantity of an existing standalone line instead of duplicating it", async () => {
    renderProbe();

    await act(async () => {
      screen.getByRole("button", { name: "add caviar" }).click();
    });
    await act(async () => {
      screen.getByRole("button", { name: "add caviar" }).click();
    });

    expect(screen.getByTestId("entries").children).toHaveLength(1);
    expect(screen.getByText("line:Amour:2")).toBeInTheDocument();
    expect(screen.getByTestId("item-count").textContent).toBe("2");
  });

  it("adds one separate line per unit inside a gift-set group", async () => {
    renderProbe();

    await act(async () => {
      screen.getByRole("button", { name: "add gift set" }).click();
    });

    expect(screen.getByText("group:L'Initiation:2")).toBeInTheDocument();
    expect(screen.getByTestId("item-count").textContent).toBe("2");
    expect(screen.getByTestId("total").textContent).toBe("200");
  });

  it("appends new units to an existing gift-set group rather than creating a second card", async () => {
    renderProbe();

    await act(async () => {
      screen.getByRole("button", { name: "add gift set" }).click();
    });
    await act(async () => {
      screen.getByRole("button", { name: "add gift set" }).click();
    });

    expect(screen.getByTestId("entries").children).toHaveLength(1);
    expect(screen.getByText("group:L'Initiation:4")).toBeInTheDocument();
  });
});
