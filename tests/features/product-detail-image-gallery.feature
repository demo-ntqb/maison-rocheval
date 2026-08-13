# language: vi
Tính năng: Gallery ảnh chi tiết sản phẩm
  Là khách hàng mua sắm tại Maison Rocheval
  Tôi muốn xem ảnh sản phẩm chi tiết bằng gallery hiện đại, responsive
  Để có cái nhìn chân thực và phóng to các chi tiết cao cấp của sản phẩm

  Kịch bản: Cấu trúc gallery ảnh sử dụng Carousel
    Khi gallery ảnh chi tiết sản phẩm được render
    Thì có carousel chính chứa các hình ảnh của sản phẩm
    Và có nút điều hướng Trước (Previous) và Sau (Next) cho Carousel
    Và có bộ đếm hiển thị chỉ số ảnh hiện tại (Image counter)

  Kịch bản: Điều hướng qua thumbnail và đồng bộ variant
    Khi có danh sách ảnh thumbnail được hiển thị dưới dạng hàng ngang
    Thì click vào thumbnail sẽ gọi hàm cuộn Carousel tới ảnh tương ứng
    Và khi người dùng thay đổi variant ở cột thông tin thì Carousel sẽ tự động cuộn đến slide tương thích

  Kịch bản: Phóng to toàn màn hình bằng Dialog và Zoom
    Khi click vào khu vực ảnh chính của Carousel
    Thì mở một hộp thoại Dialog chế độ xem toàn màn hình
    Và trong Dialog có hỗ trợ tính năng phóng to (Zoom) khi rê chuột hoặc click
    Và ảnh trong gallery sử dụng định dạng responsive thông qua Picture hoặc Hydrogen Image
