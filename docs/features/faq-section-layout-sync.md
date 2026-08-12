# F02 — Đồng bộ layout FAQ

## Vấn đề

FAQ trên route Products đang dùng chiều cao cố định ở cả wrapper trang và wrapper section. Khi nội dung localized hoặc viewport thay đổi, chiều cao này có thể tạo khoảng trắng dư, cắt nội dung hoặc làm chồng lấn Footer.

## Phạm vi

### Trong phạm vi

- Bỏ chiều cao cố định `3646px` khỏi content wrapper của Products.
- Bỏ chiều cao cố định `846px` khỏi FAQ wrapper của Products.
- Đồng bộ FAQ Products với pattern responsive đang dùng ở các screen khác: full-width, nền trắng, `py-24` trên mobile và `200px` trên desktop.
- Giữ nguyên nội dung, link và shared `FaqSection`.

### Ngoài phạm vi

- Thay đổi nội dung FAQ.
- Thay đổi interaction của accordion.
- Thiết kế lại Product catalog, editorial hoặc Footer.

## Acceptance criteria

1. Content wrapper của `/products` không có fixed height.
2. FAQ wrapper của `/products` không có fixed height và chiếm đủ chiều rộng.
3. FAQ wrapper dùng responsive vertical padding `py-24 lg:py-[200px]`.
4. Shared `FaqSection`, localized content và CTA hiện tại được giữ nguyên.
5. Lint, typecheck và build pass.

## Kiểm thử

- BDD source-contract kiểm tra wrapper Products và FAQ.
- Lint, typecheck và production build.

## Chỉ số

Baseline và target business: unknown; measurement-required. Giá trị của thay đổi được xác nhận bằng việc loại bỏ fixed-height overflow risk và qua responsive verification.
