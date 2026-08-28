# Kế hoạch triển khai Shopify Markets cho FR, US và SG

## 1. Trạng thái tài liệu

- Ngày lập: 2026-08-28.
- Phạm vi business: France (`FR`), United States (`US`), Singapore (`SG`).
- Ngôn ngữ ứng dụng hiện có: English (`EN`) và French (`FR`).
- Trạng thái: kế hoạch triển khai; chưa thay đổi production code hoặc Shopify Admin.
- Nguồn sự thật về market khả dụng: Storefront API `localization`, không phải danh sách hardcode và không phải Admin API trong request của khách hàng.

## 2. Mục tiêu

Sau khi hoàn thành:

1. Merchant có thể activate, deactivate hoặc cập nhật market `FR`, `US`, `SG` trong Shopify Admin mà không cần sửa source code.
2. Country/language selector chỉ hiển thị tổ hợp thực sự được publish cho Headless Storefront channel.
3. URL, next-intl, Hydrogen request context, Storefront `@inContext`, cache và Shopify Cart sử dụng cùng một commerce context.
4. Currency và contextual price luôn lấy từ Shopify; app không tự suy currency từ locale/country.
5. Thay đổi Markets/locales trong Admin làm cache hết hạn qua webhook; TTL 10 phút là fallback nếu webhook đến trễ.
6. Nội dung được dịch không còn được dùng làm machine identifier hoặc route identity.

## 3. Không nằm trong phạm vi

- Tự động hỗ trợ country ngoài `FR`, `US`, `SG`.
- Tự động hỗ trợ một app-shell language mới ngoài `EN`/`FR`; ngôn ngữ mới vẫn cần message catalogs và một deployment.
- B2B/company-location markets hoặc market dựa trên buyer identity ngoài country.
- Refactor toàn bộ Shopify service/domain layer.
- Đổi Hydrogen version, Storefront API version hoặc cache owner khỏi Next.js.
- Thiết kế lại UI ngoài những thay đổi cần thiết cho country/language selector và trạng thái price/cart.

## 4. Quyết định kiến trúc

### 4.1. Ba lớp trách nhiệm

| Lớp | Trách nhiệm |
| --- | --- |
| Code | Allowlist `FR/US/SG`, app languages `EN/FR`, route parsing và fallback policy |
| Shopify Admin | Market active/published, available languages, currency, catalog và contextual pricing |
| URL | Commerce context hiệu lực của request hiện tại |

`localStorage` chỉ lưu preference để gợi ý/điều hướng. Nó không được quyết định context server-side.

### 4.2. Commerce context

Mọi boundary dùng cùng kiểu dữ liệu:

```ts
type CommerceContext = {
  routeLocale: "en-fr" | "fr-fr" | "en-us" | "fr-us" | "en-sg" | "fr-sg";
  appLocale: "en" | "fr";
  country: "FR" | "US" | "SG";
  language: "EN" | "FR";
};
```

Sáu tổ hợp được route layer hiểu sẵn để merchant có thể bật/tắt language trong Shopify mà không cần deploy lại. UI chỉ hiển thị tổ hợp thuộc giao của:

```text
Shopify availableCountries
∩ countries [FR, US, SG]
∩ app languages [EN, FR]
```

Canonical mặc định theo country:

| Country | Canonical mặc định |
| --- | --- |
| France | `fr-fr` |
| United States | `en-us` |
| Singapore | `en-sg` |

Default toàn site ban đầu: `en-sg`, vì Headless channel hiện chỉ expose `SG/SGD`.

### 4.3. URL

Route dùng một BCP-47-like segment:

```text
/fr-fr/products/...
/en-us/products/...
/en-sg/products/...
```

Giữ `localePrefix: "as-needed"`; `/` là alias của `en-sg`. Mọi route context khác phải có prefix rõ ràng để cache, canonical và crawler không phụ thuộc cookie/header.

Dự án chưa production nên không triển khai legacy URL migration. `/fr/*` và mọi route context không hợp lệ/không active trả `not-found` trước khi gọi Shopify catalog. Chỉ các route context mới, hợp lệ và đang active được render.

