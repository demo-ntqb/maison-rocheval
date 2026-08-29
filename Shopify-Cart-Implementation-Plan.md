# Maison Rocheval — Shopify Cart Implementation Plan

**Repo:** `feat/cart-v2`
**Target API:** Shopify Storefront API `2026-04`  
**Mục tiêu:** chuyển cart hiện tại từ local React state sang Shopify Cart mà giữ nguyên UX.

---

# 0. Repo baseline hiện tại

Các file chính đang liên quan trực tiếp:

```text
src/
├── app/
│   ├── [locale]/
│   │   └── (main)/
│   │       ├── layout.tsx
│   │       └── products/
│   │           └── [category]/
│   │               └── [handle]/
│   │                   └── page.tsx
│   └── api/
│
├── screens/
│   └── product-detail/
│       └── components/
│           ├── product-detail-caviar-panel.tsx
│           └── product-detail-gift-set-panel.tsx
│
└── shared/
    ├── components/
    │   ├── cart/
    │   │   ├── cart-provider.tsx
    │   │   ├── cart-provider.test.tsx
    │   │   ├── cart-drawer.tsx
    │   │   ├── cart-drawer.test.tsx
    │   │   ├── cart-line-item.tsx
    │   │   ├── cart-group-card.tsx
    │   │   ├── cart-message-dialog.tsx
    │   │   ├── cart-quantity-stepper.tsx
    │   │   └── cart-trigger.tsx
    │   │
    │   └── layout/
    │       ├── region-preference-dialog.tsx
    │       └── region-preference-gate.tsx
    │
    ├── lib/
    │   ├── region-preference.ts
    │   └── shopify/
    │       ├── config.ts
    │       ├── storefront.ts
    │       ├── storefront-config.ts
    │       └── catalog/
    │           └── catalog.service.ts
    │
    └── types/
        ├── cart.type.ts
        └── region.type.ts
```

Current `CartProvider` đang hoàn toàn local: product gửi cả price/title/image vào provider, Caviar dùng variant ID làm `line.id`, Gift Set tự sinh UUID, và total được tính bằng `unitPrice * quantity`. 

Current Gift Set cũng đang tính inventory:

```ts
existingCount = group.lines.length;
```

tức đếm tất cả variant trong product group, đây chính là bug cần sửa trước khi nối Shopify. 

Current cart type cũng chưa phân biệt:

```text
Shopify CartLine ID
vs
ProductVariant ID
vs
Product ID
```



Caviar PDP hiện đã có `activeVariant.id`, trong khi Gift Set chưa truyền variant ID vào cart.  

Current checkout button chưa có handler. 

Current region preference chỉ lưu `localStorage`; Shopify server chưa biết country mà shopper đã chọn. 

Catalog hiện cũng hardcode cả `/en` và `/fr` vào France market. 

---

# 1. Dependency graph

Triển khai theo thứ tự:

```text
PR 1
Cart domain + identity cleanup
        │
        ▼
PR 2
Shopify Cart server core
        │
        ▼
PR 3
Cart API routes
        │
        ▼
PR 4
CartProvider server-backed + optimistic queue
        │
        ├─────────────┐
        ▼             ▼
PR 5              PR 6
PDP integration   Gift messages
        │             │
        └──────┬──────┘
               ▼
PR 7
Markets / region sync
               │
               ▼
PR 8
Checkout
               │
               ▼
PR 9
Hardening + E2E + launch gates
```

Không nên bắt đầu từ API route hoặc checkout.

**PR 1 phải merge trước**, vì identity model hiện tại không đủ an toàn để map Shopify CartLine.

---

# PR 1 — Refactor Cart Domain & Identity

## Mục tiêu

Tách rõ:

```text
CartLine.id
=
physical cart line identity

CartLine.merchandiseId
=
Shopify ProductVariant GID

CartLine.productId
=
Shopify Product GID
```

Sau PR này cart vẫn có thể chạy local, nhưng data model đã sẵn sàng cho Shopify.

---

## 1.1 Modify

### `src/shared/types/cart.type.ts`

Thay model hiện tại bằng:

```ts
export type CartMoney = {
  amount: string;
  currencyCode: string;
};

export type CartLineImage = {
  altText: string | null;
  height: number | null;
  url: string;
  width: number | null;
};

export type CartGiftMessage =
  | { kind: "blank" }
  | { kind: "personal"; text: string };

export type CartLineKind =
  | "caviar"
  | "gift_set";

export type CartLine = {
  /**
   * Physical line identity.
   *
   * PR1:
   * local provisional ID.
   *
   * PR4+:
   * Shopify CartLine GID.
   */
  id: string;

  /**
   * Shopify ProductVariant GID.
   */
  merchandiseId: string;

  /**
   * Shopify Product GID.
   */
  productId: string;

  kind: CartLineKind;

  image: CartLineImage | null;

  quantity: number;

  quantityAvailable: number | null;

  quantityEditable: boolean;

  supportsGiftMessage: boolean;

  title: string;

  /**
   * Existing UI calls this `weight`.
   * Preserve the name for now to minimize UI changes.
   */
  weight: string;

  unitPrice: CartMoney;

  subtotal: CartMoney;

  giftMessage?: CartGiftMessage;

  /**
   * Stable identity of one physical gift-set unit.
   */
  unitId?: string;
};

export type CartGroup = {
  addHref?: string;

  /**
   * Canonical Shopify Product GID.
   */
  id: string;

  lines: CartLine[];

  title: string;
};

export type CartEntry =
  | {
      kind: "line";
      line: CartLine;
    }
  | {
      kind: "group";
      group: CartGroup;
    };

export type CartWarning = {
  code: string;
  lineId?: string;
};

export type CartSnapshot = {
  entries: CartEntry[];

  itemCount: number;

  subtotal: CartMoney;

  countryCode: "FR" | "US";

  warnings: CartWarning[];
};
```

---

# 1.2 Add pure cart helpers

Create:

```text
src/shared/lib/cart/
├── cart-entry.ts
├── cart-money.ts
└── cart-optimistic.ts
```

### `cart-entry.ts`

Move những helper hiện đang nằm trong `cart-provider.tsx` ra pure functions:

```ts
export function flattenCartLines(
  entries: CartEntry[],
): CartLine[] {
  return entries.flatMap((entry) =>
    entry.kind === "line"
      ? [entry.line]
      : entry.group.lines,
  );
}

export function mapCartEntryLines(
  entry: CartEntry,
  mapper: (
    line: CartLine,
  ) => CartLine | null,
): CartEntry | null {
  // same behavior as current provider
}
```

Add:

```ts
export function findCaviarLine(
  entries: CartEntry[],
  merchandiseId: string,
): CartLine | undefined {
  return flattenCartLines(entries).find(
    (line) =>
      line.kind === "caviar" &&
      line.merchandiseId === merchandiseId,
  );
}
```

Gift inventory helper:

```ts
export function countGiftUnitsByVariant(
  entries: CartEntry[],
  merchandiseId: string,
): number {
  return flattenCartLines(entries)
    .filter(
      (line) =>
        line.kind === "gift_set" &&
        line.merchandiseId === merchandiseId,
    )
    .reduce(
      (total, line) =>
        total + line.quantity,
      0,
    );
}
```

