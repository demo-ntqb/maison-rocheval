# Tài Liệu Tổng Hợp Các Điểm Hardcode & Fallback

Dưới đây là danh sách các vị trí trong mã nguồn đang sử dụng các giá trị hardcode, các cấu hình tĩnh hoặc các cơ chế fallback tạm thời cần lưu ý khi vận hành và mở rộng hệ thống.

---

### 1. Request Context mặc định của Storefront Client [ĐÃ GIẢI QUYẾT]
* **Vị trí**: [`src/shared/lib/shopify/storefront.ts`](file:///Users/ntqb/Desktop/workspace/freelance/maison-rocheval/src/shared/lib/shopify/storefront.ts#L23-L66)
* **Chi tiết**:
  Trước đây, tham số `i18n` của request context bị thiết lập cố định là `{ language: "EN", country: "FR" }` trong hàm `createCatalogClient`.
  **Trạng thái hiện tại**: Đã được thiết lập động trong hàm `createStorefrontClientForRequest` thông qua đối tượng `market: I18nBase` được truyền vào:
  ```typescript
  requestContext: createShopifyRequestContext({
    request,
    i18n: { language: market.language, country: market.country },
  }),
  ```
  Hệ thống khởi tạo client tương ứng cho từng thị trường một cách động qua các hàm helper:
  * `getCatalogStorefrontClient(locale)` (dòng 98) - dùng cho các catalog route tĩnh được cache.
  * `getBuyerStorefrontClient(locale, request)` (dòng 117) - dùng cho các luồng động liên quan đến giỏ hàng của người mua.
* **Mức độ ảnh hưởng**: Không còn ảnh hưởng. Client storefront đã hoàn toàn tích hợp cấu hình thị trường động (Multi-Market).

---

### 2. Loại tiền tệ mặc định trong Giỏ hàng (Cart)
* **Vị trí**: [`src/shared/components/cart/cart-provider.tsx`](file:///Users/ntqb/Desktop/workspace/freelance/maison-rocheval/src/shared/components/cart/cart-provider.tsx#L58)
* **Chi tiết**:
  Hằng số `DEFAULT_CURRENCY` được thiết lập cứng:
  ```typescript
  const DEFAULT_CURRENCY = "EUR";
  ```
* **Mức độ ảnh hưởng**: Trung bình. Khi giỏ hàng trống hoặc chưa có sản phẩm, loại tiền tệ hiển thị mặc định sẽ là `EUR`. Một khi có sản phẩm được thêm vào giỏ, loại tiền tệ sẽ tự động cập nhật theo sản phẩm đó (ví dụ: `SGD` hoặc `USD` tùy theo store cấu hình). Nên cấu hình động theo thị trường/locale hiện tại của người dùng.

---

### 3. Số lượng tối đa mặc định khi thiếu quyền truy cập tồn kho
* **Vị trí**: [`src/shared/components/cart/cart-provider.tsx`](file:///Users/ntqb/Desktop/workspace/freelance/maison-rocheval/src/shared/components/cart/cart-provider.tsx#L130) (và các dòng L165, L175, L215)
* **Chi tiết**:
  Khi trường `quantityAvailable` từ Shopify trả về `null` (do API key thiếu scope `unauthenticated_read_product_inventory`), giỏ hàng sẽ tự động fallback giới hạn tối đa là `99`:
  ```typescript
  const maxQty = line.quantityAvailable ?? 99;
  ```
* **Mức độ ảnh hưởng**: Thấp. Đây là một cơ chế dự phòng an toàn (graceful degradation) để đảm bảo trải nghiệm mua sắm không bị gián đoạn khi hệ thống không lấy được dữ liệu tồn kho cụ thể.

---

### 4. Loại bỏ chức năng lựa chọn hộp quà tặng (Packaging Options)
* **Vị trí**: [`src/shared/lib/shopify/catalog/catalog.mapper.ts`](file:///Users/ntqb/Desktop/workspace/freelance/maison-rocheval/src/shared/lib/shopify/catalog/catalog.mapper.ts#L121)
* **Chi tiết**:
  Do các tính năng về hộp quà tặng (`presentationOptions` và `presentationBox`) đã được loại bỏ khỏi GraphQL query theo yêu cầu nghiệp vụ mới, trường `packagingOptions` hiện đang được map cứng thành mảng rỗng:
  ```typescript
  packagingOptions: [],
  ```
* **Mức độ ảnh hưởng**: Thấp. Việc giữ cấu trúc này giúp tránh lỗi TypeScript ở các component giao diện cũ vẫn đang tham chiếu tới thuộc tính này.

---

### 5. Cấu hình Domain ảnh được phép của Shopify
* **Vị trí**: [`src/shared/lib/shopify/image.ts`](file:///Users/ntqb/Desktop/workspace/freelance/maison-rocheval/src/shared/lib/shopify/image.ts#L7)
* **Chi tiết**:
  Danh sách các host của ảnh được cấu hình tĩnh để tối ưu hóa việc phân tách nguồn ảnh:
  ```typescript
  const SHOPIFY_IMAGE_HOSTS = ["cdn.shopify.com", "mock.shop"];
  ```
* **Mức độ ảnh hưởng**: Thấp. Đây là cấu hình chuẩn từ Shopify Hydrogen để lọc và định dạng lại kích thước ảnh từ CDN của Shopify.