### 4.4. Currency và price

- `MoneyV2.amount` và `MoneyV2.currencyCode` từ Shopify là nguồn sự thật.
- Không giữ mapping `FR → EUR`, `US → USD`, `SG → SGD` trong app logic.
- Formatter phải hiển thị currency code khi ký hiệu mơ hồ; `SGD` và `USD` không được cùng xuất hiện dưới dạng `$` đơn độc.
- Cart total phải lấy từ Shopify Cart cost sau khi cart transport được triển khai.

### 4.5. Stable routing identity

Không dùng `Product.productType` cho routing vì Shopify dịch trường này (`Gift Set` → `Coffret Cadeau`).

Route category được xác định bằng collection handle ổn định:

- `caviar`
- `gift-set`

Catalog queries lấy collection membership/handles cần thiết. Mapper trả về stable category; `ProductCard` và product detail validation không đọc translated `productType` để xây URL.

## 5. Mô hình runtime mục tiêu

```text
Request URL
  → parse CommerceContext
  → load next-intl messages bằng appLocale
  → Hydrogen requestContext.i18n(country, language)
  → Storefront API @inContext(country, language)
  → Shopify chọn market/currency/contextual pricing
  → cache theo routeLocale/country/language
  → UI format MoneyV2 bằng appLocale + currencyCode
```

Luồng Admin update:

```text
Merchant cập nhật Shopify Markets/locales
  → markets/* hoặc locales/update webhook
  → invalidate shopify-localization + shopify-market-context
  → request kế tiếp query Storefront localization
  → selector, price và catalog context cập nhật
```

## 6. Acceptance criteria

### 6.1. Localization và routing

- `FR`, `US`, `SG` là ba country duy nhất app có thể expose.
- Selector phản ánh `localization.availableCountries` và `availableLanguages`; không đọc danh sách country hardcode để quyết định availability.
- URL không hợp lệ, legacy hoặc thuộc market đã bị disable trả `not-found` trước khi gọi Shopify catalog.
- Preference cũ không thể ép app vào market không còn khả dụng.
- URL, `<html lang>`, Open Graph locale, canonical và hreflang nhất quán.

### 6.2. Shopify context

- Với mỗi route, outgoing Storefront request chứa đúng `country` và `language` sau khi Hydrogen xử lý variables.
- Không còn static request context `EN/FR` làm ghi đè route locale.
- Storefront response country/currency được kiểm tra; fallback bất ngờ của Shopify phải được log ở server và không được trình bày như market đã chọn thành công.

### 6.3. Pricing và cart

- Product/variant price hiển thị đúng `currencyCode` Shopify trả về.
- Không có empty-cart currency hardcode trái với commerce context.
- Khi đổi country, Shopify Cart buyer identity được cập nhật và cart được refetch/reprice.
- Nếu item không còn bán ở market mới, UI báo rõ và không giữ total cũ.

### 6.4. Routing sản phẩm

- Product type đã dịch không làm thay đổi product URL.
- `/fr-fr/products/gift-set/lexcellence` trả 200 khi product thuộc collection `gift-set`.
- Không sinh URL dạng `/products//<handle>`.

### 6.5. Admin update

- `markets/create`, `markets/update`, `markets/delete`, `locales/update` được xác thực và xử lý.
- Webhook làm invalidation cả localization discovery và catalog market context.
- Nếu webhook thất bại, TTL 10 phút bảo đảm storefront tự hội tụ về cấu hình mới.

## 7. Kế hoạch triển khai theo dependency order

### Phase 0 — Shopify baseline và external contract

#### Baseline read-only

1. Xác nhận Headless Storefront channel được gắn với đúng store/token hiện tại.
2. Query `localization` và lưu country/language/currency thực tế channel đang expose.
3. Trạng thái chỉ có `SG` là baseline hợp lệ để triển khai dynamic discovery; không giả định `FR`/`US` đã active.
4. FR/US live checks được đánh dấu `Partial` cho đến khi merchant publish các markets đó.

