# B02: Sửa required input cho Shopify metaobject fields

## Vấn đề

Provisioning đang encode `field.required` thành validation `{ name: "required", value: "true" }`.
Shopify Admin API `2026-07` không hỗ trợ validation tên `required` cho
`single_line_text_field`; `required` là boolean property trực tiếp của
`MetaobjectFieldDefinitionCreateInput` và `MetaobjectFieldDefinitionUpdateInput`.

## Phạm vi

### IN

- Map manifest `required` thành field input property `required` cho create/update.
- Không tạo validation `required`.
- Query và convergence checker đọc `fieldDefinitions.required` trực tiếp.
- Thêm regression tests cho input và state contract.
- Sau khi verification pass, chạy live `apply` theo yêu cầu của user.

### OUT

- Thay đổi các validations hợp lệ khác hoặc data model.
- Xóa/rollback Shopify resources.

## Acceptance criteria

1. Required field input dùng `required: true`, không dùng validation tên `required`.
2. Optional field input dùng `required: false`.
3. Create và update paths cùng tuân thủ contract.
4. Snapshot query đọc `required` và convergence so sánh property này.
5. Focused tests, repository gates và Admin schema validation pass.
6. Live apply hoàn tất hoặc dừng an toàn với lỗi cụ thể tiếp theo; sau success, verify trả zero drift.

## Test plan

- Capture variables của create/update metaobject definition mutations.
- Assert `required` booleans và absence của `validations: [{name: "required"}]`.
- Static contract kiểm tra snapshot query có `required`.
- Chạy provisioning, CI, lint, typecheck, build và schema validation.

## Metrics

- name: `b02_apply_definition_success`
  baseline: unknown
  target: unknown
  source: proposed
  status: awaiting_approval
  measurement_required: true
