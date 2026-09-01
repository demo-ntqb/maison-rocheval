import { fireEvent, render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import type { CartEntry } from "@/shared/types/cart.type";
import cartMessages from "../../../../messages/source/en/cart.json";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, ...props }: ComponentProps<"a">) => <a href={String(href)} {...props} />,
}));

const cartApi = vi.hoisted(() => ({
  addLine: vi.fn(),
  fetchCart: vi.fn(),
  fetchCheckout: vi.fn(),
  removeLine: vi.fn(),
  updateGiftMessage: vi.fn(),
  updateQuantity: vi.fn(),
  updateRegion: vi.fn(),
}));

vi.mock("@/shared/lib/cart/cart-api", () => cartApi);

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
      id: "gid://shopify/Product/gift-set-initiation",
      lines: [
        {
          id: "gid://shopify/CartLine/line-1",
          merchandiseId: "gid://shopify/ProductVariant/gift-variant",
          productId: "gid://shopify/Product/gift-set-initiation",
          kind: "gift_set",
          image: GIFT_IMAGE,
          quantity: 1,
          quantityAvailable: 10,
          quantityEditable: false,
          supportsGiftMessage: true,
          title: "L’Initiation",
          weight: "Five 30g Tins",
          unitPrice: { amount: "100.00", currencyCode: "EUR" },
          subtotal: { amount: "100.00", currencyCode: "EUR" },
          giftMessage: null,
          unitId: "unit-1",
        },
        {
          id: "gid://shopify/CartLine/line-1b",
          merchandiseId: "gid://shopify/ProductVariant/gift-variant",
          productId: "gid://shopify/Product/gift-set-initiation",
          kind: "gift_set",
          image: GIFT_IMAGE,
          quantity: 1,
          quantityAvailable: 10,
          quantityEditable: false,
          supportsGiftMessage: true,
          title: "L’Initiation",
          weight: "Five 30g Tins",
          unitPrice: { amount: "100.00", currencyCode: "EUR" },
          subtotal: { amount: "100.00", currencyCode: "EUR" },
          giftMessage: null,
          unitId: "unit-2",
        },
      ],
      title: "L’Initiation",
    },
    kind: "group",
  },
  {
    kind: "line",
    line: {
      id: "gid://shopify/CartLine/line-2",
      merchandiseId: "gid://shopify/ProductVariant/amour-variant",
      productId: "gid://shopify/Product/amour",
      kind: "caviar",
      image: null,
      quantity: 2,
      quantityAvailable: 10,
      quantityEditable: true,
      supportsGiftMessage: false,
      title: "Amour",
      weight: "30g",
      unitPrice: { amount: "100.00", currencyCode: "EUR" },
      subtotal: { amount: "200.00", currencyCode: "EUR" },
      giftMessage: null,
      unitId: null,
    },
  },
];

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
}

function renderCart(entries: CartEntry[]) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale="en" messages={cartMessages}>
        <CartProvider initialEntries={entries} initialOpen routeLocale="en-sg">
          <CartDrawer />
        </CartProvider>
      </NextIntlClientProvider>
    </QueryClientProvider>,
  );
}

describe("CartDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const giftEntry = ENTRIES[0] as Extract<CartEntry, { kind: "group" }>;
    cartApi.fetchCart.mockReturnValue(new Promise(() => undefined));
    cartApi.removeLine.mockImplementation(async () => ({
      operationId: "op-remove",
      cart: {
        entries: [
          {
            group: {
              addHref: "/products/gift-set",
              id: "gid://shopify/Product/gift-set-initiation",
              lines: [giftEntry.group.lines[0]!],
              title: "L’Initiation",
            },
            kind: "group",
          },
          ENTRIES[1]!,
        ],
        itemCount: 3,
        subtotal: { amount: "300.00", currencyCode: "EUR" },
        countryCode: "SG",
        warnings: [],
      },
      warnings: [],
    }));
    cartApi.updateGiftMessage.mockImplementation(async () => ({
      operationId: "op-msg",
      cart: {
        entries: [
          {
            group: {
              addHref: "/products/gift-set",
              id: "gid://shopify/Product/gift-set-initiation",
              lines: [
                {
                  ...giftEntry.group.lines[0]!,
                  giftMessage: {
                    kind: "personal",
                    sender: "",
                    recipient: "",
                    message: "Bonne fête",
                  },
                },
                giftEntry.group.lines[1]!,
              ],
              title: "L’Initiation",
            },
            kind: "group",
          },
          ENTRIES[1]!,
        ],
        itemCount: 4,
        subtotal: { amount: "400.00", currencyCode: "EUR" },
        countryCode: "SG",
        warnings: [],
      },
      warnings: [],
    }));
  });

  it("prints the physical-unit count, line totals and cart subtotal", () => {
    renderCart(ENTRIES);

    expect(screen.getByText("YOUR BAG (4)")).toBeInTheDocument();
    expect(screen.getAllByText("100.00€")).toHaveLength(2);
    expect(screen.getAllByText("200.00€")).toHaveLength(1);
    expect(screen.getByText("400.00€")).toBeInTheDocument();
  });

  it("offers gift messages on gift units and a stepper on caviar", () => {
    renderCart(ENTRIES);

    expect(screen.getAllByRole("button", { name: "Add message" })).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Increase quantity of Amour" })).toBeInTheDocument();
  });

  it("removes selected gift unit upon confirmation", async () => {
    renderCart(ENTRIES);

    fireEvent.click(screen.getAllByRole("button", { name: "Remove L’Initiation" })[0]!);

    expect(await screen.findByText("YOUR BAG (3)")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "L’Initiation" })).toBeInTheDocument();
  });

  it("keeps the drawer open and overlays the message editor", () => {
    renderCart(ENTRIES);

    fireEvent.click(screen.getAllByRole("button", { name: "Add message" })[0]!);
    expect(screen.getByText("YOUR BAG (4)")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close message editor" }));
    expect(screen.getByText("YOUR BAG (4)")).toBeInTheDocument();
  });

  it("saves a personal gift message back onto the unit after confirmation", async () => {
    renderCart(ENTRIES);

    fireEvent.click(screen.getAllByRole("button", { name: "Add message" })[0]!);
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByLabelText("Personal message"));
    fireEvent.change(within(dialog).getByLabelText("Your message*"), {
      target: { value: "Bonne fête" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    expect(await screen.findByRole("button", { name: "Message (1)" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Add message" })).toHaveLength(1);
  });

  it("shows the empty state instead of totals when the bag is empty", () => {
    renderCart([]);

    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Check out" })).not.toBeInTheDocument();
  });
});