#### Manual Shopify rollout sau PR C

Các bước sau không chặn việc triển khai code và không được coding agent tự thực hiện:

1. Tạo hoặc activate markets cho France, United States và Singapore.
2. Publish market/catalog cho Headless Storefront channel.
3. Cấu hình currency/contextual pricing cho từng market.
4. Publish English/French theo từng country mong muốn.
5. Cấp `read_markets` và `read_locales` cho app dùng webhook.
6. Đăng ký webhook topics:
   - `markets/create`
   - `markets/update`
   - `markets/delete`
   - `locales/update`

#### Baseline evidence

Sau manual activation, lưu kết quả live smoke cho từng context:

| Requested context | Expected country | Expected currency | Available language |
| --- | --- | --- | --- |
| `fr-fr` | `FR` | Shopify response | `FR` |
| `en-us` | `US` | Shopify response | `EN` |
| `en-sg` | `SG` | Shopify response | `EN` |

Nếu Storefront API vẫn fallback FR/US về `SG`, giữ FR/US live status là `Partial`; code và deterministic tests vẫn tiếp tục dựa trên contract/fixtures. Không expose FR/US trong selector cho đến khi `localization` thực sự trả về các country đó.

### Phase 1 — Regression tests trước khi đổi contract

#### Tests cần thêm

1. Hydrogen outgoing variables:
   - `fr-fr` gửi `FR/FR`.
   - `en-us` gửi `US/EN`.
   - `en-sg` gửi `SG/EN`.
   - Test quan sát request cuối ở fetch boundary, không chỉ options truyền vào service.
2. Commerce context parser:
   - Parse đủ sáu tổ hợp.
   - Reject country/language ngoài allowlist.
3. Dynamic availability:
   - Chỉ expose giao giữa Shopify countries và allowlist.
   - Chỉ expose languages app có message catalogs.
4. Product routing:
   - `productType = "Coffret Cadeau"` vẫn tạo route `gift-set` từ collection handle.
5. Webhook tag mapping cho market/locale topics.
6. Money formatting phân biệt `SGD`, `USD`, `EUR`.

Test phải thất bại vì behavior hiện chưa tồn tại trước khi implementation tương ứng bắt đầu.

### Phase 2 — Commerce context và i18n route contract

#### File dự kiến

- `src/shared/types/commerce-context.type.ts` — types cho country/language/route context.
- `src/shared/constants/commerce-context.constant.ts` — allowlist, sáu route combinations và defaults.
- `src/shared/lib/commerce-context.ts` — parse, validate và fallback thuần túy.
- `src/i18n/routing.ts` — route locales mới.
- `src/i18n/request.ts` — map `routeLocale` về message catalog `en`/`fr`.
- `src/i18n/route-locale.ts` — trả về validated commerce route locale.
- `src/i18n/navigation.ts` — xác minh wrapper tiếp tục preserve locale/query params.
- `src/app/[locale]/layout.tsx` — `lang`, metadata locale và validation.

#### Route behavior

- `/` tiếp tục hoạt động và đại diện `en-sg`.
- `/fr/*` trả `not-found`; không có legacy URL migration trong giai đoạn development.
- Route context sai định dạng hoặc không active trả `not-found` trước khi gọi Shopify catalog.
- Query params được preserve khi người dùng đổi country/language bằng selector hoặc navigation controls.
- Không đọc `cookies()`/`headers()` trong static catalog/layout để quyết định country.

#### Verification slice

- Unit tests cho parser/fallback.
- Runtime smoke cho `/`, `/fr-fr`, `/en-us`, `/en-sg`.
- Runtime smoke xác nhận `/fr/*` và invalid/inactive contexts trả `not-found` mà không gọi Shopify catalog.
- Kiểm tra canonical/hreflang và `<html lang>`.

### Phase 3 — Dynamic Storefront localization discovery

#### File dự kiến

