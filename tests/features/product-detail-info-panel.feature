Tính năng: Cập nhật giao diện Panel thông tin chi tiết sản phẩm
  Là một khách hàng trên trang chi tiết sản phẩm
  Tôi muốn xem các tuỳ chọn đóng gói dưới dạng các thẻ trực quan và phần tóm tắt dạng văn bản
  Để tôi có thể hiểu nhanh các phân khúc đóng gói và nhìn rõ cấu hình sản phẩm của mình

  Bối cảnh:
    Giả sử trang chi tiết sản phẩm cho "caviar-kaluga" được tải thành công
    Và sản phẩm có các tuỳ chọn đóng gói là "Standard", "Premium", "Luxury"

  Kịch bản: Hiển thị các thẻ đóng gói với ảnh thu nhỏ, tên, mô tả và giá
    Thì tôi sẽ thấy 3 thẻ tuỳ chọn đóng gói
    Và mỗi thẻ đóng gói sẽ chứa một vùng ảnh thu nhỏ
    Và thẻ "Standard" phải hiển thị tên là "STANDARD" và mô tả là "Paper bag with ice"
    Và thẻ "Standard" phải hiển thị nhãn giá là "FREE"
    Và thẻ "Premium" phải hiển thị tên là "PREMIUM" và mô tả là "Quality cardboard box with Bolduc ribbon."
    Và thẻ "Premium" phải hiển thị nhãn giá là "+$32"
    Và thẻ "Luxury" phải hiển thị tên là "LUXURY" và mô tả là "Premium wooden box with Bolduc ribbon."
    Và thẻ "Luxury" phải hiển thị nhãn giá là "+$74"

  Kịch bản: Trạng thái được chọn của thẻ đóng gói
    Khi tuỳ chọn đóng gói "Standard" được chọn mặc định
    Thì thẻ "Standard" sẽ không có viền dày
    Khi tôi chọn thẻ đóng gói "Premium"
    Thì thẻ "Premium" sẽ có viền dày biểu thị trạng thái được chọn
    Và thẻ "Standard" sẽ có viền mỏng

  Kịch bản: Khối tóm tắt hiển thị định dạng text-only
    Giả sử người dùng đã chọn kích cỡ "30g"
    Và người dùng đã chọn đóng gói "Premium"
    Và người dùng đã chọn số lượng mỗi hộp là "2"
    Thì phần tóm tắt sẽ hiển thị tên đóng gói in hoa kèm theo "BOX OF 2"
    Và phần tóm tắt sẽ hiển thị "2 X 30g Kaluga per box"
    Và phần tóm tắt sẽ hiển thị "Personalized message included" với màu chữ mờ

  Kịch bản: Phần tóm tắt ẩn thông điệp cá nhân hoá đối với đóng gói Standard
    Giả sử người dùng đã chọn đóng gói "Standard"
    Thì phần tóm tắt sẽ không hiển thị "Personalized message included"

  Kịch bản: Phần tóm tắt cập nhật động khi các tuỳ chọn thay đổi
    Giả sử người dùng đã chọn kích cỡ "125g", số lượng mỗi hộp là "3" và đóng gói "Luxury"
    Thì phần tóm tắt sẽ hiển thị "LUXURY BOX OF 3"
    Và phần tóm tắt sẽ hiển thị "3 X 125g Kaluga per box"

