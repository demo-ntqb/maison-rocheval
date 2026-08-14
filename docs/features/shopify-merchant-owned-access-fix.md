# B01: Sửa access cho Shopify merchant-owned custom data

## Vấn đề

`shopify:provision:apply` gửi `access.admin: MERCHANT_READ_WRITE` khi tạo
merchant-owned metaobject definitions (tại thời điểm B01 gồm `caviar_species` và
`presentation_option`; species được migrate sang Product metafields ở thay đổi sau).
Shopify từ chối input bằng `ADMIN_ACCESS_INPUT_NOT_ALLOWED`, vì `access.admin`
chỉ cấu hình được cho app-owned types có prefix `$app:`.

Merchant-owned metafield definitions trong namespace `rocheval` dùng cùng input
sai và có thể thất bại ở phase kế tiếp.

## Phạm vi

### IN

- Không gửi `access.admin` cho merchant-owned metaobject definitions.
- Không gửi `access.admin` cho merchant-owned metafield definitions.
- Giữ `access.storefront: PUBLIC_READ`.
- Thêm regression test ở mutation input boundary.

### OUT

- Đổi types/namespaces sang app-owned `$app:`.
- Thay đổi manifest, product data hoặc Shopify scopes.
- Tự động chạy lại `apply` vào store thật.

## Acceptance criteria

1. Create/update metaobject definition input chỉ chứa `access.storefront`.
2. Create/update metafield definition input chỉ chứa `access.storefront`.
3. Các provisioning tests, lint, typecheck và build vẫn pass.
4. Admin GraphQL documents vẫn hợp lệ với schema `2026-07`.

## Test plan

- Fake Admin client capture variables của metaobject/metafield definition upserts.
- Assert `access` bằng `{ storefront: "PUBLIC_READ" }` và không có `admin`.
- Chạy focused provisioning suite rồi repository gates.

## Metrics

- name: `b01_apply_definition_success`
  baseline: unknown
  target: unknown
  source: proposed
  status: awaiting_approval
  measurement_required: true