- `src/shared/lib/shopify/localization/localization.query.ts` — query `localization`.
- `src/shared/lib/shopify/localization/localization.service.ts` — cached discovery và filtering.
- `src/shared/lib/shopify/localization/localization.mapper.ts` chỉ tạo nếu mapping không còn rõ khi đặt trong service; tránh file/abstraction không cần thiết.
- `src/shared/types/region.type.ts` — preference chuyển sang một context duy nhất.
- `src/shared/constants/region.constant.ts` — chỉ giữ presentation metadata cần thiết như flag; không quyết định market availability.

#### Cache contract

- `"use cache"` do Next.js sở hữu.
- `cacheTag("shopify-localization", "shopify-market-context")`.
- TTL 10 phút.
- Cache key không phụ thuộc cookie/header/localStorage.

#### Failure policy

- Shopify unavailable: dùng last cached successful result nếu Next cache còn stale data.
- Không có cache: chỉ expose configured default context; không giả định FR/US active.
- Stored preference không còn active: xóa/migrate preference; không override direct URL hiện tại. Invalid/inactive route vẫn do server trả `not-found`.

### Phase 4 — Region selector và language switching

#### File dự kiến

- `src/app/[locale]/(main)/layout.tsx` — fetch cached localization options ở server và truyền xuống client leaf.
- `src/shared/components/layout/region-preference-gate.tsx`.
- `src/shared/components/layout/region-preference-dialog.tsx`.
- `src/shared/components/layout/header/language-switcher.tsx`.
- `src/shared/lib/region-preference.ts`.
- `messages/source/en/*.json`, `messages/source/fr/*.json` nếu copy cần đổi.

#### Behavior

- Dialog chọn một valid commerce context, không chọn country và language độc lập rồi tạo tổ hợp invalid.
- Đổi country điều hướng sang canonical language của country, trừ khi language hiện tại cũng available.
- Đổi language giữ country hiện tại nếu language đó available; nếu không, control không hiển thị/disabled với giải thích phù hợp.
- Storage schema được version hóa hoặc migrate từ `{countryCode, locale}` sang `{routeLocale}`.
- `localStorage` không override URL chủ đích nhiều lần trong cùng session.
- Country/language navigation giữ nguyên query params hiện tại.

#### Accessibility

- Giữ shadcn/Radix primitive hiện có.
- Touch target tối thiểu 48px trên mobile.
- Label, focus, keyboard navigation và screen-reader name không regress.

### Phase 5 — Shopify client, catalog context và cache invalidation

#### File dự kiến

- `src/shared/lib/shopify/config.ts`.
- `src/shared/lib/shopify/storefront.ts`.
- `src/shared/lib/shopify/catalog/catalog.service.ts`.
- `src/app/api/shopify/webhooks/route.ts`.
- `src/shared/lib/shopify/webhook.ts`.
- Các webhook/revalidation tests hiện có.

#### Behavior

1. `getCatalogStorefrontClient(routeLocale)` tạo client theo exact commerce context.
2. Hydrogen `requestContext.i18n` và GraphQL variables cùng một country/language.
3. Client cache key chứa country và language.
4. Catalog cache gắn broad tag `shopify-market-context` và context-specific tag.
5. Webhook market/locale invalidates:
   - `shopify-localization`
   - `shopify-market-context`
6. Không tin market webhook payload là full configuration; request tiếp theo query lại Storefront API.

#### Lưu ý working tree hiện tại

`src/shared/lib/shopify/config.ts` và `src/shared/lib/shopify/storefront.ts` đang có thay đổi chưa commit từ trước. Khi triển khai phải review/giữ lại intent đồng bộ Hydrogen context, không overwrite hoặc merge riêng thay đổi này trước Phase 6 vì localized `productType` hiện làm vỡ gift-set routes.

### Phase 6 — Stable product category và localized catalog

#### File dự kiến

- `src/shared/lib/shopify/catalog/catalog-collection.query.ts`.
- `src/shared/lib/shopify/catalog/catalog-detail.query.ts`.
- `src/shared/lib/shopify/catalog/catalog.mapper.ts`.
- `src/shared/types/catalog.type.ts`.
- `src/shared/components/composite/product-card.tsx`.
- `src/app/[locale]/(main)/products/[category]/[handle]/page.tsx`.
- Catalog/product page tests.

