# F06: Shopify Catalog Provisioning CLI

## Bối cảnh

Storefront đã có Shopify Hydrogen client và kết nối được với Shopify, nhưng Shop, Home và PDP vẫn đọc product data từ constants cùng `messages/*.json`. Shopify store hiện chưa có product catalog để storefront consume.

Feature này tạo một CLI provisioning dùng Shopify Admin GraphQL API để đưa desired state có version control vào bất kỳ Shopify store nào được chỉ định bằng environment variables. CLI không nằm trong Next.js runtime và không phân biệt dev/production bằng logic trong code.

## Quyết định sản phẩm đã chốt

- `Amur` và `Amour` là cùng một sản phẩm; canonical handle là `amour`.
- Catalog có 5 handles theo thứ tự: `amour`, `kaluga`, `russian-hybrid`, `lexpression`, `harmonie`.
- `our-caviar` chứa 5 sản phẩm theo thứ tự trên.
- `featured-caviar` chứa `amour`, `lexpression`, `harmonie`.
- Mỗi caviar product có size variants `30g`, `50g`, `125g`, `250g` với price/SKU/weight mock.
- Packaging: Standard €0, Premium €32, Luxury €74. Premium/Luxury là variants của add-on product `presentation-box`; Standard không tạo paid variant.
- Nội dung hỗ trợ EN và FR. CLI dùng primary locale hiện tại của Shopify làm source content và đăng ký locale còn lại bằng Translation API.
- Store đích chỉ được xác định từ env; không có hardcode hoặc guard theo tên môi trường.

## Phạm vi

### IN

- Admin GraphQL client pin API version `2026-07`.
- Auth bằng `SHOPIFY_ADMIN_ACCESS_TOKEN`, hoặc client credentials qua `SHOPIFY_ADMIN_CLIENT_ID` + `SHOPIFY_ADMIN_CLIENT_SECRET`.
- Store domain lấy từ `SHOPIFY_ADMIN_STORE_DOMAIN`, fallback sang `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` để tương thích cấu hình hiện tại.
- Ba command public:
  - `yarn shopify:provision:plan`: read-only, in deterministic diff.
  - `yarn shopify:provision:apply`: apply create/update được quản lý.
  - `yarn shopify:provision:verify`: read-only, fail nếu desired state chưa hội tụ.
- Merchant-owned Product metafield definitions trong namespace `rocheval`, storefront `PUBLIC_READ`.
- Metaobject definition `presentation_option`, merchant-editable, storefront `PUBLIC_READ`, publishable và translatable.
- Scientific name và species description được lưu trực tiếp trên Product metafields; mock metaobject entries chỉ còn presentation options.
- Tạo product chưa tồn tại bằng stable handle và seed variants option `Size`; product hiện hữu chỉ cập nhật managed scalar fields, không ghi inventory quantities.
- Upsert product metafield values, gồm species fields trực tiếp và related product references.
- Manual collections `our-caviar` và `featured-caviar` với thứ tự merchandising đã chốt.
- Publish products, collections và active metaobjects lên Headless storefront khi publication tồn tại.
- EN/FR translations cho fields được khai báo trong manifest.
- Upload product image từ local `public/` bằng staged upload khi product chưa có desired media.
- Dry-run mặc định; không delete Shopify resources.
- Unit/contract tests không cần Shopify credentials hoặc network.

### OUT

- Refactor Shop/PDP/Home để consume catalog vừa provision.
- Cart, checkout, Customer Account API và inventory quantity synchronization.
- Provision toàn bộ Home/About/FAQ/editorial metaobjects và Shopify menus.
- Shipping profiles, Markets configuration, tax, locations và fulfillment rules.
- Xoá resources không còn trong manifest hoặc xoá content do merchant tạo.
- Tự động chạy provisioning trong Next.js build, Vercel deployment hoặc request runtime.
- Tự động apply vào Shopify thật trong test/CI.

## Desired state

### Products

| Handle | Product | Collection line | Related handles |
| --- | --- | --- | --- |
| `amour` | Amour Caviar | Patrimoine | `lexpression`, `harmonie`, `kaluga` |
| `kaluga` | Kaluga Caviar | Patrimoine | `amour`, `lexpression`, `russian-hybrid` |
| `russian-hybrid` | Russian Hybrid Caviar | Patrimoine | `kaluga`, `harmonie`, `amour` |
| `lexpression` | L’Expression | Réserve | `amour`, `harmonie`, `kaluga` |
| `harmonie` | Harmonie | Assemblage | `lexpression`, `amour`, `russian-hybrid` |

Mỗi product mới được seed 4 variants với SKU deterministic dạng
`MR-<PRODUCT>-<GRAMS>`. Mock prices là EUR market seed data. Sau lần create,
prices, variants và product options là merchant-owned: plan/verify không xem thay
đổi của merchant là drift và apply không gửi chúng lại qua `productSet`.

### Product metafields

