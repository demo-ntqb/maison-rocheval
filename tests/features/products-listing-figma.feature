# language: vi
Tính năng: Products listing khớp Figma 3:8034
  Là khách truy cập Maison Rocheval
  Tôi muốn xem toàn bộ collection trên Products page
  Để khám phá từng loại caviar trong một trải nghiệm nhất quán, responsive và accessible

  Kịch bản: Route Products là thin localized composition
    Khi tôi mở Products bằng một locale hợp lệ
    Thì route compose các section từ screen products theo thứ tự hero, catalog, editorial và FAQ
    Và route cung cấp localized metadata đầy đủ với canonical Products
    Và trang có đúng một tiêu đề cấp một

  Kịch bản: Catalog phản ánh Figma listing
    Khi catalog được render
    Thì catalog hiển thị 5 sản phẩm từ products constant
    Và product list dùng semantic list
    Và desktop hiển thị ba cột card rộng 312px với khoảng cách theo Figma
    Và card đầu tiên dùng ảnh priority còn các card khác lazy-load

  Kịch bản: Nội dung và ảnh đáp ứng contract production
    Khi trình duyệt tải Products
    Thì English và French đều có copy và metadata Products
    Và product, editorial và FAQ images có AVIF, WebP và fallback
    Và mọi ảnh có kích thước nội tại, sizes, alt và decoding async
    Và không có next/image

  Kịch bản: Products responsive và accessible
    Khi viewport thay đổi từ 320px đến 1536px
    Thì catalog chuyển từ một sang hai rồi ba cột mà không overflow ngang
    Và internal CTA dùng localized Link
    Và FAQ dùng shared accessible accordion
