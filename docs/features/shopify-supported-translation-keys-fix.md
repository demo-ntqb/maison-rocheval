# B04: Chỉ đăng ký Shopify translation keys được hỗ trợ

## Vấn đề

Metaobject `presentation_option` có field boolean `personalized_message` trong
manifest, nhưng Shopify không đưa field này vào `translatableContent`. Executor
vẫn gửi key đó cho Translation API nên live apply dừng giữa chừng.

## Phạm vi

- Lấy allowlist key từ `translatableContent` của từng resource.
- Chỉ register và verify các desired values có key nằm trong allowlist.
- Không bỏ qua lỗi API đối với các key hợp lệ hoặc các resource không tồn tại.

## Acceptance criteria

1. Field text có digest được đăng ký translation bình thường.
2. Field boolean/non-translatable không được gửi trong mutation.
3. Verify không báo drift vì một desired key mà Shopify không hỗ trợ dịch.
4. Live apply và verify hội tụ.

## Metrics

- name: `b04_unsupported_translation_failures`
  baseline: unknown
  target: unknown
  source: proposed
  status: awaiting_approval
  measurement_required: true
