Tính năng: Provision catalog Maison Rocheval vào Shopify
  Là người vận hành storefront
  Tôi muốn đồng bộ desired catalog vào Shopify bằng một CLI an toàn
  Để có thể bootstrap hoặc cập nhật store được chọn qua environment variables mà không tạo dữ liệu trùng lặp

  Bối cảnh:
    Giả sử Shopify Admin credentials hợp lệ được cung cấp qua environment variables
    Và manifest định nghĩa catalog Maison Rocheval bằng mock data EN và FR

  Kịch bản: Lập kế hoạch provisioning mà không ghi Shopify
    Khi tôi chạy command plan
    Thì CLI chỉ gửi Admin API queries
    Và CLI in các thay đổi theo thứ tự dependency
    Và CLI không gửi mutation

  Kịch bản: Catalog mock có canonical identity ổn định
    Thì manifest có đúng 5 handles "amour, kaluga, russian-hybrid, lexpression, harmonie"
    Và mỗi caviar product có các size "30g, 50g, 125g, 250g"
    Và collection "our-caviar" giữ đúng thứ tự 5 handles
    Và collection "featured-caviar" giữ đúng thứ tự "amour, lexpression, harmonie"

  Kịch bản: Packaging không tạo tổ hợp variants
    Thì Standard có giá 0 và không phải paid variant
    Và product "presentation-box" chỉ có variants Premium giá 32 EUR và Luxury giá 74 EUR
    Và không có variant kết hợp Size với Packaging hoặc Per box

  Kịch bản: Species thuộc trực tiếp từng product
    Thì mỗi caviar product có scientific name và species description trong Product metafields
    Và Product metafield definitions được pin để hiển thị trong Shopify Admin
    Và manifest không tạo metaobject type "caviar_species"

  Kịch bản: Apply có thể chạy lại an toàn
    Giả sử current state đang rỗng
    Khi tôi chạy command apply
    Thì CLI tạo hoặc cập nhật definitions, metaobjects, products, metafields, media và collections
    Và CLI publish managed resources vào Headless publication nếu publication tồn tại
    Khi tôi chạy command plan lần nữa trên state đã hội tụ
    Thì plan không còn action nào

  Kịch bản: Provision song ngữ theo primary locale của store
    Giả sử primary locale của Shopify là EN hoặc FR
    Khi tôi chạy command apply
    Thì primary locale được dùng làm source content
    Và locale còn lại được đăng ký qua Translation API với digest hiện hành

  Kịch bản: Không thay đổi dữ liệu vận hành ngoài phạm vi
    Khi tôi chạy command apply
    Thì CLI không gọi delete mutation
    Và CLI không ghi inventory quantities
    Và CLI không xoá metafields hoặc media do merchant quản lý
    Và product hiện hữu giữ nguyên prices, variants và product options do merchant quản lý

  Kịch bản: Verify phát hiện drift
    Giả sử Shopify current state khác desired manifest
    Khi tôi chạy command verify
    Thì command kết thúc với exit code khác 0
    Khi Shopify current state đã hội tụ
    Thì command kết thúc với exit code 0

  Kịch bản: Tạo merchant-owned custom data definitions
    Giả sử manifest dùng non-reserved metaobject types và metafield namespaces
    Khi provisioning executor tạo các definitions
    Thì definitions được expose cho Storefront API
    Và input không cấu hình app-owned Admin access

  Kịch bản: Đánh dấu metaobject fields bắt buộc
    Giả sử manifest đánh dấu một số fields là required
    Khi provisioning executor tạo hoặc cập nhật metaobject definition
    Thì input dùng field property required
    Và input không giả lập required bằng field-type validation

  Kịch bản: Shopify chuẩn hóa number_decimal
    Giả sử manifest có giá "32.00" và Shopify trả "32.0"
    Khi CLI kiểm tra current state
    Thì hai giá trị được xem là hội tụ

  Kịch bản: Translation contract phân biệt field có thể dịch
    Giả sử manifest đánh dấu rõ field text là translatable và field boolean là non-translatable
    Khi CLI đăng ký và kiểm tra translation
    Thì CLI chỉ gửi field được đánh dấu translatable
    Và CLI fail nếu Shopify không cung cấp digest cho một desired translatable key
