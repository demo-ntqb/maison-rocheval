# B03: Chuẩn hóa Shopify decimal khi kiểm tra convergence

## Vấn đề

Shopify lưu `number_decimal` theo canonical string (`32.00` thành `32.0`). Verifier
so sánh string tuyệt đối với manifest nên báo drift vĩnh viễn cho presentation
options dù numeric value không đổi.

## Phạm vi

- So sánh `number_decimal` theo numeric value hữu hạn.
- Giữ exact comparison cho các field types khác.
- Không thay đổi manifest hoặc ghi lại decimal chỉ vì formatting.

## Acceptance criteria

1. `0.00` bằng `0.0`, `32.00` bằng `32.0` cho `number_decimal`.
2. Decimal có numeric value khác vẫn tạo drift.
3. Text values vẫn exact.
4. Live plan không còn presentation option drift sau fix.

## Metrics

- name: `b03_decimal_false_drift`
  baseline: unknown
  target: unknown
  source: proposed
  status: awaiting_approval
  measurement_required: true