---

# 1.3 Fix Add input design

### `src/shared/components/cart/cart-provider.tsx`

Không để API/browser payload trộn với optimistic display data.

Define:

```ts
export type AddCartLineInput = {
  merchandiseId: string;

  productId: string;

  quantity: number;

  optimistic: {
    image: CartLineImage | null;
    title: string;
    weight: string;

    unitPrice: CartMoney;

    quantityAvailable: number | null;
  };
};
```

Gift:

```ts
export type AddGiftSetInput = {
  merchandiseId: string;

  productId: string;

  quantity: number;

  group: {
    addHref?: string;
    title: string;
  };

  optimistic: {
    image: CartLineImage | null;
    title: string;
    weight: string;
    unitPrice: CartMoney;
    quantityAvailable: number | null;
  };
};
```

Important:

```text
optimistic
```

chỉ dùng browser rendering.

Sau PR3 server request sẽ strip toàn bộ object này.

---

# 1.4 Caviar merge rule

Current:

```ts
entry.line.id === input.id
```

đổi thành:

```ts
entry.line.kind === "caviar" &&
entry.line.merchandiseId === input.merchandiseId
```

Pseudo:

```ts
const existing = findCaviarLine(
  current,
  input.merchandiseId,
);

if (existing) {
  return updateQuantity(
    existing.id,
    Math.min(
      existing.quantity + input.quantity,
      existing.quantityAvailable ?? 99,
    ),
  );
}
```

`id` không còn được dùng để identify merchandise.

---

# 1.5 Gift Set inventory bug

Current logic sai:

```ts
const existingCount =
  group.lines.length;
```

Thay:

```ts
const existingVariantCount =
  countGiftUnitsByVariant(
    current,
    input.merchandiseId,
  );

const available =
  input.optimistic.quantityAvailable ?? 99;

const allowedAddQty =
  Math.max(
    0,
    available - existingVariantCount,
  );
```

---

# 1.6 Gift Set provisional IDs

PR1 vẫn local-only nên:

```ts
const unitId =
  crypto.randomUUID();

const lineId =
  `optimistic:${unitId}`;
```

Create:

```ts
{
  id: lineId,
  unitId,

  merchandiseId,
  productId,

  kind: "gift_set",

  quantity: 1,

  ...
}
```

`unitId` sau này trở thành `_mr_unit_id`.

---

# 1.7 Modify Caviar PDP

### `src/screens/product-detail/components/product-detail-caviar-panel.tsx`

Current payload đang truyền price/title trực tiếp. 

Target:

```ts
cart.addLine({
  merchandiseId: activeVariant.id,
  productId: product.id,

  quantity,

  optimistic: {
    image: product.image,

    title: product.title,

    weight:
      activeVariant.optionValue,

    unitPrice: {
      amount:
        activeVariant.price.amount,

      currencyCode:
        activeVariant.price.currencyCode,
    },

    quantityAvailable:
      activeVariant.quantityAvailable,
  },
});
```

---

# 1.8 Modify Gift Set PDP

### `src/screens/product-detail/components/product-detail-gift-set-panel.tsx`

Quan trọng nhất:

```ts
merchandiseId:
  activeVariant.id
```

Target:

```ts
cart.addGiftSetUnits({
  merchandiseId:
    activeVariant.id,

  productId:
    product.id,

  quantity,

  group: {
    addHref:
      ROUTES.PRODUCT_DETAIL(
        CatalogCollectionHandle.GIFT_SET,
        product.handle,
      ),

    title:
      product.title,
  },

  optimistic: {
    image:
      product.image,

    title:
      product.title,

    weight:
      stripTitlePrefix(
        activeVariant.optionValue,
        product.title,
      ),

    unitPrice: {
      amount:
        activeVariant.price.amount,

      currencyCode:
        activeVariant.price.currencyCode,
    },

    quantityAvailable:
      activeVariant.quantityAvailable,
  },
});
```

Gift Set hiện không truyền variant ID nên đây là required change. 

---

# 1.9 Modify Cart UI money usage

Files:

```text
cart-line-item.tsx
cart-drawer.tsx
cart-group-card.tsx
```

Không tự calculate commerce values.

Temporary PR1 formatting:

```ts
formatBrandPrice(
  Number(line.unitPrice.amount),
  line.unitPrice.currencyCode,
  locale,
);
```

Sau Shopify integration total drawer sẽ dùng:

```ts
subtotal
```

không reduce lines.

---

# 1.10 Tests

Modify:

```text
src/shared/components/cart/cart-provider.test.tsx
```

Add:

```text
same merchandiseId
→ same Caviar row

different merchandiseId
→ different row

line.id different from merchandiseId

gift 30g existing does not reduce gift 50g inventory

gift units have stable unique unitId

gift group id = productId
```

---

# PR 1 Done

Must pass:

```text
npm test
npm run typecheck
npm run lint
```

với UX hiện tại không đổi.

---

# PR 2 — Shopify Cart Server Core

## Mục tiêu

Tạo server-only commerce layer.

Không sửa UI trong PR này.

---

# 2.1 New directory

Create:

```text
src/shared/lib/shopify/cart/
├── cart.client.ts
├── cart.cookie.ts
├── cart.fragment.ts
├── cart.query.ts
├── cart.mutation.ts
├── cart.mapper.ts
├── cart.service.ts
├── cart.validation.ts
├── cart.error.ts
├── cart.type.ts
└── index.ts
```

---

# 2.2 Do NOT modify catalog client behavior

Current:

```text
src/shared/lib/shopify/storefront.ts
```

dùng:

```ts
type:
  "private_no_buyer_context"
```

với synthetic request nhằm giữ catalog cacheable. 

Không biến function này thành:

```ts
getCatalogStorefrontClient(
  request,
)
```

Cart dùng client riêng.

---

# 2.3 `cart.client.ts`

Responsibilities:

```text
request scoped
private token
buyer IP
Storefront API 2026-04
no cache
```

Pseudo:

```ts
import "server-only";

import {
  createShopifyRequestContext,
  createStorefrontClient,
} from "@shopify/hydrogen";

import {
  resolveStorefrontConfig,
} from "../storefront-config";

export function createCartStorefrontClient(
  request: Request,
) {
  const config =
    resolveStorefrontConfig();

  const buyerIp =
    getBuyerIp(request);

  const headers =
    new Headers();

  if (buyerIp) {
    headers.set(
      "Shopify-Storefront-Buyer-IP",
      buyerIp,
    );
  }

  const requestContext =
    createShopifyRequestContext({
      request: {
        headers,
      },

      // Only bootstrap values.
      // Real cart country comes from
      // CartBuyerIdentity.
      i18n: {
        country: "FR",
        language: "EN",
      },
    });

  const storefront =
    createStorefrontClient({
      // Use buyer-context private mode
      // supported by installed Hydrogen
      // version.
      //
      // DO NOT use
      // private_no_buyer_context.
      type: "private",

      requestContext,

      config: {
        storeDomain:
          config.storeDomain,

        privateStorefrontToken:
          config.privateStorefrontToken,

        apiVersion:
          "2026-04",
      },
    });

  return storefront;
}
```