- `rocheval.short_description`: `multi_line_text_field`
- `rocheval.collection_line`: `single_line_text_field`
- `rocheval.species_scientific_name`: `single_line_text_field`
- `rocheval.species_description`: `multi_line_text_field`
- `rocheval.pearl_size`: `single_line_text_field`
- `rocheval.pearl_colour`: `single_line_text_field`
- `rocheval.salt_content`: `single_line_text_field`
- `rocheval.tasting_notes`: `list.single_line_text_field`
- `rocheval.ingredients`: `multi_line_text_field`
- `rocheval.nutrition`: `rich_text_field`
- `rocheval.shelf_life`: `single_line_text_field`
- `rocheval.storage`: `rich_text_field`
- `rocheval.serving`: `rich_text_field`
- `rocheval.related_products`: `list.product_reference`

Tất cả managed Product metafield definitions được pin để Shopify Admin tự động
hiển thị chúng trên trang chỉnh sửa product. Provisioning xem definition chưa pin
là drift và dùng `metafieldDefinitionPin` để hội tụ.

### Collections

- `our-caviar`: `amour`, `kaluga`, `russian-hybrid`, `lexpression`, `harmonie`.
- `featured-caviar`: `amour`, `lexpression`, `harmonie`.

## Safety invariants

1. `plan` và `verify` không gửi GraphQL mutation.
2. CLI không log access token, client secret hoặc request headers.
3. `apply` không gọi delete mutation và không ghi inventory quantities.
4. `productSet` chỉ dùng khi product chưa tồn tại; product hiện hữu dùng `productUpdate` không chứa prices, variants hoặc product options.
5. Upsert metafields tách khỏi `productSet`, tránh list replacement xoá metafields ngoài phạm vi `rocheval`.
6. Media hiện hữu được giữ lại; CLI chỉ thêm desired media còn thiếu.
7. Apply có thể chạy lại; khi current state trùng desired state, plan trả về zero changes.
8. Type/owner/key conflict của definition là hard error vì Shopify không cho đổi các thuộc tính này an toàn.
9. Desired translation key thiếu digest trong `translatableContent` là hard error; field non-translatable phải được khai báo rõ trong manifest.
10. GraphQL top-level errors và `userErrors` luôn làm command thất bại với resource context.

## Observable Acceptance Criteria

1. Manifest chứa đúng 5 canonical product handles, 4 size variants/product và 2 collections đúng thứ tự.
2. Manifest chứa `presentation-box` với Premium €32 và Luxury €74; Standard €0 được biểu diễn là presentation option, không phải paid variant.
3. Manifest lưu scientific name/species description trực tiếp trên mỗi caviar product, pin các Product metafield definitions trong Shopify Admin và không tạo `caviar_species`.
4. Existing product giữ nguyên merchant-owned prices, variants và product options; product mới vẫn seed canonical variants.
5. `plan` đọc current Shopify state và in các action có thứ tự dependency; read-only client chặn mutation bằng GraphQL AST.
6. Empty state tạo plan gồm definitions → metaobjects → products → metafields/media → collections → translations/publication.
7. State đã hội tụ tạo plan rỗng; chạy apply lần hai không tạo duplicate.
8. `apply` chỉ chạy khi command được chỉ định rõ và dùng duy nhất store domain từ env.
9. Client hỗ trợ static Admin token và client-credentials token acquisition, pin endpoint `/admin/api/2026-07/graphql.json`.
10. `verify` trả exit code khác 0 khi còn drift và exit code 0 khi đã hội tụ.
11. Không có delete mutation hoặc inventory quantity mutation trong provisioning operations.
12. `.env.example` và README mô tả credentials, scopes và workflow plan/apply/verify nhưng không chứa secret.
13. `yarn lint`, `yarn typecheck`, focused provisioning tests và `yarn build` pass.

## Required Admin API scopes

- `read_products`, `write_products`
- `read_metaobjects`, `write_metaobjects`
- `read_metaobject_definitions`, `write_metaobject_definitions`
- `read_files`, `write_files`
- `read_publications`, `write_publications`
- `read_translations`, `write_translations`
- `read_locales`

## Affected modules

- `scripts/shopify/provision/**`: manifest, Admin client, planner, executor và CLI.
- `scripts/shopify/migrations/remove-caviar-species.mjs`: cleanup legacy riêng biệt, mặc định read-only plan.
- `package.json`: public commands và provisioning test command.
- `.env.example`: Admin API environment contract.
- `README.md`: operator workflow và required scopes.
- `tests/features/shopify-catalog-provisioning.feature`: executable behavior contract.
- `tests/bdd/shopify-catalog-provisioning.test.mjs`: public/source contract.
- `tests/unit/shopify-provisioning.test.mjs`: manifest, planner và client behavior.

## Test plan

- BDD contract kiểm tra public scripts, dry-run/apply separation, desired catalog và safety invariants.
- Unit tests kiểm tra manifest invariants, deterministic dependency order, no-op convergence, auth modes, endpoint version và error redaction.
- Migration tests kiểm tra dry-run, full legacy-schema/entry/translation guards, exact confirmation, idempotent no-op và post-delete verification.
- Contract tests dùng fake Admin transport để kiểm tra query/mutation boundary mà không gọi Shopify thật.
- Static scan bảo đảm không có delete/inventory mutations.
- Fresh verification: provisioning tests, lint, typecheck, toàn bộ repository build và delivery gate.

## Metrics

- name: `f06_provisioning_convergence`
  baseline: unknown
  target: unknown
  source: proposed
  status: awaiting_approval
  measurement_required: true
