# Maison Rocheval — Shopify Cart & Checkout Implementation Specification

**Version:** 1.0  
**Status:** Ready for implementation  
**Repo:** `feat/cart-v2` 
**Storefront API baseline:** `2026-04`  
**Primary constraint:** Giữ nguyên 100% UX và business rules của cart hiện tại trên happy path.

---

# 1. Mục tiêu

Triển khai Shopify-backed Cart và Shopify Checkout cho storefront Maison Rocheval hiện tại mà không redesign hoặc thay đổi interaction model hiện có.

Sau implementation:

```text
Current Cart UI
      │
      │ unchanged UX
      ▼
CartProvider
      │
      │ optimistic state
      ▼
Next.js Cart API
      │
      │ server only
      ▼
Shopify Storefront Cart API
      │
      ▼
Shopify Cart
      │
      ▼
checkoutUrl
      │
      ▼
Shopify Hosted Checkout
```

Shopify phải trở thành **commerce source of truth** cho:

- Cart persistence
- Cart lines
- Quantity
- Inventory reconciliation
- Contextual pricing
- Currency
- Buyer country
- Gift-message metadata
- Checkout URL

React `CartProvider` vẫn chịu trách nhiệm cho:

- Drawer state
- Optimistic interaction
- Gift-message modal state
- Immediate quantity feedback
- Pending operation management
- Mapping Shopify cart thành UI model hiện tại

Shopify xác định cart pricing thông qua `CartBuyerIdentity`, trong khi product queries dùng `@inContext`; Cart ID chứa secret key và Shopify yêu cầu không expose secret đó ra client.

---

# 2. Nguyên tắc bắt buộc

Trong spec này:

- **MUST** = bắt buộc.
- **MUST NOT** = không được thực hiện.
- **SHOULD** = rất nên thực hiện, chỉ bỏ khi có lý do kỹ thuật rõ ràng.
- **MAY** = optional.

Implementation MUST tuân thủ:

```text
UX hiện tại
    >
clean architecture preference
    >
REST purity
```

Nếu một architecture đẹp hơn nhưng làm thay đổi UX hiện tại, không chọn architecture đó.

---

# 3. UX invariants — tuyệt đối không thay đổi

Các behavior sau là contract.

## 3.1 Caviar

Một ProductVariant chỉ có một row tương ứng trong cart.

Ví dụ:

```text
Amour 30g x 2
+
Amour 30g x 1

↓

Amour 30g x 3
```

MUST:

- Add cùng variant → tăng quantity.
- Không tạo duplicate row.
- Variant khác → row khác.
- Quantity control giữ nguyên `- / +`.
- Không vượt `quantityAvailable`.
- Stock tooltip/disabled behavior giữ nguyên.
- Remove giữ nguyên behavior hiện tại.

---

# 4. Gift Set

Gift set có model khác Caviar.

Ví dụ quantity = 3:

```text
L'Initiation (3)

├── Unit #1
│   └── Gift message riêng
│
├── Unit #2
│   └── Gift message riêng
│
└── Unit #3
    └── Gift message riêng
```

MUST:

- Một physical gift box = một Shopify CartLine.
- `quantity = 1` trên mỗi line.
- Không có quantity stepper cho từng gift unit.
- Mỗi unit có gift message riêng.
- Remove từng gift unit độc lập.
- Remove unit cuối → presentation group biến mất.
- Add thêm cùng gift set → append units vào group hiện tại.
- Group trong UI theo Shopify `Product.id`.

MUST NOT biến:

```text
3 gift boxes
```

thành:

```text
1 Shopify line
quantity = 3
```

vì sẽ phá business rule:

```text
1 physical gift box
=
1 independent gift message
```

Shopify Cart API hỗ trợ custom attributes trên CartLine, phù hợp để gắn metadata riêng theo line.

---

# 5. Drawer interaction invariants

MUST giữ:

```text
Add to Cart
    ↓
drawer mở ngay
```

Không được đổi thành:

```text
Add to Cart
    ↓
wait Shopify
    ↓
loading
    ↓
drawer
```

Gift-message dialog:

```text
Cart Drawer
    ↓
Open gift message
    ↓
Drawer hidden
Gift Message Dialog visible
    ↓
Close/save
    ↓
Drawer restored
```

Behavior hiện tại giữ nguyên.

Không thêm intermediary page.

---

# 6. Header cart count

Cart count MUST tiếp tục biểu diễn số physical merchandise units.

Ví dụ:

```text
Caviar x 3

Gift Set:
 unit A
 unit B

Cart Count = 5
```

Target:

```ts
itemCount = Shopify Cart.totalQuantity
```

hoặc normalized equivalent nếu cần đảm bảo business semantics.

---

# 7. Total

Drawer hiện tại chỉ cần merchandise total.

Không thêm:

- shipping estimate
- duty
- tax breakdown
- checkout summary
- discount form

Target source:

```graphql
cart.cost.subtotalAmount
```

MUST NOT tiếp tục coi:

```ts
unitPrice * quantity
```

là authoritative total.

Shopify `CartCost` sử dụng buyer identity để contextualize estimated cart pricing.

---

# 8. Scope

## Included

- Shopify Cart creation
- Cart persistence
- Cart restore after refresh
- Caviar add/update/remove
- Gift set add/remove
- Gift messages
- Inventory reconciliation
- Market/country synchronization
- Currency synchronization
- Locale synchronization
- Shopify checkout redirect
- Optimistic UI
- Mutation concurrency
- Error handling
- Cart recovery
- Tests
- Logging/observability
- Security

## Explicitly out of scope

Không triển khai trong phase này:

- Custom Shopify Checkout UI
- Checkout Extensibility customization
- Shopify Bundle API
- Customer Account integration
- Customer cart merging
- Discount-code UI
- Gift-card UI
- Shipping estimator
- Tax estimator
- Cart analytics redesign
- Upsell/cross-sell
- Cart redesign
- Storefront API upgrade khỏi `2026-04`
- New cart page nếu hiện tại không có
- New visual loading states trên happy path

---

# 9. Architecture

Target architecture:

```text
┌───────────────────────────────────────────────┐
│ Browser                                       │
│                                               │
│ PDP                                           │
│ CartDrawer                                    │
│ CartLineItem                                  │
│ CartGroupCard                                 │
│ CartMessageDialog                             │
│ CartQuantityStepper                           │
│                                               │
│               CartProvider                    │
│                    │                          │
│                    │ fetch                    │
└────────────────────┼──────────────────────────┘
                     │
                     ▼
┌───────────────────────────────────────────────┐
│ Next.js                                       │
│                                               │
│ /api/cart                                     │
│ /api/cart/lines                               │
│ /api/cart/line                                │
│ /api/cart/remove                              │
│ /api/cart/checkout                            │
│ /api/region                                   │
│                     │                         │
│                     ▼                         │
│              CartService                      │
│                     │                         │
│                     ▼                         │
│      request-scoped Storefront client         │
└─────────────────────┬─────────────────────────┘
                      │
                      ▼
             Shopify Storefront API
                      │
                      ▼
                 Shopify Cart
                      │
                      ▼
                checkoutUrl
```

---

# 10. Catalog client và Cart client phải tách biệt

Repo hiện có cached catalog Storefront client.

MUST giữ nguyên separation:

```text
Catalog Storefront Client
├── product
├── collection
├── metafields
└── cacheable

Cart Storefront Client
├── request scoped
├── cookie aware
├── buyer IP aware
├── cart mutations
└── no-store
```