Implementation agent phải kiểm tra exact Hydrogen type name trong installed dependency.

Invariant:

```text
catalog:
private_no_buyer_context

cart:
buyer-context request scoped
```

---

# 2.4 Buyer IP helper

Create:

```text
src/shared/lib/request/
└── buyer-ip.ts
```

Pseudo:

```ts
export function getBuyerIp(
  request: Request,
): string | undefined {
  const forwarded =
    request.headers.get(
      "x-forwarded-for",
    );

  if (forwarded) {
    return forwarded
      .split(",")[0]
      ?.trim();
  }

  return undefined;
}
```

Nếu Vercel deployment đang có trusted header khác, centralize tại đây.

Không duplicate parsing trong route.

---

# 2.5 `cart.cookie.ts`

```ts
import "server-only";

import {
  cookies,
} from "next/headers";

const CART_COOKIE =
  "mr_cart";
```

Functions:

```ts
export async function
getCartId(): Promise<
  string | null
>;

export async function
setCartId(
  cartId: string,
): Promise<void>;

export async function
clearCartId(): Promise<void>;
```

Cookie:

```ts
{
  name: "mr_cart",

  value:
    encodeURIComponent(cartId),

  httpOnly: true,

  secure:
    process.env.NODE_ENV ===
    "production",

  sameSite: "lax",

  path: "/",
}
```

Never return this ID to browser.

---

# 2.6 GraphQL fragment

### `cart.fragment.ts`

```graphql
fragment MaisonCart on Cart {
  id

  totalQuantity

  checkoutUrl

  buyerIdentity {
    countryCode
  }

  cost {
    subtotalAmount {
      amount
      currencyCode
    }
  }

  lines(
    first: $first
    after: $after
  ) {
    pageInfo {
      hasNextPage
      endCursor
    }

    nodes {
      id
      quantity

      attributes {
        key
        value
      }

      cost {
        amountPerQuantity {
          amount
          currencyCode
        }

        subtotalAmount {
          amount
          currencyCode
        }
      }

      merchandise {
        ... on ProductVariant {
          id
          title

          availableForSale
          quantityAvailable

          selectedOptions {
            name
            value
          }

          image {
            url
            altText
            width
            height
          }

          product {
            id
            handle
            title
            productType
          }
        }
      }
    }
  }
}
```

---

# 2.7 GraphQL operations

Create:

```text
cart.query.ts
cart.mutation.ts
```

Exports:

```ts
CART_QUERY

CART_CREATE

CART_LINES_ADD

CART_LINES_UPDATE

CART_LINES_REMOVE

CART_BUYER_IDENTITY_UPDATE
```

Every mutation MUST request:

```graphql
userErrors {
  code
  field
  message
}

warnings {
  code
  target
  message
}
```

---

# 2.8 Shopify internal types

### `cart.type.ts`

Keep Shopify raw types separate from UI/domain types.

Example:

```ts
export type ShopifyMoney = {
  amount: string;
  currencyCode: string;
};

export type ShopifyCartAttribute = {
  key: string;
  value: string;
};

export type ShopifyCartLine = {
  id: string;
  quantity: number;

  attributes:
    ShopifyCartAttribute[];

  cost: {
    amountPerQuantity:
      ShopifyMoney;

    subtotalAmount:
      ShopifyMoney;
  };

  merchandise: {
    id: string;

    title: string;

    quantityAvailable:
      number | null;

    image:
      ShopifyImage | null;

    product: {
      id: string;
      handle: string;
      title: string;
      productType: string;
    };
  };
};
```

---

# 2.9 `cart.mapper.ts`

Main entry:

```ts
export function mapShopifyCart(
  cart: ShopifyCart,
): CartSnapshot;
```

Line mapping:

```ts
function mapLine(
  line: ShopifyCartLine,
): CartLine {
  const attrs =
    attributesToRecord(
      line.attributes,
    );

  const kind =
    attrs._mr_kind ===
    "gift_set"
      ? "gift_set"
      : "caviar";

  return {
    id:
      line.id,

    merchandiseId:
      line.merchandise.id,

    productId:
      line.merchandise
        .product.id,

    kind,

    quantity:
      line.quantity,

    quantityAvailable:
      line.merchandise
        .quantityAvailable,

    quantityEditable:
      kind === "caviar",

    supportsGiftMessage:
      kind === "gift_set",

    title:
      line.merchandise
        .product.title,

    weight:
      resolveVariantLabel(
        line.merchandise,
      ),

    image:
      mapImage(
        line.merchandise.image,
      ),

    unitPrice:
      line.cost
        .amountPerQuantity,

    subtotal:
      line.cost
        .subtotalAmount,

    unitId:
      attrs._mr_unit_id,

    giftMessage:
      mapGiftMessage(attrs),
  };
}
```

Grouping:

```ts
const giftGroups =
  groupBy(
    giftLines,
    (line) => line.productId,
  );
```

No `_mr_group_id`.

---

# 2.10 Preserve current display labels

Important:

Shopify technical variant title có thể không giống current visual `weight`.

Implement helper:

```ts
function resolveVariantLabel(
  variant,
): string {
  // Preserve current option/weight
  // semantics.
}
```

Không để Cart API làm thay đổi visual copy.

---

# 2.11 Pagination

### `cart.service.ts`

Implement:

```ts
async function getFullCart(
  client,
  cartId,
  context,
): Promise<ShopifyCart | null>
```

Pseudo:

```ts
let after:
  string | undefined;

const lines = [];

do {
  const page =
    await queryCart({
      cartId,
      after,
      ...
    });

  if (!page.cart) {
    return null;
  }

  lines.push(
    ...page.cart
      .lines.nodes,
  );

  after =
    page.cart.lines
      .pageInfo
      .hasNextPage
      ? page.cart.lines
          .pageInfo
          .endCursor
      : undefined;

} while (after);

return {
  ...cart,
  lines: {
    nodes: lines,
  },
};
```

---

# 2.12 Cart service API

Expose:

```ts
export async function
getCart(...);

export async function
addCartLines(...);

export async function
updateCartLine(...);

export async function
removeCartLine(...);

export async function
updateCartBuyerIdentity(...);

export async function
getCheckout(...);
```

UI/routes không gọi GraphQL trực tiếp.

---

# 2.13 Add Caviar server algorithm

```ts
async function addCaviar({
  cartId,
  merchandiseId,
  quantity,
}) {
  const cart =
    await getFullCart();

  const existing =
    find existing line where:
      _mr_kind === "caviar"
      &&
      merchandise.id
        === merchandiseId;

  if (existing) {
    const target =
      existing.quantity +
      quantity;

    return cartLinesUpdate({
      id:
        existing.id,

      quantity:
        target,
    });
  }

  return cartLinesAdd({
    merchandiseId,

    quantity,

    attributes: [
      {
        key:
          "_mr_kind",

        value:
          "caviar",
      },
    ],
  });
}
```

Do not rely on Shopify automatic merge.

---

