# Maison Rocheval — Figma sang code production-ready

## Bối cảnh và vấn đề

Repository đã có bản dựng sơ bộ cho Homepage, About the brand, About the product và Shop, nhưng cấu trúc, asset pipeline và giao diện chưa được kiểm chứng có hệ thống với Figma. Homepage hiện có một FAQ ngoài thiết kế, ảnh chỉ có WebP và nhiều phần chưa mang `data-plumb-id` nên Plumb chưa thể đo độ chính xác đầy đủ.

Nguồn thiết kế là file Figma `Untitled`, section `2:6277`. Screen triển khai thực tế của Homepage là `2:6278`.

## Phạm vi IN

- Xây design system nền tảng từ Plumb tokens trong `src/app/globals.css` và Tailwind v4 theme.
- Dùng Optima local và Space Grotesk qua `next/font`, `display: "swap"`.
- Export đúng asset được dùng, loại trùng theo checksum, tạo AVIF/WebP và giữ PNG/JPEG fallback.
- Implement và kiểm chứng lần lượt:
  - `Homepage` (`2:6278`) → `/[locale]` → `src/screens/home/`
  - `About the brand` (`3:7842`) → `/[locale]/about-the-brand` → `src/screens/about-the-brand/`
  - `About our product (option A)` (`3:7939`) → `/[locale]/about-the-product` → `src/screens/about-the-product/`
  - `Shop` (`3:8034`, `3:8058`) → `/[locale]/products` → `src/screens/shop/`; hai frame là các trạng thái của cùng route.
- Giữ `page.tsx` là composition mỏng; mặc định Server Component và chỉ dùng Client Component ở leaf có interaction.
- Dùng native `<picture>`/`<img>`, không dùng `next/image`.
- Bổ sung semantic HTML, skip link, đúng một `h1`, touch target tối thiểu 44px và internal link qua `@/i18n/navigation`.
- Gắn `data-plumb-id` cho các node có ý nghĩa để Plumb verify/fit.

## Phạm vi OUT

- Không thay đổi Figma và không dùng `plumb_studio`.
- Không triển khai checkout/cart backend ngoài trạng thái UI có trong Figma.
- Không tự tạo route cho bốn frame reference asset (`14:1313`, `15:1688`, `15:1751`, `16:1820`).
- Không ghi đè thay đổi hiện có ngoài phạm vi task.

## Design system nền tảng

- Màu: white `#FFFFFF`, off-white `#F8F8F8`, warm beige `#F6F1EB`, ink `#000000`, navy `#16222E`, gray `#636363`, border `#BCBCBC`.
- Font: Optima 400/500/700 cho display; Space Grotesk 300/400/500/700 cho sans.
- Type chính: display 84/90, display 32/32, body 14/20, label 12–14.
- Container desktop: 1000px trong canvas 1400px.
- Spacing nổi bật: 8, 12, 16, 24, 32, 54, 64, 100, 150, 200px.
- Radius chính: 2px.
- Breakpoint kiểm chứng: 360, 414, 768, 1024, 1280, 1536px.

## Component ownership

- Layout shared: Header, Footer, Container, SectionWrapper.
- Composite shared khi có từ hai screen dùng: ProductCard/ProductShowcase, EditorialContentBlock, ImageContentSplit, CTA block, FAQ/accordion.
- UI shared: Button, TextLink, SectionHeading, Icon, Input, Divider, MichelinRating.
- Bố cục chỉ dùng ở một screen giữ trong `src/screens/<screen>/components`.

## Acceptance criteria

### Homepage

1. `/en` và `/fr` render đúng thứ tự bốn section chính của Figma: hero, source/story, philosophy, product showcase; Footer do layout render sau `main`.
2. Không render FAQ trên Homepage vì node `2:6278` không có section này.
3. Hero cao 800px ở desktop 1400px, dùng đúng image crop/gradient, header trong suốt và chỉ có một `h1`.
4. Content desktop dùng container 1000px và nhịp dọc theo PDS; mobile không có horizontal overflow.
5. Ảnh LCP có `fetchPriority="high"`, `loading="eager"`, `decoding="async"`; ảnh còn lại lazy-load. Mọi ảnh có `width`, `height`, `sizes`, `alt` và `<picture>` AVIF → WebP → fallback.
6. Các root node `frame-2085667109`, `frame-2085667100`, `frame-2085667104`, `frame-2085667107` và Footer được gắn `data-plumb-id` để verify.
7. Plumb fit tối thiểu 90 sau tối đa bốn vòng.

### Mỗi screen còn lại

1. Screenshot/reference spec được lấy trước khi code và asset manifest được liệt kê trước khi export.
2. Plumb fit tối thiểu 90 sau tối đa bốn vòng.
3. `yarn lint`, `yarn typecheck`, `yarn build` pass.
4. Lighthouse mobile và desktop đạt Performance, Accessibility, Best Practices, SEO ≥ 90; LCP < 2.5s, CLS < 0.1, INP/TBT < 200ms theo mục tiêu người dùng cung cấp.

## Rủi ro và trade-off

- Figma chỉ có canvas desktop 1400px; responsive nhỏ hơn được suy ra mobile-first từ hierarchy và quy tắc dự án, sau đó kiểm chứng tại các breakpoint bắt buộc.
- Hai frame Shop trùng tên được xem là hai trạng thái của cùng route; nếu spec sâu cho thấy mục đích khác, mapping sẽ được cập nhật trước khi implement Shop.
- Lighthouse lab score phụ thuộc máy chạy; log và cấu hình viewport sẽ được lưu làm evidence.

## Kế hoạch test

- BDD HTTP contract cho route locale: landmarks, một `h1`, thứ tự section, absence của FAQ, image contract và Plumb IDs.
- TDD cho helper/component mới bằng Node test ở lớp sâu nhất khả dụng.
- Visual verification bằng screenshot implementation và `plumb_fit`.
- Quality gates: lint, typecheck, build, Lighthouse mobile/desktop, `pdh gate`.
