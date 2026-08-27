# Tài Liệu Tổng Hợp Các Điểm Hardcode & Fallback

Dưới đây là danh sách các vị trí trong mã nguồn đang sử dụng các giá trị hardcode, các cấu hình tĩnh hoặc các cơ chế fallback tạm thời cần lưu ý khi vận hành và mở rộng hệ thống.

---

### 1. Request Context mặc định của Storefront Client
* **Vị trí**: [`src/shared/lib/shopify/storefront.ts`](file:///Users/ntqb/Desktop/workspace/freelance/maison-rocheval/src/shared/lib/shopify/storefront.ts#L36)
* **Chi tiết**: 
  Trong hàm `createCatalogClient`, tham số `i18n` của request context đang được thiết lập cố định:
  ```typescript
  i18n: { language: "EN", country: "FR" },
  ```
* **Mức độ ảnh hưởng**: Thấp. Đối với các truy vấn Catalog tĩnh, hệ thống sử dụng directive `@inContext` để truyền động `country` và `language` từ hàm `getShopifyMarket(locale)`. Tuy nhiên, request context mặc định này nên được đồng bộ hoặc quản lý động nếu sau này phát sinh các luồng client-side hoặc cart/checkout trực tiếp.

---

### 2. Loại tiền tệ mặc định trong Giỏ hàng (Cart)
* **Vị trí**: [`src/shared/components/cart/cart-provider.tsx`](file:///Users/ntqb/Desktop/workspace/freelance/maison-rocheval/src/shared/components/cart/cart-provider.tsx#L54)
* **Chi tiết**:
  Hằng số `DEFAULT_CURRENCY` được thiết lập cứng:
  ```typescript
  const DEFAULT_CURRENCY = "EUR";
  ```
* **Mức độ ảnh hưởng**: Trung bình. Khi giỏ hàng trống hoặc chưa có sản phẩm, loại tiền tệ hiển thị mặc định sẽ là `EUR`. Một khi có sản phẩm được thêm vào giỏ, loại tiền tệ sẽ tự động cập nhật theo sản phẩm đó (ví dụ: `SGD` hoặc `USD` tùy theo store cấu hình). Nên cấu hình động theo thị trường/locale hiện tại của người dùng.

---

### 3. Số lượng tối đa mặc định khi thiếu quyền truy cập tồn kho
* **Vị trí**: [`src/shared/components/cart/cart-provider.tsx`](file:///Users/ntqb/Desktop/workspace/freelance/maison-rocheval/src/shared/components/cart/cart-provider.tsx#L107) (và các dòng L142, L152)
* **Chi tiết**:
  Khi trường `quantityAvailable` từ Shopify trả về `null` (do API key thiếu scope `unauthenticated_read_product_inventory`), giỏ hàng sẽ tự động fallback giới hạn tối đa là `99`:
  ```typescript
  const maxQty = line.quantityAvailable ?? 99;
  ```
* **Mức độ ảnh hưởng**: Thấp. Đây là một cơ chế dự phòng an toàn (graceful degradation) để đảm bảo trải nghiệm mua sắm không bị gián đoạn khi hệ thống không lấy được dữ liệu tồn kho cụ thể.

---

### 4. Loại bỏ chức năng lựa chọn hộp quà tặng (Packaging Options)
* **Vị trí**: [`src/shared/lib/shopify/catalog/catalog.mapper.ts`](file:///Users/ntqb/Desktop/workspace/freelance/maison-rocheval/src/shared/lib/shopify/catalog/catalog.mapper.ts#L93)
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