# 2.14 Add Gift Set server algorithm

```ts
const lines =
  Array.from(
    { length: quantity },
    (_, index) => {
      const unitId =
        requestedUnitIds[index];

      return {
        merchandiseId,

        quantity: 1,

        attributes: [
          {
            key:
              "_mr_kind",

            value:
              "gift_set",
          },

          {
            key:
              "_mr_unit_id",

            value:
              unitId,
          },
        ],
      };
    },
  );

return cartLinesAdd({
  cartId,
  lines,
});
```

One network mutation, N physical lines.

---

# 2.15 Tests

Create:

```text
src/shared/lib/shopify/cart/
├── cart.mapper.test.ts
├── cart.service.test.ts
└── cart.validation.test.ts
```

Cover:

```text
Caviar mapping

Gift mapping

gift grouping by Product.id

gift message parsing

same variant Caviar update

new Caviar add

Gift qty 3 → 3 lines

Gift quantity always 1

pagination

warnings

userErrors
```

---

# PR 3 — Cart HTTP API

## New routes

```text
src/app/api/
├── cart/
│   ├── route.ts
│   ├── lines/
│   │   └── route.ts
│   ├── line/
│   │   └── route.ts
│   ├── remove/
│   │   └── route.ts
│   └── checkout/
│       └── route.ts
│
└── region/
    └── route.ts
```

`checkout` và `region` có thể stub trong PR3 rồi implement PR7/8.

---

# 3.1 Shared API helpers

Create:

```text
src/shared/lib/http/
├── api-response.ts
└── same-origin.ts
```

### Same origin validation

Pseudo:

```ts
export function
assertSameOrigin(
  request: Request,
) {
  const origin =
    request.headers.get(
      "origin",
    );

  if (!origin) {
    return;
  }

  const expected =
    new URL(request.url).origin;

  if (origin !== expected) {
    throw new ApiError(
      "INVALID_ORIGIN",
      403,
    );
  }
}
```

Mutation routes:

```text
POST
PATCH
```

must call this.

---

# 3.2 GET `/api/cart`

### `src/app/api/cart/route.ts`

Pseudo:

```ts
export async function GET(
  request: Request,
) {
  const locale =
    parseLocale(
      new URL(
        request.url,
      ).searchParams
        .get("locale"),
    );

  const cartId =
    await getCartId();

  if (!cartId) {
    return jsonNoStore({
      cart:
        createEmptyCartSnapshot(
          await getRequestCountry(),
        ),
    });
  }

  const result =
    await cartService.getCart({
      request,
      cartId,
      locale,
    });

  if (!result) {
    await clearCartId();

    return jsonNoStore({
      cart:
        createEmptyCartSnapshot(
          await getRequestCountry(),
        ),
    });
  }

  await setCartId(
    result.cartId,
  );

  return jsonNoStore({
    cart:
      result.snapshot,
  });
}
```

Response MUST NOT contain:

```text
cartId
```

---

# 3.3 POST `/api/cart/lines`

Request:

```ts
type AddLineRequest =
  | {
      kind: "caviar";

      merchandiseId: string;

      quantity: number;

      operationId: string;

      locale: "en" | "fr";
    }

  | {
      kind: "gift_set";

      merchandiseId: string;

      quantity: number;

      unitIds: string[];

      operationId: string;

      locale: "en" | "fr";
    };
```

No:

```text
title
image
price
currency
productId
inventory
```

---

# 3.4 First Add

Pseudo:

```ts
let cartId =
  await getCartId();

if (!cartId) {
  const result =
    await cartService
      .createCartWithLines({
        request,

        countryCode:
          await getRequestCountry(),

        locale,

        lines:
          buildInitialLines(
            payload,
          ),
      });

  await setCartId(
    result.cartId,
  );

  return response(
    result.snapshot,
  );
}
```

Do not:

```text
cartCreate
↓
cartLinesAdd
```

for first item.

---

# 3.5 PATCH `/api/cart/line`

Payload:

```ts
type UpdateLineRequest =
  | {
      action:
        "quantity";

      lineId:
        string;

      quantity:
        number;

      operationId:
        string;

      locale:
        AppLocale;
    }

  | {
      action:
        "gift_message";

      lineId:
        string;

      giftMessage:
        CartGiftMessage | null;

      operationId:
        string;

      locale:
        AppLocale;
    };
```

---

# 3.6 POST `/api/cart/remove`

Payload:

```ts
{
  lineId:
    string;

  operationId:
    string;

  locale:
    AppLocale;
}
```

---

# 3.7 Response contract

Success:

```ts
{
  operationId:
    string;

  cart:
    CartSnapshot;

  warnings:
    CartWarning[];
}
```

Error:

```ts
{
  error: {
    code:
      CartApiErrorCode;

    message:
      string;

    retryable:
      boolean;
  };

  operationId:
    string;
}
```

---

# 3.8 No-store helper

Every cart response:

```ts
headers: {
  "Cache-Control":
    "no-store",
}
```

---

# 3.9 API tests

Create:

```text
src/app/api/cart/
├── route.test.ts
├── lines/route.test.ts
├── line/route.test.ts
└── remove/route.test.ts
```

Cover:

```text
no cart cookie
→ empty

first add
→ cartCreate

existing cart
→ mutation

stale cart
→ clear cookie

invalid GID
→ 400

cross-origin
→ reject

userErrors
→ mapped error

warnings
→ success
```

---

# PR 4 — Replace Local CartProvider With Shopify-backed Provider

Đây là PR quan trọng nhất phía client.

---

# 4.1 Provider mount location

Current provider nằm ngoài `NextIntlClientProvider`. 

Vì vậy:

```ts
useLocale()
```

**không nên được thêm trực tiếp vào `CartProvider`.**

Instead modify:

### `src/app/[locale]/(main)/layout.tsx`

Current:

```tsx
<CartProvider>
```

Target:

```tsx
<CartProvider
  locale={locale}
>
```

---

# 4.2 Provider props

```ts
export interface
CartProviderProps {
  children:
    React.ReactNode;

  locale:
    AppLocale;

  initialOpen?:
    boolean;
}
```

Không cần server load cart trong layout.

Cart hydrate silent client-side.

---

# 4.3 New client API module

Create:

```text
src/shared/lib/cart/cart-api.ts
```

Functions:

```ts
export async function
fetchCart(
  locale,
): Promise<CartSnapshot>;

export async function
addLine(
  input,
): Promise<
  CartMutationResponse
>;

export async function
updateLine(...);

export async function
removeLine(...);

export async function
fetchCheckout(...);
```

This is the only client module biết `/api/cart/*`.

UI components không gọi fetch.

---

# 4.4 Provider state

Replace:

```ts
const [
  entries,
  setEntries,
] = useState(...)
```

with:

```ts
type CartProviderState = {
  confirmed:
    CartSnapshot;

  pending:
    PendingCartOperation[];

  status:
    | "hydrating"
    | "ready"
    | "error";
};
```

---

# 4.5 Pending operation model

Create:

```text
src/shared/lib/cart/
└── cart-operation.ts
```

