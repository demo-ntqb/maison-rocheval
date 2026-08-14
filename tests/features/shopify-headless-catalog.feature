Tính năng: Render catalog Maison Rocheval từ Shopify Headless
  Là người mua trên storefront EN hoặc FR
  Tôi muốn thấy catalog Shopify hiện hành
  Để nội dung, variants và giá không lệch khỏi hệ thống commerce

  Kịch bản: Home dùng featured collection
    Giả sử Shopify có collection "featured-caviar"
    Khi Home products section được render
    Thì cards giữ thứ tự sản phẩm của Shopify
    Và copy, image và handles đến từ Storefront API

  Kịch bản: Products dùng canonical catalog collection
    Giả sử Shopify có collection "our-caviar"
    Khi Products catalog section được render
    Thì item count bằng số products Shopify trả về
    Và không dùng PRODUCTS mock làm content source

  Kịch bản: Product detail dùng Shopify source of truth
    Giả sử Shopify có product canonical handle
    Khi product detail được render
    Thì variants, giá, media, direct species Product metafields và related products đến từ Shopify
    Và giá không được tính bằng size multiplier
    Và unavailable variant không thể được thêm vào cart

  Kịch bản: Routing và SEO theo catalog
    Khi legacy product handle được truy cập
    Thì route redirect vĩnh viễn sang canonical Shopify handle
    Khi handle không tồn tại
    Thì route trả 404
    Khi product tồn tại
    Thì metadata, JSON-LD và sitemap dùng dữ liệu Shopify

  Kịch bản: Shopify thay đổi catalog
    Giả sử Shopify gửi webhook có HMAC hợp lệ
    Khi topic product, collection hoặc metaobject được nhận
    Thì cache tags tương ứng được revalidate
    Khi HMAC không hợp lệ
    Thì endpoint trả 401 và không revalidate
