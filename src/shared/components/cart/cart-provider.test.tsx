import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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
            quantityAvailable: 10,
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
              id: "gift-variant",
              image: IMAGE,
              title: "L'Initiation",
              unitPrice: 100,
              weight: "Three 30g Tins",
              quantityAvailable: 10,
            },
          })
        }
      >
        add gift set
      </button>
      <button type="button" onClick={cart.checkout}>checkout</button>
    </div>
  );
}

function renderProbe() {
  return render(
    <CartProvider routeLocale="en-sg">
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

  it("limits quantity to quantityAvailable when adding multiple times", async () => {
    renderProbe();

    for (let i = 0; i < 12; i++) {
      await act(async () => {
        screen.getByRole("button", { name: "add caviar" }).click();
      });
    }

    expect(screen.getByText("line:Amour:10")).toBeInTheDocument();
    expect(screen.getByTestId("item-count").textContent).toBe("10");
  });

  it("creates checkout in the market represented by the current route", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      json: async () => ({ error: "blocked in test" }),
      ok: false,
    } as Response);
    renderProbe();

    await act(async () => {
      screen.getByRole("button", { name: "add caviar" }).click();
    });
    await act(async () => {
      screen.getByRole("button", { name: "checkout" }).click();
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/cart", expect.objectContaining({ method: "POST" }));
    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(JSON.parse(request.body as string)).toEqual({
      locale: "en-sg",
      lines: [{ merchandiseId: "amour-30", quantity: 1 }],
    });
    fetchMock.mockRestore();
  });
});