```ts
export type
PendingCartOperation =
  | AddCaviarOperation
  | AddGiftOperation
  | SetQuantityOperation
  | RemoveOperation
  | GiftMessageOperation;
```

Base:

```ts
type BaseOperation = {
  id: string;

  createdAt: number;
};
```

Caviar:

```ts
type AddCaviarOperation = {
  type:
    "add_caviar";

  id:
    string;

  merchandiseId:
    string;

  quantity:
    number;

  optimistic:
    OptimisticProductData;
};
```

Gift:

```ts
type AddGiftOperation = {
  type:
    "add_gift";

  id:
    string;

  merchandiseId:
    string;

  productId:
    string;

  units:
    {
      unitId:
        string;
    }[];

  optimistic:
    OptimisticProductData;
};
```

---

# 4.6 Rendered state

Never mutate confirmed Shopify state directly for optimistic rendering.

```ts
const visibleCart =
  useMemo(
    () =>
      replayCartOperations(
        state.confirmed,
        state.pending,
      ),
    [
      state.confirmed,
      state.pending,
    ],
  );
```

Architecture:

```text
confirmed Shopify cart
       +
pending operations
       ↓
replay
       ↓
visible cart
```

---

# 4.7 Silent hydration

```ts
useEffect(() => {
  let cancelled = false;

  fetchCart(locale)
    .then((cart) => {
      if (cancelled) {
        return;
      }

      setState(
        (current) => ({
          ...current,

          confirmed:
            cart,

          status:
            "ready",
        }),
      );
    })
    .catch(() => {
      if (cancelled) {
        return;
      }

      setState(
        (current) => ({
          ...current,

          status:
            "error",
        }),
      );
    });

  return () => {
    cancelled = true;
  };
}, [locale]);
```

Do not:

```text
open drawer

show page loader

block children
```

---

# 4.8 Global mutation queue

Use ref:

```ts
const queueRef =
  useRef<
    Promise<void>
  >(
    Promise.resolve(),
  );
```

Helper:

```ts
function enqueue(
  task: () =>
    Promise<void>,
) {
  const next =
    queueRef.current
      .then(task, task);

  queueRef.current =
    next.catch(() => {});

  return next;
}
```

All cart mutations go through queue.

---

# 4.9 Add Caviar flow

Pseudo:

```ts
const addLine =
  useCallback(
    (input) => {
      const operationId =
        crypto.randomUUID();

      const operation =
        createAddCaviarOperation({
          operationId,
          input,
        });

      // Immediate.
      addPending(operation);

      // Preserve current UX.
      setOpen(true);

      void enqueue(
        async () => {
          try {
            const result =
              await cartApi
                .addLine({
                  kind:
                    "caviar",

                  merchandiseId:
                    input
                      .merchandiseId,

                  quantity:
                    input
                      .quantity,

                  operationId,

                  locale,
                });

            commitOperation({
              operationId,

              cart:
                result.cart,
            });
          } catch (error) {
            await reconcileAfterFailure(
              operationId,
            );
          }
        },
      );
    },
    [locale],
  );
```

Drawer opens before network.

---

# 4.10 Gift Set optimistic flow

Before optimistic insertion:

```ts
const unitIds =
  Array.from(
    {
      length:
        targetQuantity,
    },
    () =>
      crypto.randomUUID(),
  );
```

Pending op stores those unit IDs.

Server receives exact same IDs:

```ts
{
  kind:
    "gift_set",

  merchandiseId,

  quantity:
    unitIds.length,

  unitIds,

  operationId,

  locale,
}
```

This gives deterministic reconciliation.

---

# 4.11 Commit operation

```ts
function commitOperation({
  operationId,
  cart,
}) {
  setState(
    (current) => ({
      ...current,

      confirmed:
        cart,

      pending:
        current.pending
          .filter(
            (op) =>
              op.id !==
              operationId,
          ),
    }),
  );
}
```

Pending operations created after this operation remain.

`visibleCart` automatically replays them over new confirmed state.

---

# 4.12 Failure reconciliation

Do not simply rollback to previous local state.

Pseudo:

```ts
async function
reconcileAfterFailure(
  operationId,
) {
  try {
    const cart =
      await fetchCart(
        locale,
      );

    setState(
      (current) => ({
        ...current,

        confirmed:
          cart,

        pending:
          current.pending
            .filter(
              (op) =>
                op.id !==
                operationId,
            ),
      }),
    );
  } catch {
    removePending(
      operationId,
    );
  }
}
```

---

# 4.13 Remove

Optimistic:

```text
click Remove
↓
line disappears immediately
↓
API
↓
Shopify cart confirms
```

Operation:

```ts
{
  type:
    "remove",

  id:
    operationId,

  lineId,
}
```

---

# 4.14 Quantity

```ts
setLineQuantity(
  lineId,
  target,
)
```

Optimistic op:

```ts
{
  type:
    "set_quantity",

  lineId,

  quantity:
    target,
}
```

Server receives **absolute target**, not delta.

Good:

```text
2 → target 5
```

Bad:

```text
+1
+1
+1
```

as three authoritative deltas.

---

# 4.15 Existing child callbacks

Files likely requiring type-only/minimal modification:

```text
cart-line-item.tsx
cart-group-card.tsx
cart-quantity-stepper.tsx
cart-message-dialog.tsx
```

Keep existing callback interface where possible.

No redesign.

---

# 4.16 Drawer total

Modify:

### `cart-drawer.tsx`

Current:

```ts
currencyCode
totalPrice
```

Target:

```ts
subtotal
```

Provider exposes:

```ts
subtotal:
  CartMoney;
```

Drawer:

```tsx
{formatBrandPrice(
  Number(
    subtotal.amount,
  ),

  subtotal.currencyCode,

  locale,
)}
```

No line reduce.

---

# PR 5 — Product Add-to-Cart → Shopify

PR4 gives infrastructure.

PR5 removes transitional client authority.

---

# 5.1 Caviar

### `product-detail-caviar-panel.tsx`

Final call remains:

```ts
cart.addLine({
  merchandiseId:
    activeVariant.id,

  productId:
    product.id,

  quantity,

  optimistic: {
    ...
  },
});
```

But provider's API network request only sends:

```json
{
  "kind": "caviar",
  "merchandiseId": "...",
  "quantity": 2,
  "operationId": "...",
  "locale": "en"
}
```

---

# 5.2 Gift Set

Final client request:

```json
{
  "kind": "gift_set",
  "merchandiseId": "...",
  "quantity": 3,
  "unitIds": [
    "...",
    "...",
    "..."
  ],
  "operationId": "...",
  "locale": "en"
}
```

Server creates:

```text
3 Shopify CartLines

each quantity=1
```

---

# 5.3 Inventory

Client optimistic max calculation:

```ts
existingVariantCount =
  countGiftUnitsByVariant(
    visibleCart.entries,
    merchandiseId,
  );
```

Server/Shopify remains authoritative.

If browser believes 5 available but Shopify says only 3:

```text
Shopify cart result wins
```

---

# PR 6 — Gift Message Persistence

## Files

Modify:

```text
src/shared/components/cart/
├── cart-provider.tsx
├── cart-message-dialog.tsx
└── cart-drawer.tsx
```

