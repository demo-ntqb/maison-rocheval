# F03 — Products listing theo Figma `3:8034`

## Bối cảnh và source of truth

- Figma file: `Untitled`.
- Node gốc được yêu cầu: `3:8033` (Section `Shop`, 3448×5651).
- Screen triển khai: `3:8034` (frame `Shop`, 1400×4396).
- Screen loại khỏi scope: `3:8058` (frame `Shop`, 1400×5830) vì đây là product detail/PDP.
- Screenshot chuẩn: `.delivery/evidence/F03-figma-products-listing-3-8034.png`.

## Vấn đề

Route Products hiện có bản dựng sơ bộ nhưng chưa tuân thủ kiến trúc screen `products`, chưa có localized page metadata riêng, Product grid vẫn là Client Component dù listing không cần state, product content còn nằm trong shared constant và fidelity/asset contract chưa được kiểm chứng đầy đủ theo yêu cầu mới.

## Phạm vi

### Trong phạm vi

- Route localized `/[locale]/products` dưới App Router.
- Thin page composition từ `@/screens/products`.
- Shared Header, Announcement Bar và Footer hiện có.
- Catalog gồm 5 product cards theo layout desktop Figma: content width 1000px, card 312×540, 3 cột rồi 2 cột, gap 32px/54px.
- Editorial block: heading, paragraph, CTA và ảnh 1000×700.
- FAQ block: illustration, heading, 5 accordion rows và CTA.
- Localized copy cho English/French và page metadata đầy đủ.
- Native `<picture>/<img>` contract với AVIF, WebP và fallback; không dùng `next/image`.
- Responsive mobile-first cho 320/360/414/768/1024/1280/1536.
- Plumb tags và visual verification đối chiếu node `3:8034`.

### Ngoài phạm vi

- Product detail `3:8058`.
- Cart state, checkout, backend/API, authentication, search hoặc filter/sort behavior không xuất hiện trong listing Figma.
- Thay đổi thiết kế trong Figma.

## Cấu trúc Figma đã xác nhận

1. Announcement Bar: 1400×42.
2. Header: 1400×80.
3. Main content wrapper: 1400×3646, padding top 100/bottom 200, gap section 200.
4. Catalog: 1000×1206, nhãn `5 items`, hai hàng card 540px.
5. Editorial: 1000×908, content 500×154, gap 54, ảnh 1000×700.
6. FAQ: 1000×832, gap 54, illustration 131×80, 5 rows tổng 542px.
7. Shared Footer: 1400×628.

## Kiến trúc

```text
src/app/[locale]/products/page.tsx
src/screens/products/
  sections/products-hero.section.tsx
  sections/products-catalog.section.tsx
  sections/products-editorial.section.tsx
  sections/products-faq.section.tsx
  components/products-product-card.tsx
  components/products-product-grid.tsx
  constants/products.constant.ts
  types/products.type.ts
  index.ts
src/shared/components/layout/mobile-menu.tsx
src/app/icon.svg
```

Header/Footer tiếp tục thuộc localized layout. `index.ts` chỉ export sections. Product card/grid là screen-scoped vì không có screen thứ hai dùng component này.
Mobile Sheet được interaction-gate trong một shared client leaf để không tải Dialog runtime trước khi người dùng mở menu.

## Acceptance criteria

1. `/en/products` và `/fr/products` render thành công; route file chỉ compose sections từ `@/screens/products`.
2. Desktop 1400px giữ đúng hierarchy, content width, card dimensions, grid, spacing và section order của `3:8034`.
3. Có đúng một `<h1>`; vì Figma không có visible page title, H1 localized được giữ `sr-only` để không thêm copy ngoài thiết kế.
4. Product list dùng semantic list; card dùng article/heading/link đúng vai trò.
5. Product content không hardcode trong section JSX và localized copy tồn tại ở mọi locale.
6. Metadata Products có title, description, canonical, Open Graph và Twitter cho từng locale.
7. Không có `next/image`; mọi raster render qua AVIF/WebP/fallback với integer dimensions, sizes, alt và decoding.
8. Ảnh product đầu tiên là LCP candidate: eager + high priority; các ảnh còn lại lazy-load.
9. Không horizontal overflow ở 320, 360, 414, 768, 1024, 1280 và 1536px; grid chuyển 1→2→3 cột theo không gian thực tế.
10. Keyboard focus rõ ràng, touch target tối thiểu 44px và accordion dùng shared shadcn/Radix primitive.
11. BDD/TDD evidence, `pdh gate`, lint, typecheck và build đều pass.
12. Plumb visual verification đạt score ≥90 nếu coverage của tool cho phép; nếu score bị giới hạn bởi leaf/vector coverage, phải ghi score và delta trung thực.
13. Lighthouse mobile/desktop: Performance, Accessibility, Best Practices và SEO đều ≥90.

## Responsive inference

Figma chỉ cung cấp desktop 1400px. Mobile được suy luận từ auto-layout và hierarchy: content gutters 16/24px, card 1 cột ở mobile, 2 cột khi card có thể giữ chiều rộng đọc được, 3 cột từ desktop; section spacing giảm tương xứng nhưng không thay đổi thứ tự hoặc copy.

## Metrics

- Business baseline/target: unknown, measurement-required.
- Technical gates lấy trực tiếp từ acceptance criteria và repository governance; không tự đặt thêm business target.