MUST NOT biến catalog client thành:

```text
cookies()
headers()
buyer-specific session
```

chỉ để hỗ trợ cart.

Target:

```ts
getCatalogStorefrontClient()
```

và:

```ts
createCartStorefrontClient(request)
```

là hai concerns độc lập.

Private Storefront access token MUST chỉ tồn tại server-side. Shopify yêu cầu server-side Storefront requests phát sinh từ buyer traffic gửi `Shopify-Storefront-Buyer-IP`; thiếu header này có thể ảnh hưởng throttling, bot protection và authenticated checkout flows.

---

# 11. Cart ID security

Shopify cart ID có thể có dạng:

```text
gid://shopify/Cart/xxxxx?key=<secret>
```

Phần `key` phải được coi như password. Shopify yêu cầu full ID cho mutations nhưng đồng thời yêu cầu không expose secret ra client.

Cart ID:

```text
MUST NOT:
- localStorage
- sessionStorage
- React state
- response JSON
- query string
- browser console
- analytics
- logs

MUST:
- server cookie
- HttpOnly
- Secure production
- SameSite=Lax
- Path=/
```

Cookie:

```text
mr_cart
```

Recommended:

```ts
{
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
}
```

Cookie value MUST be safely encoded.

---

# 12. Region cookie

Thêm server-readable cookie:

```text
mr_country
```

Allowed:

```ts
type SupportedCountry = "FR" | "US";
```

Region UI hiện tại vẫn giữ client preference hiện tại.

Server cookie là source phục vụ:

- Catalog market context
- CartBuyerIdentity
- Checkout

Recommended:

```ts
{
  httpOnly: true,
  secure: production,
  sameSite: "lax",
  path: "/",
}
```

Client không cần đọc cookie này trực tiếp.

---

# 13. Source of truth

Phân chia source of truth:

```text
Shopify
├── line identity
├── merchandise identity
├── quantity
├── availability
├── price
├── subtotal
├── currency
├── buyer country
└── checkoutUrl

Application
├── drawer open/close
├── modal open/close
├── optimistic operations
├── presentation grouping
└── temporary pending state
```

Client MUST NOT gửi authoritative:

- price
- currency
- total
- inventory
- product title
- image URL

để server tin tưởng.

Client chỉ gửi **intent**.

---

# 14. Domain model

Refactor `CartLine`.

Current conceptual issue:

```ts
line.id = variantId
```

ở Caviar nhưng:

```ts
line.id = randomUUID()
```

ở Gift Set.

Sau implementation phải tách hai identity.

Target:

```ts
type Money = {
  amount: string;
  currencyCode: string;
};

type CartGiftMessage = {
  kind: string;
  text: string;
};

type CartLineKind = "caviar" | "gift_set";

type CartLine = {
  /**
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

  quantity: number;

  quantityAvailable: number | null;

  title: string;
  variantTitle: string;

  image: {
    url: string;
    altText: string | null;
    width: number | null;
    height: number | null;
  } | null;

  unitPrice: Money;
  subtotal: Money;

  quantityEditable: boolean;
  supportsGiftMessage: boolean;

  giftMessage: CartGiftMessage | null;

  /**
   * Gift set only.
   */
  unitId: string | null;
};
```

Money amount SHOULD giữ ở dạng string từ Shopify.

MUST NOT dùng JS floating-point làm authoritative money state.

---

# 15. Presentation model

Có thể giữ abstraction `CartEntry` hiện tại.

Recommended:

```ts
type CartEntry =
  | {
      type: "line";
      line: CartLine;
    }
  | {
      type: "group";
      productId: string;
      title: string;
      lines: CartLine[];
    };
```

Mapper:

```text
Shopify Cart
    ↓
CartMapper
    ↓
CartLine[]
    ↓
presentation grouping
    ↓
CartEntry[]
```

Gift set group key:

```ts
line.productId
```

MUST dùng Shopify-returned `Product.id`.

Không dùng random group ID làm canonical grouping identity.

---

# 16. Cart Snapshot DTO

Browser không cần Shopify cart ID.

Response:

```ts
type CartSnapshot = {
  entries: CartEntry[];

  itemCount: number;

  subtotal: Money;

  countryCode: SupportedCountry;

  warnings: CartWarningDTO[];
};
```

Example:

```json
{
  "entries": [],
  "itemCount": 0,
  "subtotal": {
    "amount": "0.00",
    "currencyCode": "EUR"
  },
  "countryCode": "FR",
  "warnings": []
}
```

No:

```json
{
  "cartId": "gid://shopify/Cart/...?...secret..."
}
```

---

# 17. Gift Set line metadata

Mỗi gift set unit MUST có stable unique identity.

Attributes:

```text
_mr_kind = gift_set
_mr_unit_id = <uuid>
```

Gift message:

```text
_mr_gift_message_kind = <kind>
_mr_gift_message = <message>
```

Example:

```graphql
{
  merchandiseId: "gid://shopify/ProductVariant/123"
  quantity: 1
  attributes: [
    {
      key: "_mr_kind"
      value: "gift_set"
    }
    {
      key: "_mr_unit_id"
      value: "120ed61f..."
    }
    {
      key: "_mr_gift_message_kind"
      value: "personal"
    }
    {
      key: "_mr_gift_message"
      value: "Happy birthday!"
    }
  ]
}
```

`_mr_unit_id` MUST unique cho từng physical unit.

---

# 18. Không cần `_mr_group_id`

Presentation grouping SHOULD derive từ:

```graphql
merchandise.product.id
```

thay vì lưu duplicate metadata:

```text
_mr_group_id
```

Do đó:

```text
Shopify Product ID
=
canonical gift group ID
```

Lợi ích:

- Không trust group ID từ browser.
- Không duplicated metadata.
- Không bị stale.
- Mapping đơn giản hơn.

---

# 19. Caviar metadata

Caviar SHOULD có:

```text
_mr_kind = caviar
```

Attributes giúp mapper phân biệt behavior mà không phụ thuộc hoàn toàn vào title/product naming.

Example:

```graphql
{
  merchandiseId: "gid://shopify/ProductVariant/123"
  quantity: 2
  attributes: [
    {
      key: "_mr_kind"
      value: "caviar"
    }
  ]
}
```

---

# 20. Gift attributes visibility gate

Không được assume rằng prefix `_` trên Storefront Cart line attributes chắc chắn sẽ bị ẩn khỏi Shopify hosted checkout.

Trước launch MUST test thực tế:

```text
Storefront Cart
      ↓
checkoutUrl
      ↓
Shopify Checkout
      ↓
Order
      ↓
Shopify Admin
```

Verify:

- `_mr_kind`
- `_mr_unit_id`
- `_mr_gift_message_kind`
- `_mr_gift_message`

xuất hiện ở đâu.

Nếu technical metadata bị hiển thị trong customer checkout, MUST quyết định một trong:

1. Chấp nhận display format thân thiện.
2. Chuyển metadata technical sang strategy khác.
3. Giảm metadata xuống mức tối thiểu.

Đây là **launch blocker**.

---

# 21. Gift message length

MUST reuse business-rule constant đang có trong codebase.

Không tạo max length mới trong backend.

Target:

```ts
const maxLength = CURRENT_GIFT_MESSAGE_MAX_LENGTH;
```

Validation phải tồn tại cả:

```text
client
+
server
```

Server là authoritative validation.

---

# 22. Target Shopify GraphQL operations