Server:

```text
src/shared/lib/shopify/cart/
├── cart.service.ts
├── cart.mapper.ts
└── cart.validation.ts
```

Route:

```text
src/app/api/cart/line/route.ts
```

---

# 6.1 Preserve current modal UX

Current drawer intentionally disappears while `messageLine !== null`, then comes back when modal closes. 

Do not change that.

---

# 6.2 Save optimistic

Current:

```ts
setGiftMessage(
  lineId,
  giftMessage,
);

setMessageLine(null);
```

Keep same visible order.

Provider then queues server mutation.

---

# 6.3 Attribute merge

Server must first know existing attributes.

Pseudo:

```ts
const current =
  await findCartLine(
    cart,
    lineId,
  );

const attributes =
  mergeAttributes(
    current.attributes,
    giftMessage
      ? {
          _mr_gift_message_kind:
            giftMessage.kind,

          _mr_gift_message:
            giftMessage.kind ===
            "personal"
              ? giftMessage.text
              : "",
        }
      : {
          _mr_gift_message_kind:
            undefined,

          _mr_gift_message:
            undefined,
        },
  );
```

Must preserve:

```text
_mr_kind
_mr_unit_id
```

---

# 6.4 Blank card

Existing domain has:

```ts
{ kind: "blank" }
```

so map:

```text
_mr_gift_message_kind=blank
```

No need store arbitrary empty message text.

---

# 6.5 Personal message

```text
_mr_gift_message_kind=personal
_mr_gift_message=<text>
```

---

# 6.6 Validation

Reuse existing message max-length constant from current dialog.

Do not define two independent limits.

If constant currently lives inside component, move to:

```text
src/shared/constants/cart.constant.ts
```

Example:

```ts
export const
GIFT_MESSAGE_MAX_LENGTH =
  ...;
```

Client and server import same constant.

---

# 6.7 Critical tests

```text
A → message A
B → message B
C → message C

remove B

expected:

A → A
C → C
```

Never use array index as identity.

---

# PR 7 — Shopify Markets & Region Synchronization

Đây là prerequisite trước production.

---

# 7.1 Current problem

Current market config:

```ts
en → FR / EN
fr → FR / FR
```



Current region selector stores:

```text
countryCode
locale
```

only in browser `localStorage`. 

Shopify server therefore không biết US selection.

---

# 7.2 Add server region module

Create:

```text
src/shared/lib/region/
├── region-cookie.ts
└── region.server.ts
```

### `region-cookie.ts`

```ts
export const
REGION_COOKIE =
  "mr_country";

export async function
getRequestCountry():
  Promise<ShippingCountryCode>;

export async function
setRequestCountry(
  country:
    ShippingCountryCode,
): Promise<void>;
```

Default:

```text
FR
```

Cookie:

```ts
httpOnly:
  true

secure:
  production

sameSite:
  "lax"

path:
  "/"
```

---

# 7.3 `/api/region`

Implement:

```text
POST /api/region
```

Payload:

```ts
{
  countryCode:
    "FR" | "US";

  locale:
    "en" | "fr";
}
```

Pseudo:

```ts
const previous =
  await getRequestCountry();

await setRequestCountry(
  countryCode,
);

const cartId =
  await getCartId();

let cart:
  CartSnapshot | undefined;

if (cartId) {
  cart =
    await cartService
      .updateBuyerIdentity({
        request,

        cartId,

        countryCode,

        locale,
      });
}

return {
  changed:
    previous !==
      countryCode,

  countryCode,

  cart,
};
```

---

# 7.4 Modify region dialog

### `region-preference-dialog.tsx`

Current:

```ts
writeRegionPreference(...)
setOpen(false)
router.replace(...)
```



Target:

```ts
const handleConfirm =
  async () => {
    const response =
      await updateServerRegion({
        countryCode,
        locale,
      });

    writeRegionPreference({
      countryCode,
      locale,
    });

    setOpen(false);

    if (
      locale !==
      activeLocale
    ) {
      router.replace(
        nextHref,
        { locale },
      );

      return;
    }

    if (response.changed) {
      router.refresh();
    }
  };
```

Server country should update before navigation.

---

# 7.5 Existing localStorage users

Important migration case:

```text
old user localStorage:
country=US

new deployment:
mr_country cookie absent
```

`RegionPreferenceGate` should silently synchronize.

Pseudo:

```ts
useEffect(() => {
  if (!preference) {
    return;
  }

  void syncServerRegion(
    preference,
  ).then(
    ({ changed }) => {
      if (changed) {
        router.refresh();
      }
    },
  );
}, [preference]);
```

API tells client:

```ts
changed: boolean
```

so no infinite refresh.

---

# 7.6 Catalog market signature

Current catalog:

```ts
getProductDetail(
  locale,
  handle,
)
```

and:

```ts
getCatalogStorefrontClient(
  locale,
)
```



Target:

```ts
getProductDetail(
  locale,
  country,
  handle,
);

getCollectionProducts(
  locale,
  country,
  handle,
  productCount,
);

getCatalogStorefrontClient(
  locale,
  country,
);
```

---

# 7.7 Refactor config

### `src/shared/lib/shopify/config.ts`

Remove country from language-only mapping.

Target:

```ts
export function
getShopifyLanguage(
  locale: string,
):
  "EN" | "FR" {
  return locale ===
    "fr"
    ? "FR"
    : "EN";
}
```

Market:

```ts
export function
getShopifyMarket({
  locale,
  country,
}: {
  locale: string;
  country:
    ShippingCountryCode;
}) {
  return {
    language:
      getShopifyLanguage(
        locale,
      ),

    country,
  };
}
```

---

# 7.8 Catalog cache key

### `storefront.ts`

Current cache:

```ts
`${market.country}:${market.language}`
```

already conceptually correct, but country is currently derived only from locale. 

Target:

```ts
export function
getCatalogStorefrontClient(
  locale: string,
  country:
    ShippingCountryCode,
) {
  const market =
    getShopifyMarket({
      locale,
      country,
    });

  const cacheKey =
    `${market.country}:${market.language}`;

  ...
}
```

Still no:

```ts
cookies()
```

inside this function.

---

# 7.9 Catalog service

Example:

```ts
export async function
getProductDetail(
  locale,
  country,
  handle,
) {
  "use cache";

  cacheLife(
    "minutes",
  );

  cacheTag(
    "shopify-products",

    `shopify-product-${handle}`,

    `shopify-market-${country}-${locale}`,
  );

  const market =
    getShopifyMarket({
      locale,
      country,
    });

  return getCatalogStorefrontClient(
    locale,
    country,
  ).query(...);
}
```

Country becomes a cache parameter naturally.

---

# 7.10 Product detail route

Current product route calls:

```ts
getProductDetail(
  locale,
  handle,
)
```



Refactor request boundary:

```ts
const country =
  await getRequestCountry();

const product =
  await getProductDetail(
    locale,
    country,
    handle,
  );
```

Do the same for every request-time catalog caller.

---

# 7.11 `generateStaticParams`

Do not make static param generation country-dependent.

Use default build market:

