# language: vi
Tính năng: Đồng bộ layout FAQ trên Products
  Là khách truy cập Maison Rocheval
  Tôi muốn FAQ thích ứng theo nội dung và viewport
  Để trang không bị cắt, chồng lấn hoặc có khoảng trắng cố định không cần thiết

  Kịch bản: Products content wrapper không khóa chiều cao
    Khi tôi mở Products bằng một locale hợp lệ
    Thì content wrapper không dùng chiều cao cố định 3646px

  Kịch bản: FAQ Products dùng spacing responsive
    Khi FAQ Products được render
    Thì wrapper chiếm toàn bộ chiều rộng
    Và wrapper không dùng chiều cao cố định 846px
    Và wrapper dùng padding dọc mobile 24 và desktop 200px
    Và nội dung tiếp tục được render bởi shared FaqSection
