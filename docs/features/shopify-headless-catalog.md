# F07: Tích hợp catalog Shopify Headless vào storefront

## Vấn đề

Shopify Storefront client và catalog đã được provision, nhưng Home, Products và
Product Detail vẫn render từ nhiều bộ mock data khác nhau. Giá, variant, media,
translation và custom data trong Shopify vì vậy chưa phải source of truth của UI.

## Phạm vi IN

- Đọc collection `featured-caviar` cho Home và `our-caviar` cho Products.
- Đọc product detail theo canonical Shopify handle.
- Map variants, media, direct species Product metafields, presentation
  options và related product references sang view model serializable.
- Giữ Shopify collection order và locale context EN/FR thuộc France market.
- Dùng giá variant thật; không nội suy giá theo multiplier.
- Canonical product metadata, Product JSON-LD, 404 và redirect legacy handles.
- Responsive native Shopify CDN images.
- Cache tags và webhook endpoint xác thực HMAC để revalidate catalog.
- Sitemap/robots chứa các localized product URLs.

## Phạm vi OUT

- Storefront Cart API và Shopify Checkout.
- Ghi inventory hoặc thay đổi live Shopify resources.
- Customer Account, search, analytics và online-store theme.
- Upload thêm gallery media; UI phải render đúng số ảnh Shopify hiện có.

## Acceptance criteria

1. Home render đúng thứ tự `amour, lexpression, harmonie` từ
   `featured-caviar`.
2. Products render đúng 5 canonical handles từ `our-caviar`, không dùng card
   copy mock.
3. Product detail dùng Shopify title, translated Product metafields gồm species,
   variants, variant IDs, prices EUR, image và related products.
4. Size selection đổi sang đúng Shopify variant và giá; unavailable variant
   không thể Add to cart trong phase này.
5. Legacy handles redirect vĩnh viễn; unknown handle trả 404/noindex.
6. Metadata, canonical, OG image, Product JSON-LD và sitemap lấy từ Shopify.
7. Catalog reads dùng cache tags theo collection/product/locale.
8. Webhook chỉ revalidate sau khi HMAC, shop domain và topic hợp lệ; invalid
   signature trả 401.
9. Không có Shopify credential trong Client Components hoặc response payload.
10. Lint, typecheck/GraphQL validation, tests, build và Lighthouse gates pass.

## Rủi ro

- Shopify hiện trả `availableForSale: false` cho mọi variant vì inventory chưa
  được cấu hình; UI phải phản ánh đúng, không giả lập khả dụng.
- Product hiện chỉ có một Shopify image; gallery không được chèn mock image.
- Webhook delivery có thể trùng hoặc sai thứ tự; handler chỉ làm idempotent tag
  invalidation và time-based cache vẫn là reconciliation fallback.

## Test plan

- BDD source contract cho data ownership, routes, SEO và webhook boundary.
- Unit tests cho metafield/rich-text mapper, collection order, variants,
  presentation options, legacy handles và HMAC.
- Live Storefront smoke test EN/FR bằng credentials hiện có.
- `yarn lint`, `yarn typecheck`, affected tests, `yarn build`, Lighthouse mobile
  và desktop.

## Metrics

- name: `f07_shopify_backed_catalog_surfaces`
  baseline: `0/3`
  target: `3/3`
  source: derived
  status: approved-by-spec
  measurement_required: true
- name: `f07_catalog_runtime_errors`
  baseline: unknown
  target: unknown
  source: proposed
  status: awaiting_approval
  measurement_required: true