```ts
getCollectionProducts(
  "en",
  "FR",
  category,
);
```

Static params describe routes, not shopper market.

---

# 7.12 Market invariant

Tests must prove:

```text
mr_country = FR

PDP
EUR
   ↓
CartBuyerIdentity FR
   ↓
Cart EUR
   ↓
Checkout FR context
```

and equivalent for US.

---

# PR 8 — Shopify Checkout

## Files

Modify:

```text
src/shared/components/cart/
├── cart-provider.tsx
└── cart-drawer.tsx
```

Implement:

```text
src/app/api/cart/
└── checkout/
    ├── route.ts
    └── route.test.ts
```

---

# 8.1 Provider public API

Add:

```ts
checkout:
  () => Promise<void>;

checkoutPending:
  boolean;
```

---

# 8.2 Flush mutation queue

Critical:

```ts
async function checkout() {
  if (
    checkoutPendingRef
      .current
  ) {
    return;
  }

  checkoutPendingRef
    .current = true;

  setCheckoutPending(
    true,
  );

  try {
    await queueRef.current;

    const {
      checkoutUrl,
    } =
      await fetchCheckout({
        locale,
      });

    window.location.assign(
      checkoutUrl,
    );
  } finally {
    checkoutPendingRef
      .current = false;

    setCheckoutPending(
      false,
    );
  }
}
```

User must checkout the cart they currently see.

---

# 8.3 Checkout route

```ts
export async function POST(
  request: Request,
) {
  assertSameOrigin(
    request,
  );

  const {
    locale,
  } =
    await request.json();

  const cartId =
    await getCartId();

  if (!cartId) {
    return cartError(
      "CART_EMPTY",
      409,
    );
  }

  const countryCode =
    await getRequestCountry();

  let cart =
    await cartService
      .getCart(...);

  if (!cart) {
    await clearCartId();

    return cartError(
      "CART_EMPTY",
      409,
    );
  }

  if (
    cart.buyerIdentity
      .countryCode !==
      countryCode
  ) {
    cart =
      await cartService
        .updateBuyerIdentity({
          ...
        });
  }

  if (
    cart.totalQuantity <
      1
  ) {
    return cartError(
      "CART_EMPTY",
      409,
    );
  }

  const latest =
    await cartService
      .getCart({
        cartId,
        locale,
        ...
      });

  return {
    checkoutUrl:
      latest.checkoutUrl,
  };
}
```

Current locale is always supplied at checkout time.

---

# 8.4 Drawer

Current checkout button:

```tsx
<Button>
  {t("checkout")}
</Button>
```



Target:

```tsx
<Button
  type="button"

  onClick={() => {
    void checkout();
  }}

  disabled={
    checkoutPending
  }

  className="..."
>
  {t("checkout")}
</Button>
```

Do not change visual label on happy path.

---

# PR 9 — Failure Reconciliation, Observability & E2E

---

# 9.1 Ambiguous mutation

Case:

```text
Shopify accepts Add
↓
connection dies
↓
client receives error
```

Do not automatically resend.

---

# 9.2 Gift reconciliation

Operation has:

```ts
unitIds:
[
  "A",
  "B",
  "C",
]
```

After unknown result:

```text
GET /api/cart
```

If cart contains:

```text
_mr_unit_id=A
_mr_unit_id=B
_mr_unit_id=C
```

operation succeeded.

Remove pending op.

Do not re-add.

---

# 9.3 Caviar reconciliation

Before:

```text
confirmed qty = 2
```

Intent:

```text
target qty = 3
```

Unknown mutation result:

```text
GET cart
```

If Shopify:

```text
qty = 3
```

mark success.

If:

```text
qty = 2
```

remove optimistic operation and report failure.

Do not blindly resend.

---

# 9.4 Shopify warning handling

Mutation:

```text
warnings != []
userErrors == []
```

means successful commerce mutation.

Provider:

```ts
setConfirmed(
  result.cart,
);

removePending(
  operationId,
);
```

Optional warning feedback based on code.

Do not rollback.

---

# 9.5 User errors

```text
userErrors != []
```

Flow:

```text
remove pending operation
↓
GET authoritative cart
↓
render Shopify state
↓
show existing/minimal error UX
```

---

# 9.6 Add cart status

Provider may expose:

```ts
lastError:
  CartClientError | null
```

Do not put error box permanently in drawer.

If repo doesn't have toast infrastructure, add:

```tsx
<div
  aria-live="polite"
  className="sr-only"
>
  {errorMessage}
</div>
```

---

# 9.7 Logging

Create:

```text
src/shared/lib/shopify/cart/
└── cart.logger.ts
```

Allowed:

```ts
{
  requestId,
  operationId,
  action:
    "cart.lines.add",

  kind:
    "gift_set",

  quantity:
    3,

  country:
    "FR",

  locale:
    "fr",

  durationMs:
    273,

  warnings:
    [
      "..."
    ],
}
```

Never:

```text
mr_cart full value

?key=<cart secret>

PRIVATE_STOREFRONT_API_TOKEN

gift-message text
```

---

# 9.8 Gift message logging

Allowed:

```ts
{
  hasGiftMessage:
    true,

  messageLength:
    57,
}
```

Not:

```ts
{
  giftMessage:
    "Happy birthday..."
}
```

---

# 9.9 Security test

Inspect browser:

```text
Network
Local Storage
Session Storage
DOM
console
```

Must not contain:

```text
gid://shopify/Cart/...?...key=...

PRIVATE_STOREFRONT_API_TOKEN
```

Current server config already keeps private Storefront token behind `server-only`; reuse this boundary. 

---

# 10. Final file map

After all PRs:

