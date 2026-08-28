import { fireEvent, render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import type { CartEntry } from "@/shared/types/cart.type";
import cartMessages from "../../../../messages/source/en/cart.json";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, ...props }: ComponentProps<"a">) => <a href={String(href)} {...props} />,
}));

import { CartDrawer } from "./cart-drawer";
import { CartProvider } from "./cart-provider";

const GIFT_IMAGE = {
  altText: "L’Initiation gift set",
  height: 500,
  url: "/images/products/gift-set/linitiation.png",
  width: 500,
};

const ENTRIES: CartEntry[] = [
  {
    group: {
      addHref: "/products/gift-set",
      id: "gift-set-initiation",
      lines: [
        {
          currencyCode: "EUR",
          id: "line-1",
          merchandiseId: "gift-variant",
          image: GIFT_IMAGE,
          quantity: 2,
          quantityEditable: false,
          supportsGiftMessage: true,
          title: "L’Initiation",
          unitPrice: 100,
          weight: "Five 30g Tins",
        },
      ],
      title: "L’Initiation",
    },
    kind: "group",
  },
  {
    kind: "line",
    line: {
      currencyCode: "EUR",
      id: "line-2",
      merchandiseId: "amour-variant",
      image: null,
      quantity: 2,
      quantityEditable: true,
      supportsGiftMessage: false,
      title: "Amour",
      unitPrice: 100,
      weight: "30g",
    },
  },
];

function renderCart(entries: CartEntry[]) {
  return render(
    <NextIntlClientProvider locale="en" messages={cartMessages}>
      <CartProvider initialEntries={entries} initialOpen routeLocale="en-sg">
        <CartDrawer />
      </CartProvider>
    </NextIntlClientProvider>,
  );
}

describe("CartDrawer", () => {
  it("prints the bag count, the line totals and the cart total", () => {
    renderCart(ENTRIES);

    expect(screen.getByText("YOUR BAG (4)")).toBeInTheDocument();
    expect(screen.getAllByText("200.00€")).toHaveLength(2);
    expect(screen.getByText("400.00€")).toBeInTheDocument();
  });

  it("offers a gift message on gift-set lines and a stepper on standalone lines", () => {
    renderCart(ENTRIES);

    expect(screen.getByRole("button", { name: "Add message" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Increase quantity of Amour" }),
    ).toBeInTheDocument();
  });

  it("drops the whole group card once its last line is removed", () => {
    renderCart(ENTRIES);

    fireEvent.click(screen.getByRole("button", { name: "Remove L’Initiation" }));

    expect(screen.queryByRole("region", { name: "L’Initiation" })).not.toBeInTheDocument();
    expect(screen.getByText("YOUR BAG (2)")).toBeInTheDocument();
  });

  it("steps the drawer aside while the message editor is open", () => {
    renderCart(ENTRIES);

    fireEvent.click(screen.getByRole("button", { name: "Add message" }));
    expect(screen.queryByText("YOUR BAG (4)")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close message editor" }));
    expect(screen.getByText("YOUR BAG (4)")).toBeInTheDocument();
  });

  it("saves a personal gift message back onto the line", () => {
    renderCart(ENTRIES);

    fireEvent.click(screen.getByRole("button", { name: "Add message" }));

    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByLabelText("Personal message"));
    fireEvent.change(within(dialog).getByLabelText("Your message*"), {
      target: { value: "Bonne fête" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    expect(screen.getByRole("button", { name: "Message (1)" })).toBeInTheDocument();
  });

  it("shows the empty state instead of the totals when the bag is empty", () => {
    renderCart([]);

    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Check out" })).not.toBeInTheDocument();
  });
});