#### Behavior

- Query collection handles/membership cần thiết để suy stable category.
- Mapper validate category; không cast translated string thành enum.
- Product card không có fallback `category = ""`.
- Product detail validate collection/category identity, không so translated `productType`.
- English/French catalog routes dùng cùng stable handle.

### Phase 7 — Money presentation

#### File dự kiến

- `src/shared/lib/money.ts`.
- `src/screens/product-detail/lib/product-detail-configurator.ts`.
- Mọi component tự format `MoneyV2` ngoài shared helper.

#### Behavior

- Một shared formatter nhận `amount`, `currencyCode`, `appLocale`.
- Hiển thị currency code khi symbol ambiguous.
- Không suy currency từ country hoặc language.
- Giá structured data/metadata dùng cùng amount/currency Shopify trả về.
- Currency của từng market hoàn toàn do Shopify Markets Admin quyết định; app không giữ mapping country → currency.
- Khi merchant đổi market currency, `markets/update` làm hết hạn market-context cache và lần query kế tiếp hiển thị `amount`/`currencyCode` mới mà không cần deploy.

### Phase 8 — Shopify Cart và buyer context

Catalog rollout có thể hoàn tất trước Phase 8, nhưng không được tuyên bố checkout localization end-to-end hoàn thành khi cart vẫn chỉ là React state.

#### Behavior

1. Cart create sử dụng buyer identity country của commerce context.
2. Cart ID được lưu trong buyer-specific boundary; không đưa `cookies()` vào static catalog/root layout.
3. Khi đổi country:
   - gọi buyer identity update;
   - refetch/reprice cart;
   - thông báo item/price thay đổi;
   - xử lý item unavailable thay vì giữ total cũ.
4. Cart total/currency lấy từ Shopify Cart cost.
5. Checkout button điều hướng tới Shopify checkout URL hợp lệ.

#### File dự kiến

- `src/shared/components/cart/cart-provider.tsx`.
- `src/shared/components/cart/cart-drawer.tsx`.
- Shopify cart service/actions hoặc route handlers tối thiểu cần thiết.
- Cart tests cho repricing và unavailable lines.

### Phase 9 — SEO và sitemap

- Canonical URL theo active commerce context.
- Hreflang chỉ emit cho tổ hợp active và indexable.
- Sitemap sinh URL cho active contexts từ cached localization discovery.
- Chỉ route context mới và active xuất hiện trong canonical, hreflang và sitemap; legacy/invalid/inactive routes trả `not-found`.
- `openGraph.locale` và `<html lang>` dùng app language/region đúng context.

## 8. Webhook và cache matrix

| Shopify event | Cache tags cần invalidate |
| --- | --- |
| `markets/create` | `shopify-localization`, `shopify-market-context` |
| `markets/update` | `shopify-localization`, `shopify-market-context` |
| `markets/delete` | `shopify-localization`, `shopify-market-context` |
| `locales/update` | `shopify-localization`, `shopify-market-context` |
| `products/*` | Existing product tags + market context nếu contextual availability/price bị ảnh hưởng |
| `collections/*` | Existing collection tags |
| `metaobjects/*` | Existing metaobject/product tags |

Nếu một loại market-specific price/catalog update không phát webhook phù hợp trong channel thực tế, TTL 10 phút là fallback bắt buộc và cần được đo trong smoke test Admin.

## 9. Test matrix

### Unit

- Commerce context parse/serialize/fallback.
- Allowlist và intersection của Shopify countries/languages.
- Preference migration.
- Stable product category mapping.
- Money formatting cho SGD/USD/EUR bằng EN/FR.
- Webhook topic → cache tags.

### Contract/integration

- Capture outgoing Hydrogen variables tại fetch boundary.
- Storefront localization query response mapping.
- Market disabled giữa hai request làm context đó trả `not-found` trước khi gọi catalog Shopify.
- Webhook signature + topic validation + revalidation calls.
- Cart buyer identity update và repricing response.

### Browser/E2E