```text
src/
├── app/
│   ├── [locale]/
│   │   └── (main)/
│   │       ├── layout.tsx
│   │       └── products/
│   │           └── [category]/
│   │               └── [handle]/
│   │                   └── page.tsx
│   │
│   └── api/
│       ├── cart/
│       │   ├── route.ts
│       │   ├── route.test.ts
│       │   │
│       │   ├── lines/
│       │   │   ├── route.ts
│       │   │   └── route.test.ts
│       │   │
│       │   ├── line/
│       │   │   ├── route.ts
│       │   │   └── route.test.ts
│       │   │
│       │   ├── remove/
│       │   │   ├── route.ts
│       │   │   └── route.test.ts
│       │   │
│       │   └── checkout/
│       │       ├── route.ts
│       │       └── route.test.ts
│       │
│       └── region/
│           ├── route.ts
│           └── route.test.ts
│
├── screens/
│   └── product-detail/
│       └── components/
│           ├── product-detail-caviar-panel.tsx
│           └── product-detail-gift-set-panel.tsx
│
└── shared/
    ├── components/
    │   ├── cart/
    │   │   ├── cart-provider.tsx
    │   │   ├── cart-provider.test.tsx
    │   │   ├── cart-drawer.tsx
    │   │   ├── cart-drawer.test.tsx
    │   │   ├── cart-empty.tsx
    │   │   ├── cart-group-card.tsx
    │   │   ├── cart-line-item.tsx
    │   │   ├── cart-message-dialog.tsx
    │   │   ├── cart-quantity-stepper.tsx
    │   │   ├── cart-trigger.tsx
    │   │   └── index.ts
    │   │
    │   └── layout/
    │       ├── region-preference-dialog.tsx
    │       └── region-preference-gate.tsx
    │
    ├── constants/
    │   └── cart.constant.ts
    │
    ├── lib/
    │   ├── cart/
    │   │   ├── cart-api.ts
    │   │   ├── cart-entry.ts
    │   │   ├── cart-operation.ts
    │   │   └── cart-optimistic.ts
    │   │
    │   ├── http/
    │   │   ├── api-response.ts
    │   │   └── same-origin.ts
    │   │
    │   ├── request/
    │   │   └── buyer-ip.ts
    │   │
    │   ├── region/
    │   │   ├── region-cookie.ts
    │   │   └── region.server.ts
    │   │
    │   ├── region-preference.ts
    │   │
    │   └── shopify/
    │       ├── config.ts
    │       ├── storefront.ts
    │       ├── storefront-config.ts
    │       │
    │       ├── catalog/
    │       │   └── ...
    │       │
    │       └── cart/
    │           ├── cart.client.ts
    │           ├── cart.cookie.ts
    │           ├── cart.fragment.ts
    │           ├── cart.query.ts
    │           ├── cart.mutation.ts
    │           ├── cart.mapper.ts
    │           ├── cart.service.ts
    │           ├── cart.validation.ts
    │           ├── cart.error.ts
    │           ├── cart.type.ts
    │           ├── cart.mapper.test.ts
    │           ├── cart.service.test.ts
    │           └── index.ts
    │
    └── types/
        ├── cart.type.ts
        └── region.type.ts
```

---

# 11. PR review checklist

## PR 1

```text
[ ] CartLine.id != merchandiseId conceptually
[ ] productId exists
[ ] merchandiseId exists
[ ] Gift unitId exists
[ ] Caviar merge by merchandiseId
[ ] Gift inventory count by merchandiseId
[ ] Existing cart UI unchanged
```

## PR 2

```text
[ ] Cart service server-only
[ ] Cart client request-scoped
[ ] Catalog client untouched
[ ] Buyer IP forwarding
[ ] Cart fragment
[ ] All mutations
[ ] userErrors
[ ] warnings
[ ] pagination
[ ] mapper tests
```

## PR 3

```text
[ ] GET cart
[ ] Add
[ ] Update
[ ] Remove
[ ] HttpOnly mr_cart
[ ] Cart ID never returned
[ ] no-store
[ ] Origin validation
[ ] Input validation
```

## PR 4

```text
[ ] Silent hydration
[ ] confirmed + pending architecture
[ ] Mutation queue
[ ] Add optimistic
[ ] Remove optimistic
[ ] Quantity optimistic
[ ] Drawer opens immediately
[ ] No happy-path spinner
```

## PR 5

```text
[ ] Caviar Shopify-backed
[ ] Gift Set Shopify-backed
[ ] Gift N = N physical lines
[ ] Gift unitId stable
[ ] No browser-authoritative pricing
```

## PR 6

```text
[ ] Gift messages persisted
[ ] Technical attrs preserved
[ ] Remove middle unit identity test
[ ] Gift message never logged
```

## PR 7

```text
[ ] mr_country
[ ] /api/region
[ ] Existing localStorage migration
[ ] CartBuyerIdentity country
[ ] Catalog country argument
[ ] FR consistency
[ ] US consistency
```

## PR 8

```text
[ ] Flush queue before checkout
[ ] Current locale
[ ] Current country
[ ] Fresh checkoutUrl
[ ] Empty cart guard
[ ] Double-click guard
```

## PR 9

```text
[ ] Ambiguous mutation reconciliation
[ ] Shopify warnings
[ ] Shopify userErrors
[ ] Security verification
[ ] E2E
[ ] Admin order verification
```

---

# 12. Agent implementation rule

Khi giao task cho coding agent, thêm rule:

```text
Do not redesign the cart.

Do not replace current Cart components
with Hydrogen UI components.

Do not expose Shopify Cart ID to the client.

Do not move request APIs into the
cached catalog Storefront client.

Do not trust price, currency, inventory,
product title, image or total from the
browser.

Preserve current Add-to-Cart behavior:
the drawer opens immediately.

Gift Set invariant:
one physical gift unit equals
one Shopify CartLine with quantity=1.

Use ProductVariant GID as merchandiseId.

Use Shopify Product GID for
gift presentation grouping.

Use Shopify CartLine GID as
canonical line.id after reconciliation.

All cart mutations must pass through
one serialized client mutation queue.

Never blindly retry an ambiguous
commerce mutation.
```

---

# 13. PR sizing recommendation

Để review dễ:

| PR | Scope | Risk |
|---|---|---|
| PR 1 | Domain / identity | Medium |
| PR 2 | Shopify server core | High |
| PR 3 | HTTP API | Medium |
| PR 4 | CartProvider | High |
| PR 5 | PDP integration | Medium |
| PR 6 | Gift messages | Medium |
| PR 7 | Markets | High |
| PR 8 | Checkout | Medium |
| PR 9 | Hardening / E2E | Medium |

Không nên merge:

```text
PR2 + PR3 + PR4 + PR7
```

thành một giant PR.

Ba khu vực có risk lớn nhất:

```text
Cart identity
Mutation concurrency
Market context
```

nên được review riêng.

---

# 14. Critical implementation order inside PR4

Nếu agent bắt đầu `cart-provider.tsx`, thứ tự nên là:

```text
1. Introduce CartSnapshot

2. Add confirmed state

3. Add hydration

4. Add pending operation representation

5. Implement replayCartOperations()

6. Add mutation queue

7. Migrate Add Caviar

8. Migrate Add Gift

9. Migrate Remove

10. Migrate Quantity

11. Migrate Gift Message

12. Replace total with Shopify subtotal

13. Add reconciliation

14. Remove old local-only paths
```

Không rewrite toàn bộ provider trong một bước.

---

# 15. Critical acceptance flow trước production

Cuối cùng phải chạy đúng sequence này:

```text
Open /en
    ↓
select France
    ↓
open Caviar
    ↓
add 30g x2
    ↓
drawer opens immediately
    ↓
add same variant x1
    ↓
one row qty 3
    ↓
refresh
    ↓
qty still 3
    ↓
add Gift Set 30g x3
    ↓
three physical gift rows
    ↓
message A / B / C
    ↓
remove middle B
    ↓
A and C remain correctly attached
    ↓
refresh
    ↓
same state
    ↓
change country US
    ↓
cart preserved
    ↓
Shopify reprices
    ↓
PDP + Cart use same market
    ↓
switch language /fr
    ↓
cart preserved
    ↓
Checkout
    ↓
queue flush
    ↓
fresh checkout URL
    ↓
Shopify checkout
    ↓
correct country
correct currency
correct locale
correct merchandise
correct quantities
correct gift metadata
```

Nếu flow trên pass thì architecture đã đạt mục tiêu chính:

```text
Storefront UI state
        =
Shopify Cart state
        =
Shopify Checkout state
```