Implement:

```text
CART_QUERY
CART_CREATE
CART_LINES_ADD
CART_LINES_UPDATE
CART_LINES_REMOVE
CART_BUYER_IDENTITY_UPDATE
```

Không cần:

```text
checkoutCreate
```

vì Shopify Cart trả `checkoutUrl`.

Shopify Cart API được thiết kế cho create/retrieve/update cart rồi redirect thông qua `checkoutUrl`.

---

# 23. Shared Cart fragment

Recommended base:

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

  lines(first: $first, after: $after) {
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

# 24. Cart pagination

MUST NOT assume:

```graphql
lines(first: 100)
```

là đủ mãi mãi.

Gift Set có:

```text
1 physical unit
=
1 Shopify CartLine
```

nên số line có thể tăng nhanh.

Implement helper:

```ts
async function getAllCartLines(...)
```

Pseudo:

```text
query first page
    ↓
hasNextPage?
 ├─ no → done
 └─ yes
      ↓
   query after cursor
      ↓
   append
      ↓
   repeat
```

Mutation response có thể lấy page đầu.

Nếu:

```text
hasNextPage = true
```

service MUST fetch remaining cart state trước khi trả normalized snapshot cho client.

---

# 25. Cart Mapper

Target:

```text
Shopify Cart
     ↓
parse attributes
     ↓
domain CartLine[]
     ↓
group gift-set lines
     ↓
CartSnapshot
```

Rules:

```ts
if (_mr_kind === "gift_set") {
  quantityEditable = false;
  supportsGiftMessage = true;
}

if (_mr_kind === "caviar") {
  quantityEditable = true;
  supportsGiftMessage = false;
}
```

Unknown/missing metadata SHOULD have safe fallback based on existing product/domain classification.

---

# 26. Server directory structure

Recommended:

```text
src/shared/lib/shopify/cart/
├── cart.fragment.ts
├── cart.query.ts
├── cart.mutation.ts
├── cart.mapper.ts
├── cart.service.ts
├── cart.client.ts
├── cart.cookie.ts
├── cart.validation.ts
├── cart.error.ts
└── cart.type.ts
```

Responsibilities:

```text
cart.fragment.ts
→ GraphQL fragments

cart.query.ts
→ Cart queries

cart.mutation.ts
→ Shopify mutations

cart.mapper.ts
→ Shopify → domain DTO

cart.service.ts
→ business rules

cart.client.ts
→ request-scoped Storefront client

cart.cookie.ts
→ mr_cart read/write/delete

cart.validation.ts
→ input validation

cart.error.ts
→ Shopify → application errors

cart.type.ts
→ internal Shopify/cart types
```

---

# 27. Next.js API structure

Recommended:

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

Không đặt Shopify CartLine GID trực tiếp vào dynamic URL segment.

Ví dụ tránh:

```text
/api/cart/lines/gid://shopify/CartLine/...
```

vì Shopify GID chứa `/`, `?`, query-like content và làm routing/encoding phức tạp không cần thiết.

---

# 28. API — GET `/api/cart`

Purpose:

```text
restore/hydrate cart
```

Request:

```http
GET /api/cart?locale=en
```

Server:

```text
read mr_cart
read mr_country
resolve locale
        ↓
no cart cookie?
    ↓
return empty snapshot
        ↓
cart cookie exists
    ↓
query Shopify
        ↓
cart exists?
 ├─ yes → normalize
 └─ no  → clear mr_cart
          return empty snapshot
```

Response:

```ts
{
  cart: CartSnapshot;
}
```

Headers:

```text
Cache-Control: no-store
```

MUST NOT create a Shopify cart chỉ vì user mở website.

Cart creation phải lazy.

---

# 29. API — POST `/api/cart/lines`

Purpose:

```text
Add to Cart
```

Input union:

```ts
type AddCartLineRequest =
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
      operationId: string;
      locale: "en" | "fr";
    };
```

MUST NOT accept:

```ts
price
currency
quantityAvailable
checkoutUrl
cartId
```

from browser.

Response:

```ts
type CartMutationResponse = {
  operationId: string;
  cart: CartSnapshot;
  warnings: CartWarningDTO[];
};
```

---

# 30. First Add — lazy cart creation

If `mr_cart` missing:

```text
POST Add
    ↓
cartCreate
    ↓
buyerIdentity.countryCode = mr_country
    ↓
initial lines included
    ↓
receive Shopify cart
    ↓
store full cart ID in mr_cart
    ↓
normalize
    ↓
response
```

Do not:

```text
cartCreate
then
cartLinesAdd
```

nếu first item có thể được đưa thẳng vào `cartCreate`.

Giảm một network round trip.

---

# 31. Add Caviar algorithm

MUST NOT rely vào Shopify tự merge lines.

Algorithm:

```text
load cart
    ↓
find:
 line.kind === caviar
 AND
 line.merchandiseId === requested merchandiseId
    ↓
exists?
 ├─ yes
 │    ↓
 │ target = current.quantity + requested.quantity
 │    ↓
 │ cartLinesUpdate
 │
 └─ no
      ↓
   cartLinesAdd
```

Business rule nằm ở application layer.

---

# 32. Add Gift Set algorithm

Input:

```text
quantity = N
```

Generate exactly N line inputs.

Example N=3:

```ts
[
  {
    merchandiseId,
    quantity: 1,
    attributes: [
      ["_mr_kind", "gift_set"],
      ["_mr_unit_id", uuid1],
    ],
  },
  {
    merchandiseId,
    quantity: 1,
    attributes: [
      ["_mr_kind", "gift_set"],
      ["_mr_unit_id", uuid2],
    ],
  },
  {
    merchandiseId,
    quantity: 1,
    attributes: [
      ["_mr_kind", "gift_set"],
      ["_mr_unit_id", uuid3],
    ],
  },
]
```

Send trong một mutation:

```text
cartLinesAdd(lines: [...])
```

không loop 3 network calls.

---

# 33. Gift unit IDs

Recommended:

```ts
crypto.randomUUID()
```

Client MAY generate unit IDs trước optimistic insertion.

Tốt hơn cho reconciliation:

```text
operationId
+
unit index
```

Example:

```text
operation:
b5d...

units:
b5d...:0
b5d...:1
b5d...:2
```

Hoặc independent UUID đều được.

Requirement:

```text
stable across request + reconciliation
```

không regenerate khi retry/reconcile.

---

# 34. Inventory fix cho Gift Set

Current implementation phải sửa logic từ:

```text
existingCount = all lines in product group
```

sang:

```ts
existingVariantCount =
  giftLines.filter(
    line => line.merchandiseId === activeVariant.id
  ).length;
```

Example:

```text
30g inventory = 10
50g inventory = 5

Cart:
30g x 4

Adding 50g
```

Available 50g phải vẫn:

```text
5
```

không phải:

```text
5 - 4 = 1
```

Inventory isolation MUST theo `merchandiseId`.

---

# 35. API — PATCH `/api/cart/line`

Purpose:

- Caviar quantity
- Gift message

Input:

```ts
type UpdateCartLineRequest =
  | {
      action: "quantity";
      lineId: string;
      quantity: number;
      operationId: string;
      locale: "en" | "fr";
    }
  | {
      action: "gift_message";
      lineId: string;
      giftMessage: {
        kind: string;
        text: string;
      } | null;
      operationId: string;
      locale: "en" | "fr";
    };
```

---

# 36. Quantity update

Server MUST validate:

```text
quantity >= 1
integer
reasonable upper bound
```

Then:

```graphql
cartLinesUpdate(
  cartId: ...
  lines: [{
    id: lineId
    quantity: target
  }]
)
```

Shopify response mới là authoritative result.

---

# 37. Gift message update

Server first resolves current line attributes.

Example current:

```text
_mr_kind
_mr_unit_id
_mr_gift_message_kind
_mr_gift_message
```

When message changes, MUST preserve:

```text
_mr_kind
_mr_unit_id
```

Do not accidentally submit only:

```text
_mr_gift_message
```

và làm mất technical metadata.

Desired:

```ts
nextAttributes = mergeAttributes(
  existingAttributes,
  {
    _mr_gift_message_kind: message.kind,
    _mr_gift_message: message.text,
  },
);
```

If removing message:

```text
remove:
_mr_gift_message_kind
_mr_gift_message

preserve:
_mr_kind
_mr_unit_id
```

---

# 38. API — POST `/api/cart/remove`

Input:

```ts
{
  lineId: string;
  operationId: string;
  locale: "en" | "fr";
}
```

Server:

```text
read cart cookie
    ↓
cartLinesRemove
    ↓
normalize returned Shopify cart
    ↓
update cookie
    ↓
response
```

Gift-set remove removes exactly one physical CartLine.

Do not implement:

```text
remove whole group
```

trừ khi UX hiện tại đã có action đó.

---

# 39. Cart cookie synchronization

Sau mọi successful Shopify mutation:

```ts
setCartCookie(result.cart.id);
```

ngay cả khi value trông giống cookie hiện tại.

Server luôn dùng ID mới nhất Shopify trả về.

Browser không bao giờ nhận full cart ID.

---

# 40. Cart restoration

`CartProvider` on mount:

```text
mount
  ↓
GET /api/cart
  ↓
Shopify cart
  ↓
normalize
  ↓
confirmedCart
```

Requirements:

- Silent hydration.
- Không auto-open drawer.
- Không block page render.
- Không thêm full-screen loader.
- Không làm catalog phụ thuộc cart fetch.
- Cart request `no-store`.

Nếu user chưa từng có cart:

```text
GET
→ empty DTO
```

không tạo Shopify Cart.

---

# 41. Cart expiration / stale cart

If:

```text
mr_cart exists
```

but Shopify:

```text
cart = null
```

then:

```text
clear mr_cart
return empty snapshot
```

Không show fatal error.

Nếu stale cart được phát hiện trong explicit Add:

```text
stale cart
    ↓
clear cookie
    ↓
create new cart
    ↓
apply add exactly once
```

Chỉ retry khi hệ thống chắc chắn operation đầu tiên **không được Shopify apply**.

---

# 42. Ambiguous network failure

Case:

```text
POST Shopify
    ↓
Shopify applied mutation
    ↓
network connection drops
    ↓
app receives no response
```

MUST NOT:

```text
blind retry mutation
```

vì có thể duplicate add.

Instead:

```text
mutation result unknown
      ↓
GET authoritative cart
      ↓
reconcile operation
```

Gift Set có thể reconcile qua:

```text
_mr_unit_id
```

Caviar có thể reconcile bằng:

```text
existing merchandise line
+
expected target quantity
```

Nếu không xác định chắc chắn operation applied:

- rollback/reconcile theo Shopify state
- báo operation failure bằng existing error feedback
- user có thể explicit action lại

Không auto double-add.

---

# 43. Operation ID

Mỗi user transaction MUST có:

```ts
operationId = crypto.randomUUID();
```

Ví dụ:

```text
click Add
→ operation ID A

click Add lần nữa
→ operation ID B
```

Operation ID:

- dùng cho reconciliation
- logging
- client pending queue
- chống stale responses

MUST NOT được coi là Shopify cart identity.

---

# 44. CartProvider target API

Giữ public API gần current implementation nhất có thể.

Target:

```ts
type CartContextValue = {
  entries: CartEntry[];

  itemCount: number;
  subtotal: Money;

  isOpen: boolean;

  addLine(input: AddLineInput): Promise<void>;

  addGiftSetUnits(
    input: AddGiftSetInput
  ): Promise<void>;

  setLineQuantity(
    lineId: string,
    quantity: number
  ): Promise<void>;

  setGiftMessage(
    lineId: string,
    message: CartGiftMessage | null
  ): Promise<void>;

  removeLine(
    lineId: string
  ): Promise<void>;

  checkout(): Promise<void>;

  open(): void;
  close(): void;
};
```

Existing visual components SHOULD không biết Shopify GraphQL tồn tại.

---

# 45. Provider internal state

Recommended internal architecture:

```ts
type CartState = {
  confirmed: CartSnapshot;

  pendingOperations: PendingOperation[];

  status:
    | "hydrating"
    | "ready"
    | "error";
};
```

Rendered cart:

```text
confirmed Shopify cart
      +
replay pending optimistic operations
      ↓
view cart
```

Điều này tốt hơn overwrite trực tiếp local state rồi cố rollback thủ công.

---

# 46. Global mutation queue

Cart mutations SHOULD execute tuần tự theo cart.

Reason:

User có thể click:

```text
+
+
+
+
```

rất nhanh.

Bad:

```text
request A: qty 2 → 3
request B: qty 2 → 3
request C: qty 2 → 3
```

Expected:

```text
2 → 5
```

Recommended:

```text
UI intent:
3
4
5

network:
latest desired quantity = 5

Shopify:
2 → 5
```

---

# 47. Quantity coalescing

Quantity updates MAY coalesce.

Example:

```text
pending:
line A → 3

user clicks +
pending:
line A → 4

user clicks +
pending:
line A → 5
```

Only final desired quantity needs to be sent if request chưa dispatch.

Do not delay optimistic UI.

---

# 48. Add-to-cart MUST NOT debounce

Every explicit Add click là transaction riêng.

Do not:

```text
click Add
click Add
within 300ms
→ collapse as one user action
```

unless existing UX already does vậy.

Each explicit Add gets separate operation ID.

---

# 49. Response ordering

If implementation ever allows overlapping reads/mutations, MUST prevent old response overwrite new user intent.

Minimum:

```ts
requestSequence++;
```

Only authoritative updates matching queue ordering được applied.

Recommended simpler solution:

```text
cart-wide mutation queue
```

vì commerce cart operations thường ít và serialization giảm rất nhiều race bugs.

---

# 50. Optimistic Add Caviar

Flow:

```text
click Add
    ↓
create operation
    ↓
update optimistic cart immediately
    ↓
open drawer immediately
    ↓
enqueue API
    ↓
Shopify result
    ↓
confirmed cart = Shopify
    ↓
remove pending op
    ↓
replay remaining optimistic ops
```

Happy-path visible behavior = current implementation.

---

# 51. Optimistic Gift Set

When adding N units:

```text
generate N unit IDs
     ↓
optimistically append N lines
     ↓
open drawer
     ↓
server cartLinesAdd N lines
     ↓
map returned Shopify line IDs back through unit IDs
```

This is why `_mr_unit_id` rất hữu ích.

---

# 52. Optimistic gift message

Save message:

```text
update current line immediately
      ↓
close dialog / restore drawer
      ↓
server mutation
```

Nếu mutation fails:

```text
reconcile authoritative Shopify line
```

Happy path không thêm waiting step.

---

# 53. Shopify warnings

Cart mutations có thể thành công nhưng Shopify tự điều chỉnh cart và trả `warnings`, ví dụ merchandise vừa hết stock. Warnings khác user errors: warning vẫn là successful mutation có automatic adjustment.

MUST request:

```graphql
warnings {
  code
  target
  message
}

userErrors {
  code
  field
  message
}
```

trong mọi supported cart mutation.

---

# 54. Warning handling

Example:

```text
MERCHANDISE_OUT_OF_STOCK
```

Behavior:

```text
Shopify returns adjusted cart
      ↓
accept Shopify cart as authoritative
      ↓
re-render existing cart UX
      ↓
reuse existing stock feedback when applicable
```

MUST NOT rollback a successful mutation chỉ vì có warning.

---

# 55. User error handling

If:

```text
userErrors.length > 0
```

treat mutation as business failure.

Flow:

```text
optimistic UI
     ↓
Shopify userError
     ↓
remove pending optimistic operation
     ↓
restore/reconcile confirmed cart
     ↓
map error to existing UI feedback
```

---

# 56. Network error UX

Happy path MUST có no new UI.

Error-only path MAY thêm minimal feedback.

Priority:

1. Reuse existing tooltip/error primitive.
2. Existing toast system nếu repo đã có.
3. Nếu không có primitive phù hợp, thêm invisible/non-layout-breaking:

```html
aria-live="polite"
```

status.

Không thêm persistent alert box trong drawer chỉ cho architecture mới.

---

# 57. Error response contract

Recommended:

```ts
type CartApiError = {
  error: {
    code:
      | "INVALID_INPUT"
      | "CART_NOT_FOUND"
      | "LINE_NOT_FOUND"
      | "INVALID_QUANTITY"
      | "OUT_OF_STOCK"
      | "INVALID_COUNTRY"
      | "INVALID_LOCALE"
      | "SHOPIFY_USER_ERROR"
      | "UPSTREAM_UNAVAILABLE"
      | "CHECKOUT_UNAVAILABLE";

    message: string;

    field?: string[];

    retryable: boolean;
  };

  operationId?: string;
};
```

Server error message không được expose:

- token
- cart secret
- private Shopify response details

---

# 58. HTTP status recommendations

```text
200
successful cart mutation, warnings possible

400
invalid request/schema/GID

404
line/cart logically unavailable where recovery isn't automatic

409
commerce state conflict / insufficient stock

422
valid request but Shopify business rule rejects

502
Shopify upstream malformed/failure

503
temporary upstream unavailable
```

Client logic SHOULD rely primarily on machine `error.code`, không parse human strings.

---

# 59. Input validation

Server MUST validate:

### Merchandise ID

```text
gid://shopify/ProductVariant/
```

### Cart line ID

```text
gid://shopify/CartLine/
```

### Quantity

```text
integer
>= 1
within safe upper limit
```

### Locale

```text
en
fr
```

### Country

```text
FR
US
```

### Gift message

```text
string
existing max length
valid message kind
```

---

# 60. Server must not trust product price

Input:

```json
{
  "merchandiseId": "...",
  "quantity": 2
}
```

Not:

```json
{
  "merchandiseId": "...",
  "quantity": 2,
  "price": 599,
  "currency": "EUR",
  "inventory": 8
}
```

Shopify must validate merchandise/availability/pricing.

---

# 61. Market synchronization

This là prerequisite production.

Target invariant:

```text
PDP country
=
CartBuyerIdentity.countryCode
=
Checkout country context
```

Never:

```text
PDP FR
€599

Cart US
$649
```

without user explicitly changing region.

Shopify explicitly distinguishes product pricing context (`@inContext`) from cart pricing (`CartBuyerIdentity`). Country/buyer arguments on `@inContext` are ignored for Cart operations; cart country must be set via buyer identity.

---

# 62. Catalog market context

Refactor catalog functions conceptually:

```ts
getProduct({
  handle,
  locale,
  country,
});
```

Country MUST be explicit function argument.

Example:

```text
getProduct(
  handle,
  "en",
  "US"
)
```

Cache key therefore naturally includes:

```text
product
+ handle
+ language
+ country
```

MUST NOT call:

```ts
cookies()
```

inside reusable cached Shopify data function.

Read cookie tại request boundary rồi pass country xuống.

---

# 63. Region change flow

Existing region selector UX giữ nguyên.

Target:

```text
user chooses US
     ↓
POST /api/region
     ↓
set mr_country = US
     ↓
existing cart?
 ├─ no → done
 └─ yes
      ↓
 cartBuyerIdentityUpdate(
   countryCode: US
 )
      ↓
 return normalized cart
     ↓
update region preference state
     ↓
existing route refresh/navigation logic
```

Cart không bị destroy khi đổi region.

---

# 64. API — POST `/api/region`

Input:

```ts
{
  countryCode: "FR" | "US";
  locale: "en" | "fr";
}
```

Response:

```ts
{
  countryCode: "FR" | "US";
  cart?: CartSnapshot;
}
```

If cart exists, update buyer identity.

Shopify xác định international cart pricing dựa trên `CartBuyerIdentity.countryCode`; country nên phù hợp với buyer shipping country.

---

# 65. Locale synchronization

Supported:

```text
/en
/fr
```

All Storefront cart queries/mutations SHOULD execute với:

```graphql
@inContext(language: $language)
```

Important:

```text
Cart country:
CartBuyerIdentity.countryCode

Cart language:
@inContext(language)
```

Country và language không cùng mechanism.

Shopify xác nhận `language` vẫn áp dụng cho Cart operations; `cartCreate @inContext(language: ...)` cũng contextualizes resulting checkout locale.

---

# 66. Checkout locale

Checkout request MUST use **current locale**, không locale lúc cart ban đầu được tạo.

Example:

```text
create cart on /en
      ↓
user switches /fr
      ↓
click Checkout
```

Checkout request runs in:

```text
language = FR
```

before obtaining checkout URL.

---

# 67. API — POST `/api/cart/checkout`

Input:

```ts
{
  locale: "en" | "fr";
}
```

Flow:

```text
read mr_cart
    ↓
read mr_country
    ↓
ensure cart exists
    ↓
ensure buyerIdentity.countryCode
matches mr_country
    ↓
query cart using current language context
    ↓
get current checkoutUrl
    ↓
return URL
```

Response:

```ts
{
  checkoutUrl: string;
}
```

Client:

```ts
window.location.assign(checkoutUrl);
```

No custom intermediate checkout page.

---

# 68. Checkout URL must be requested at checkout time

MUST NOT persist checkout URL indefinitely in React state rồi reuse.

When user presses button:

```text
CHECK OUT
    ↓
POST /api/cart/checkout
    ↓
fresh/current checkoutUrl
    ↓
redirect
```

Shopify recommends requesting checkout URL when buyer is ready to navigate and re-requesting it when stale.

---

# 69. Cart Drawer checkout implementation

Current visual button giữ nguyên.

Conceptually:

```tsx
<Button
  onClick={checkout}
>
  {t("checkout")}
</Button>
```

Allowed error-only enhancements:

```text
disabled while checkout request is in-flight
```

nếu cần chống double click.

MUST NOT change label/happy-path visual unless existing loading pattern đã có.

---

# 70. Checkout empty cart guard

Server:

```text
no cart
or
itemCount === 0
```

return:

```text
CART_EMPTY
```

Client không redirect.

---

# 71. Catalog ↔ Cart price consistency

Acceptance invariant:

```text
selected country = FR

PDP
EUR

Cart
EUR

Checkout
EUR
```

and:

```text
selected country = US

PDP
US contextual price/currency

Cart
same market

Checkout
same buyer context
```

If Shopify Markets configuration itself không support target currency/country, đây là environment/configuration blocker chứ không sửa bằng frontend formatting.

---

# 72. Client total source

`CartProvider` SHOULD receive:

```ts
subtotal: {
  amount: string;
  currencyCode: string;
}
```

Formatting dùng existing money formatter.

Do not convert:

```text
EUR → USD
```

client-side.

Shopify market/cart response là source.

---

# 73. Cart line price source

UI line price MUST come from:

```graphql
line.cost.amountPerQuantity
```

or exact field needed to preserve current visual semantics.

Line subtotal:

```graphql
line.cost.subtotalAmount
```

No client-derived market pricing.

---

# 74. Update product panels

Caviar PDP Add input chuyển từ ambiguous:

```ts
id
```

sang:

```ts
merchandiseId: activeVariant.id
```

Gift Set MUST bắt đầu truyền:

```ts
activeVariant.id
```

vì current local model bỏ variant ID là không đủ cho Shopify Cart API.

Target:

```ts
addGiftSetUnits({
  merchandiseId: activeVariant.id,
  quantity,
});
```

---

# 75. Preserve existing labels

Do not use GraphQL title fields trực tiếp nếu điều đó thay đổi display hiện tại.

`CartMapper` phải preserve current business formatting:

- display title
- weight
- variant label
- image behavior
- group title

Nếu current UI có custom metafield-based label, mapper/service cần lấy đủ data hoặc preserve derived mapping.

Do not let Shopify technical title accidentally change visual copy.

---

# 76. Request-scoped Storefront client

Conceptually:

```ts
createCartStorefrontClient({
  buyerIp,
  privateToken,
  storeDomain,
  apiVersion: "2026-04",
});
```

Headers:

```text
Shopify-Storefront-Private-Token
Shopify-Storefront-Buyer-IP
```

MUST NOT send private token to browser.

---

# 77. Buyer IP resolution

Resolve buyer IP từ trusted hosting/proxy headers theo Vercel deployment configuration.

Do not blindly concatenate arbitrary forwarded header values.

Create one helper:

```ts
getBuyerIp(request): string | undefined
```

Do not duplicate parsing across API routes.

---

# 78. Cache policy

Cart routes:

```text
Cache-Control: no-store
```

Shopify Cart queries/mutations:

```text
no cache
```

Catalog:

```text
existing cache strategy
```

Cart implementation MUST NOT regress cacheability of product/collection Shopify data unnecessarily.

---

# 79. CSRF / origin protection

Mutation routes MUST:

- use `POST/PATCH`
- validate JSON Content-Type
- rely on SameSite cookie
- SHOULD validate `Origin` against current storefront origin
- reject obviously cross-origin cart mutation requests

Do not build generic:

```text
/api/graphql
```

proxy accepting arbitrary GraphQL from browser.

Only expose narrow cart intents.

---

# 80. Privacy

Gift messages may contain personal information.

MUST NOT log:

```text
gift message text
```

MUST NOT add it to:

- analytics
- error breadcrumbs
- request debug logs
- monitoring labels

Logging:

```text
hasGiftMessage: true
messageLength: 83
```

is acceptable.

Not:

```text
giftMessage: "Happy birthday John..."
```

---

# 81. Cart secret logging

Never log:

```text
gid://shopify/Cart/...?...key=...
```

If correlation required:

```ts
cartFingerprint = hash(cartTokenWithoutSecret)
```

or another irreversible short fingerprint.

---

# 82. Observability

Structured log:

```ts
{
  requestId,
  operationId,
  action: "cart.lines.add",
  kind: "gift_set",
  quantity: 3,
  country: "FR",
  locale: "fr",
  cartFingerprint,
  durationMs,
  warningCodes,
  result: "success"
}
```

No:

- secret cart ID
- access token
- gift message
- checkout URL query secrets if any

---

# 83. Metrics

Recommended:

```text
cart_load_success_rate
cart_mutation_success_rate
cart_mutation_latency
cart_warning_rate
cart_stale_recovery_count
cart_upstream_error_rate
checkout_url_success_rate
checkout_redirect_attempts
```

Optional:

```text
cart_ambiguous_reconciliation_count
```

---

# 84. Shopify mutation helper

Centralize:

```ts
executeCartMutation(...)
```

Responsibilities:

```text
execute GraphQL
    ↓
parse GraphQL transport errors
    ↓
parse userErrors
    ↓
capture warnings
    ↓
validate cart response
    ↓
save returned cart ID cookie
    ↓
fetch remaining pages if necessary
    ↓
normalize
```

Avoid mỗi route tự implement mutation error handling.

---

# 85. Empty cart DTO

Use explicit factory:

```ts
createEmptyCartSnapshot(countryCode)
```

Example:

```ts
{
  entries: [],
  itemCount: 0,
  subtotal: {
    amount: "0.00",
    currencyCode: resolveExpectedCurrency(countryCode),
  },
  countryCode,
  warnings: [],
}
```

Be careful: currency ideally comes from Shopify localization/config rather than hardcoding if Markets settings may change.

For no-cart state, existing storefront market context SHOULD provide expected currency.

---

# 86. Shopify warnings DTO

Client does not need raw Shopify payload.

```ts
type CartWarningDTO = {
  code: string;
  lineId?: string;
};
```

Human Shopify warning message SHOULD not become untranslated storefront UI automatically.

Use warning code → existing localized UX.

---

# 87. Prevent duplicate gift units

Gift-unit reconciliation:

```text
operation wants:
unit A
unit B
unit C

network response unknown
      ↓
GET cart
      ↓
find _mr_unit_id
```

If A/B/C exist:

```text
operation succeeded
```

Do not re-add.

---

# 88. Prevent duplicate Caviar

For caviar:

Before operation:

```text
confirmed quantity = 2
```

Intent:

```text
+1
target = 3
```

If network ambiguous:

```text
GET cart
```

If Shopify says:

```text
quantity = 3
```

treat applied.

Do not blindly add again.

---

# 89. Concurrent tabs

Full perfect multi-tab synchronization is not primary scope.

However:

- Every mutation reconciles from Shopify.
- Every page refresh reloads Shopify.
- `visibilitychange` MAY trigger cart refresh later as enhancement.

Not required for v1 unless current requirement demands it.

No BroadcastChannel required initially.

---

# 90. Region change and pending mutations

MUST avoid:

```text
quantity mutation FR
running

country → US

old FR response
overwrites US cart
```

Simplest rule:

```text
region update
=
cart mutation queue operation
```

Serialize it with cart mutations.

After buyer identity update:

```text
confirmedCart = US Shopify result
```

Any following mutations use US context.

---

# 91. Checkout and pending mutations

When user clicks checkout while cart mutation pending:

```text
await cart mutation queue flush
    ↓
checkout request
```

Do not redirect while latest visible quantity/message chưa được confirmed.

This is critical.

User expectation:

```text
cart they see
=
cart they checkout
```

---

# 92. Checkout double click

While checkout operation pending:

```ts
checkoutPending = true;
```

Subsequent clicks do nothing.

Do not fire multiple checkout URL requests.

---

# 93. Accessibility

Existing accessibility MUST remain.

New async logic SHOULD expose status through existing semantics.

Requirements:

- Buttons preserve accessible names.
- Disabled stock buttons remain keyboard-readable.
- Gift dialog focus management unchanged.
- New error feedback must be screen-reader accessible.
- No focus jump after silent cart reconciliation.

---

# 94. Test strategy

Tests chia 4 tầng:

```text
Unit
Integration
Component/Provider
E2E
```

Existing cart tests MUST tiếp tục pass hoặc được refactor tương đương nếu implementation details thay đổi.

---

# 95. Unit tests — Cart mapper

Must cover:

```text
Shopify caviar line
→ Caviar CartLine

Shopify gift line
→ Gift CartLine

gift message attrs
→ correct message

missing gift message
→ null

multiple gift lines same product
→ one presentation group

different products
→ separate groups

Money
→ no floating-point transformation
```

---

# 96. Unit tests — Caviar

Cases:

```text
existing same merchandise
→ update quantity

different merchandise
→ add line

same merchandise but gift_set kind
→ do not merge as caviar

stock warning
→ normalized warning
```

---

# 97. Unit tests — Gift Set

Cases:

```text
quantity 1
→ 1 physical line

quantity 3
→ 3 physical lines

all unit IDs unique

all quantity = 1

same product, same variant
→ group together in presentation

same product, different variant
→ group same product

inventory count
→ count per merchandiseId
```

---

# 98. Unit tests — Gift message

Cases:

```text
add message

edit message

remove message

preserves _mr_kind

preserves _mr_unit_id

does not leak message into logs
```

---

# 99. Unit tests — validation

Cover:

- invalid ProductVariant GID
- invalid CartLine GID
- quantity 0
- negative quantity
- decimal quantity
- unsupported country
- unsupported locale
- message too long
- invalid message kind

---

# 100. API integration tests

### First Add

```text
no mr_cart
→ cartCreate
→ cookie created
→ cart returned
```

### Restore

```text
mr_cart
→ cart query
→ snapshot
```

### Stale

```text
invalid/stale cart
→ clear cookie
→ empty
```

### Caviar duplicate

```text
same variant
→ cartLinesUpdate
not cartLinesAdd
```

### Gift set

```text
qty 3
→ one Shopify mutation
→ 3 lines
```

---

# 101. Mutation failure integration tests

Cases:

```text
Shopify userErrors
→ application error

Shopify warnings
→ success + reconcile

transport timeout
→ no blind retry

ambiguous add
→ GET reconciliation

invalid cart
→ safe recovery
```

---

# 102. Market integration tests

### FR

```text
mr_country=FR

PDP price context
CartBuyerIdentity
Cart currency
Checkout
```

must align.

### US

same test.

### Switch

```text
FR cart
→ select US
→ cartBuyerIdentityUpdate
→ existing items preserved
→ price/currency reconciled
```

---

# 103. Locale tests

```text
/en
→ EN cart context
→ English checkout

/fr
→ FR language context
→ French checkout
```

Also:

```text
create cart /en
switch /fr
checkout
→ current /fr context
```

---

# 104. E2E — Caviar

MUST test:

1. Add one Caviar.
2. Drawer opens immediately.
3. Correct image/title/price.
4. Refresh page.
5. Cart remains.
6. Add same variant.
7. Same row quantity increments.
8. Add different variant.
9. New row.
10. `+/-` work.
11. Quantity cannot exceed stock.
12. Remove works.
13. Cart count correct.
14. Subtotal correct.

---

# 105. E2E — Gift Set

MUST test:

1. Select gift variant.
2. Quantity = 3.
3. Add.
4. Drawer opens immediately.
5. One group.
6. Three physical rows.
7. Each row independent.
8. Add message A to row 1.
9. Add message B to row 2.
10. Row 3 no message.
11. Refresh.
12. A/B association unchanged.
13. Remove row 2.
14. Message A remains on row 1.
15. Remaining unit identity không shift sai.
16. Add another same gift set.
17. It appends.
18. Group count correct.

---

# 106. E2E — critical identity regression

Test specifically:

```text
Gift units:

A → message "A"
B → message "B"
C → message "C"

remove B
```

Expected:

```text
A → "A"
C → "C"
```

Never:

```text
A → "A"
C → "B"
```

UI MUST identify units bằng stable Shopify line/unit IDs, không array index.

---

# 107. E2E — inventory by variant

Example:

```text
Gift Set variant 30g available = 10
Gift Set variant 50g available = 5
```

Add:

```text
30g x 4
```

Then select:

```text
50g
```

UI MUST allow:

```text
up to 5
```

not `1`.

---

# 108. E2E — stock race

Scenario:

```text
page says stock 5

another transaction reduces actual stock

user adds 5
```

Shopify adjusts mutation.

Expected:

```text
Shopify warning
→ cart reconciles
→ available quantity reflected
→ no corrupt optimistic state
```

Warnings from Cart API are specifically designed to communicate automatic cart adjustments such as merchandise becoming out of stock.

---

# 109. E2E — checkout

MUST cover:

```text
cart items
gift messages
region
locale
      ↓
Check Out
      ↓
Shopify checkout
```

Verify:

- correct merchandise
- correct quantity
- correct currency
- correct market
- correct language
- no duplicate lines
- expected gift metadata survives
- checkout accessible
- no cart secret exposed in app responses

---

# 110. Shopify Admin verification

After test checkout/order, manually verify:

```text
Shopify Admin
    ↓
Order
    ↓
Line items
```

Gift metadata MUST remain associated với đúng physical line.

Document actual appearance.

This is required before release.

---

# 111. Security tests

MUST verify browser cannot find:

```text
Shopify private token
```

in:

- JS bundle
- Network responses
- DOM
- browser storage

Also verify full:

```text
Cart ID ?key=
```

không xuất hiện trong:

- network response JSON
- localStorage
- sessionStorage
- DOM
- logs

Shopify explicitly treats cart secret as sensitive and requires it not be exposed client-side.

---

# 112. Performance requirements

Cart implementation MUST NOT introduce Shopify Cart API into:

```text
product server render
collection server render
homepage render
```

unless specifically loading cart.

Catalog request performance SHOULD remain independent.

Add-to-cart UX should remain immediate through optimistic update even if Shopify latency is higher.

---

# 113. Recommended file-change map

Existing cart UI:

```text
CartDrawer
→ minimal modification

CartLineItem
→ ideally no structural modification

CartGroupCard
→ no business rewrite

CartMessageDialog
→ no UI rewrite

CartQuantityStepper
→ no UI rewrite

CartTrigger
→ consume server-backed count
```

Major refactor:

```text
CartProvider
Cart types
Product Add inputs
Region synchronization
```

New:

```text
Shopify Cart service
GraphQL operations
API routes
cookie helpers
validation
tests
```

---

# 114. Feature flag

Recommended:

```env
SHOPIFY_CART_ENABLED=true
```

Purpose:

```text
deploy implementation
      ↓
enable staging
      ↓
QA
      ↓
production
```

Rollback:

```text
flag off
```

nếu production cart issue xảy ra.

Do not maintain two full production cart implementations lâu dài.

Flag chỉ phục vụ rollout.

---

# 115. Migration

Không có client Shopify cart hiện tại nên không cần migrate old Shopify cart IDs.

Existing local cart:

```text
refresh currently lost anyway
```

Do not attempt complex one-time local-state migration.

After feature enabled:

```text
first new Add
→ Shopify Cart
```

---

# 116. Implementation PR plan

## PR 1 — Domain foundation

Implement:

- Cart types
- `id` vs `merchandiseId`
- Money model
- Cart mapper contracts
- Gift Set inventory bug fix
- Unit tests

No Shopify Cart network yet.

---

## PR 2 — Shopify Cart transport

Implement:

```text
cart.client
cart.fragment
cart.query
cart.mutation
cart.cookie
cart.validation
cart.service
```

Operations:

- create
- query
- add
- update
- remove
- buyer identity

Unit/integration tests.

---

## PR 3 — Cart API

Implement:

```text
GET /api/cart
POST /api/cart/lines
PATCH /api/cart/line
POST /api/cart/remove
```

Include:

- cookie
- buyer IP
- errors
- warnings
- pagination
- no-store

---

## PR 4 — CartProvider integration

Replace local-only persistence with:

```text
confirmed Shopify state
+
optimistic queue
```

Keep existing component contract.

Implement:

- hydration
- Add
- quantity
- remove
- concurrency
- reconciliation
- stale recovery

---

## PR 5 — Gift Set Shopify model

Implement:

- one physical unit per CartLine
- `_mr_kind`
- `_mr_unit_id`
- Gift Set grouping
- variant inventory isolation
- ambiguous request reconciliation

---

## PR 6 — Gift Messages

Implement:

- line attributes
- edit
- remove
- preserve technical attributes
- optimistic message
- test identity persistence

---

## PR 7 — Markets

Implement:

```text
mr_country
/api/region
catalog country argument
CartBuyerIdentity
FR / US sync
```

Verify:

```text
PDP
Cart
Checkout
```

match.

---

## PR 8 — Checkout

Implement:

```text
/api/cart/checkout
current locale
fresh checkoutUrl
queue flush
redirect
```

No custom checkout UI.

---

## PR 9 — Hardening

Implement/finalize:

- warning mapping
- network reconciliation
- origin validation
- observability
- E2E suite
- performance regression checks
- Shopify Admin order verification

---

# 117. Definition of Done — Functional

Feature chưa được coi là done cho đến khi:

- Cart Shopify-backed.
- Refresh giữ cart.
- Same Caviar variant merges.
- Different variants remain separate.
- Gift Set quantity N = N physical lines.
- Gift messages remain 1:1 with gift units.
- Remove middle gift unit không reassign message.
- Variant inventory handled independently.
- Shopify warning reconciliation works.
- Region switch preserves cart.
- PDP/cart/checkout market pricing consistent.
- Checkout button redirects correctly.
- `/en` and `/fr` checkout context works.

---

# 118. Definition of Done — UX

Must have **zero intended happy-path UX regression**.

Specifically:

- Add opens drawer immediately.
- Drawer layout unchanged.
- Existing animation unchanged.
- Existing quantity stepper unchanged.
- Gift dialog behavior unchanged.
- Existing empty state unchanged.
- Existing checkout CTA unchanged visually.
- No new happy-path spinner.
- No new cart page.
- No new totals sections.
- Header count behaves as before.

---

# 119. Definition of Done — Security

Must verify:

```text
private Storefront token
→ server only

full cart ID secret
→ HttpOnly server cookie only

gift message
→ not logged

cart mutation API
→ same-origin protected

Shopify requests
→ buyer IP forwarded appropriately
```

---

# 120. Definition of Done — Technical

Must verify:

- Existing lint passes.
- Existing typecheck passes.
- Existing tests pass.
- New unit tests pass.
- Integration tests pass.
- E2E cart tests pass.
- Cart API `no-store`.
- No GraphQL duplicated across UI components.
- No private token client-side.
- No local price authority.
- No array-index identity for gift units.
- Pagination supported.
- Mutation warnings parsed.
- Mutation userErrors parsed.
- Mutation queue race tests pass.

---

# 121. Launch gates

Production MUST NOT release until all 5 gates pass.

### Gate A — Shopify Markets

Confirm Shopify Admin actually has:

```text
France
United States
```

configured as expected.

Confirm actual currencies/prices.

---

### Gate B — Gift metadata

Run checkout/order and inspect whether:

```text
_mr_*
```

attributes are exposed to customer.

Must explicitly approve result.

---

### Gate C — Payment checkout

At least one valid Shopify checkout test must reach expected payment/test-payment stage using target store configuration.

---

### Gate D — Multi-market

Manual verify:

```text
FR:
PDP → Cart → Checkout

US:
PDP → Cart → Checkout
```

No unexpected currency jump.

---

### Gate E — Gift identity

Create ≥3 gift units with different messages.

Perform:

```text
edit
remove middle
refresh
add another item
change region
checkout
```

Messages must still map đúng physical unit.

---

# 122. Acceptance matrix

| Requirement | Expected |
|---|---|
| Add Caviar | Drawer opens immediately |
| Add same variant | Quantity increments |
| Add different variant | Separate row |
| Refresh | Cart persists |
| Gift qty 3 | 3 physical rows |
| Gift message | Independent per row |
| Remove gift row | Only target row removed |
| Inventory | Scoped by merchandiseId |
| Total | Shopify subtotal |
| Currency | Shopify market currency |
| Region change | Cart preserved + repriced |
| Locale change | Current locale used |
| Shopify warning | Reconciled, not treated as failure |
| Network unknown result | No blind duplicate mutation |
| Checkout | Fresh Shopify checkoutUrl |
| Cart ID secret | Never exposed |
| Private token | Server only |
| Catalog cache | Not coupled to cart session |
| UI | No intended happy-path changes |

---

# 123. Final technical decision

Architecture được chốt:

```text
Existing Maison UI
       │
       ▼
Existing Cart interaction model
       │
       ▼
Refactored CartProvider
       │
       ├── optimistic state
       ├── mutation queue
       └── reconciliation
       │
       ▼
Narrow Next.js APIs
       │
       ▼
Server-only CartService
       │
       ▼
Shopify Storefront Cart API
       │
       ▼
Shopify Cart
       │
       ▼
Fresh checkoutUrl
       │
       ▼
Shopify Hosted Checkout
```

Không rewrite UI.

Không thay product/cart UX bằng Hydrogen Cart components.

Không đưa Shopify GraphQL vào components.

Không đưa cart secret ra browser.

Không dùng browser-calculated price làm commerce truth.

Không model Gift Set thành quantity > 1.

Không rely vào Shopify auto-merge để enforce business rule.

---

# 124. Implementation priorities

Thứ tự dependency cuối cùng:

```text
1. Cart domain model
      ↓
2. Shopify Cart service
      ↓
3. Cookie persistence
      ↓
4. Cart API
      ↓
5. Caviar sync
      ↓
6. Gift physical-unit model
      ↓
7. Gift message persistence
      ↓
8. Optimistic queue/reconciliation
      ↓
9. Region + market synchronization
      ↓
10. Checkout
      ↓
11. Error/warnings
      ↓
12. E2E + Shopify Admin verification
      ↓
13. Production rollout
```

---

# 125. Final acceptance statement

Implementation chỉ được coi là hoàn tất khi có thể chứng minh:

```text
UI cart hiện tại
=
Shopify Cart state
=
Shopify Checkout state
```

với ba invariant quan trọng nhất:

```text
1. merchandise identity đúng

2. market / currency đúng

3. gift physical unit ↔ gift message luôn 1:1
```

Nếu ba invariant trên giữ được trong cả:

```text
refresh
quantity update
remove
region change
locale change
inventory adjustment
network reconciliation
checkout
```

thì feature đủ điều kiện production.