Tối thiểu kiểm tra:

```text
/                 → en-sg
/en-sg            → SG / EN / Shopify currency
/en-us            → US / EN / Shopify currency
/fr-fr            → FR / FR / Shopify currency
/fr-fr/products/gift-set/lexcellence → 200
/fr/...            → 404
invalid/inactive context → 404, không gọi Shopify catalog
```

Kiểm tra selector, direct URL, refresh, back/forward, query params, stored preference cũ, disabled market và mobile keyboard/touch behavior.

### Live Shopify smoke

Sau khi Admin config hoàn tất:

1. Query `localization` và xác nhận `FR`, `US`, `SG` có trong channel.
2. Query cùng một purchasable variant theo ba country contexts.
3. Xác nhận response country và currency đúng context.
4. Update market currency trong Admin.
5. Xác nhận webhook nhận 2xx.
6. Xác nhận selector/catalog hiển thị currency mới sau request kế tiếp hoặc trong TTL 10 phút.
7. Tạo cart, đổi country, xác nhận Shopify repricing và checkout currency.

## 10. Quality gates

Mỗi implementation slice chạy focused tests trước. Trước khi hoàn tất toàn bộ rollout phải chạy:

```bash
yarn messages:build
yarn messages:check
yarn lint
yarn typecheck
yarn test:unit
yarn build
yarn why react-router
yarn why vue
yarn audit
yarn shopify:check
```

Ngoài ra:

- Lighthouse mobile và desktop cho mỗi canonical primary context; tất cả categories ≥ 90.
- Test viewport 360, 414, 768, 1024, 1280, 1536.
- Không có horizontal overflow hoặc touch target dưới 44px.
- Không có request-time headers/cookies trong static catalog path.
- Không có production fallback sang mock Shopify catalog.

## 11. Rollout order

Đề xuất chia thành bốn PR/deployment độc lập nhưng dependency-ordered:

1. **PR A — Context foundation và tests**: Phases 1–3; vẫn expose SG theo Storefront response hiện tại.
2. **PR B — Route/UI/catalog correctness**: Phases 4–7; sửa stable product routing trước khi bật French catalog context.
3. **PR C — Webhooks và Shopify Admin activation**: market/locale invalidation, sau đó publish FR/US trong Admin và chạy live smoke.
4. **PR D — Cart/checkout + SEO completion**: Phases 8–9; không có legacy route migration.

Không merge riêng thay đổi làm Hydrogen trả French catalog trước khi stable category routing có regression test và fix, vì trạng thái hiện tại tạo `/products//...` và French gift-set 404.

## 12. Rollback

- Nếu FR/US pricing hoặc publication sai: deactivate market trong Shopify Admin; dynamic selector sẽ loại market sau webhook hoặc TTL 10 phút.
- Nếu route rollout lỗi: giữ `/`/`en-sg` làm default; invalid/inactive contexts tiếp tục trả `not-found`, không thêm URL compatibility logic.
- Nếu webhook lỗi: TTL 10 phút tiếp tục bảo đảm convergence; điều tra webhook mà không tắt catalog cache toàn hệ thống.
- Nếu cart repricing lỗi: không checkout bằng total client cũ; chặn checkout và refetch cart từ Shopify.
- Rollback code không được xóa hoặc ghi đè preference/cart data không thể phục hồi mà không có migration rõ ràng.

## 13. Definition of done

Hạng mục chỉ hoàn thành khi tất cả điều sau được chứng minh bằng evidence mới:

- Merchant có thể bật/tắt `FR`, `US`, `SG` và selector thay đổi không cần deploy.
- `fr-fr`, `en-us`, `en-sg` có language/country/currency đúng từ Storefront API.
- French translated catalog không làm hỏng product routing.
- Cache invalidation market/locale hoạt động và TTL fallback 10 phút được kiểm tra.
- Cart/checkout giữ đúng buyer country và Shopify-calculated currency/total.
- SEO/canonical/hreflang không tạo duplicate hoặc invalid market URL.
- Toàn bộ quality gates ở mục 10 pass.
