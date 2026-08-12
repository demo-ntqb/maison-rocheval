# language: vi
Tính năng: Chuyển thiết kế Maison Rocheval từ Figma thành giao diện web
  Là khách truy cập Maison Rocheval
  Tôi muốn Homepage phản ánh đúng cấu trúc và hình ảnh trong Figma
  Để có trải nghiệm thương hiệu nhất quán, nhanh và accessible

  Kịch bản: Homepage render đúng composition của Figma
    Khi tôi mở Homepage bằng một locale hợp lệ
    Thì trang có đúng một nội dung chính và đúng một tiêu đề cấp một
    Và hero, câu chuyện nguồn gốc, triết lý và sản phẩm xuất hiện đúng thứ tự
    Và Homepage không có FAQ ngoài thiết kế
    Và Footer xuất hiện sau nội dung chính

  Kịch bản: Asset Homepage đáp ứng image contract
    Khi trình duyệt tải Homepage
    Thì ảnh LCP được tải eager với fetch priority cao
    Và mỗi ảnh có kích thước nội tại và sizes
    Và ảnh raster có nguồn AVIF, WebP và fallback
    Và ảnh dưới fold được lazy-load

  Kịch bản: Homepage có thể được Plumb kiểm chứng
    Khi Plumb thu thập các element đã render
    Thì bốn section gốc và Footer có data-plumb-id tương ứng với PDS
