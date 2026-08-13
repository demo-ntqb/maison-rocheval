# F04 — Giao diện gallery ảnh chi tiết sản phẩm

## Vấn đề

Trang chi tiết sản phẩm (`ProductDetailImageGallery`) hiện tại rất đơn giản, chỉ hiển thị ảnh chính tĩnh và danh sách thumbnail dạng lưới tĩnh. Để mang lại trải nghiệm cao cấp, nhất quán với định vị thương hiệu và hỗ trợ hình ảnh responsive từ Shopify, gallery cần được tối ưu hóa với các tương tác kéo thả (swipe), chuyển ảnh mượt mà, hỗ trợ zoom, chế độ xem toàn màn hình (fullscreen) và đồng bộ khi thay đổi variant.

## Phạm vi

### Trong phạm vi

- Cài đặt và tích hợp `shadcn Carousel` (dựa trên Embla Carousel) làm bộ điều hướng gallery chính.
- Hỗ trợ swipe mượt mà trên mobile và các nút bấm Prev / Next trên desktop.
- Khi click vào thumbnail, gallery sẽ scroll đến ảnh tương ứng thông qua Carousel API (`scrollTo(index)`).
- Hiển thị thumbnail active dựa trên state từ Carousel API.
- Hiển thị bộ đếm ảnh dạng văn bản (ví dụ: `1 / 3`) từ Carousel API.
- Khi người dùng thay đổi variant ở `ProductDetailInfo`, gallery tự động scroll đến hình ảnh tương ứng thông qua sự kiện custom.
- Khi click vào ảnh chính, mở chế độ xem toàn màn hình (Fullscreen) sử dụng `shadcn Dialog` có hỗ trợ hiệu ứng chuyển cảnh mượt mà và khả năng Zoom.
- Áp dụng các hiệu ứng fade/scale animation và hover zoom tinh tế sử dụng thư viện `motion`.
- Tối ưu hóa ảnh responsive Shopify bằng cách tích hợp Hydrogen `<Image>` khi nhận được dữ liệu ảnh Shopify (hoặc fallback về `<Picture>` cục bộ nếu là chuỗi đường dẫn tĩnh).
- Đảm bảo tuân thủ đầy đủ các chuẩn A11y (độ tương phản, thuộc tính role, touch targets) và hiệu năng (lazy load ảnh không phải LCP).

### Ngoài phạm vi

- Thay đổi cấu trúc dữ liệu sản phẩm trong `product-detail.constant.ts`.
- Thực hiện thêm/xóa sản phẩm khỏi giỏ hàng thực tế ở bước này.

## Acceptance criteria

1. **Main gallery**: Sử dụng `shadcn Carousel` có swipe trên mobile, nút điều hướng Prev/Next hiển thị trên desktop.
2. **Thumbnail Click & Active State**: Click thumbnail sẽ di chuyển ảnh chính đến index tương ứng; ảnh thumbnail đang hoạt động có viền active và scale nhẹ.
3. **Image Counter**: Hiển thị bộ đếm ảnh hiện tại dạng `X / Y` (ví dụ `1 / 3`).
4. **Variant Sync**: Khi chọn kích thước hoặc bao bì tương ứng trong `ProductDetailInfo`, gallery tự động cuộn đến ảnh tương ứng.
5. **Fullscreen Dialog & Zoom**: Click vào ảnh chính sẽ mở dialog fullscreen (`shadcn Dialog`) có nút đóng rõ ràng, hỗ trợ hiệu ứng zoom phóng to ảnh khi hover hoặc click.
6. **Aesthetics & Performance**: Dùng `motion` để tạo các animation mượt mà (fade/scale); ảnh LCP tải eager và ưu tiên cao, các ảnh khác tải lazy; tích hợp thành công Hydrogen `<Image>` cho Shopify images.
7. **Quality Gates**: `yarn lint`, `yarn typecheck` và `yarn build` thành công mà không có lỗi.

## Kiểm thử

- BDD contract (`tests/features/product-detail-image-gallery.feature`) kiểm tra cấu trúc gallery, Carousel API, Dialog và các class/thuộc tính cần thiết.
- TDD test runner (`tests/bdd/product-detail-image-gallery.test.mjs`) thực thi static analysis và kiểm chứng mã nguồn.

## Chỉ số

- Baseline và target business: unknown; measurement-required. Giá trị được xác định qua kiểm tra thủ công trực quan (Visual Verification) và Lighthouse score trên mobile/desktop ≥ 90.
