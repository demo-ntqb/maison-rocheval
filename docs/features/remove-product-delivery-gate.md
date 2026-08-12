# Bỏ Product Delivery Harness khỏi GitHub checks

## Bối cảnh

Vercel CI/CD hiện độc lập với Product Delivery Harness, nhưng repository vẫn khai báo một reusable GitHub workflow `Product delivery gate`. Workflow này tạo dependency ngoài không cần thiết và có thể fail trên GitHub vì `.delivery/` chỉ là local state, không được commit.

## Mục tiêu

Loại bỏ Product Delivery Harness khỏi GitHub Actions và branch-protection guidance, trong khi giữ nguyên quality checks cùng Preview/Production deployment của Vercel.

## Phạm vi IN

- Xóa `.github/workflows/product-delivery-gate.yml`.
- Cập nhật README để `main` chỉ yêu cầu check `Quality gate` của CI/CD Vercel.
- Thêm executable contract ngăn Product Delivery Harness workflow được đưa trở lại ngoài ý muốn.

## Phạm vi OUT

- Không thay đổi `.github/workflows/ci-cd.yml` ngoài test contract nếu cần.
- Không xóa local `.delivery/`, AGENTS governance hay evidence nội bộ.
- Không thay đổi UI, runtime source hoặc Vercel credentials.
- Không thay đổi GitHub settings trực tiếp.

## Acceptance criteria

1. Repository không còn track `.github/workflows/product-delivery-gate.yml`.
2. README không yêu cầu `Product delivery gate` trong Branch Protection.
3. `Quality gate` vẫn chạy lint, typecheck, CI/CD contract và build trước Vercel deployment.
4. `yarn test:cicd`, `yarn lint`, `yarn typecheck` và `yarn build` pass.

## Test plan

- Cập nhật BDD contract để yêu cầu Product Delivery Harness workflow không tồn tại.
- Chạy contract trước khi xóa workflow và xác nhận RED đúng nguyên nhân.
- Xóa workflow, cập nhật README và chạy lại contract đến GREEN.
- Chạy full repository commands và local `pdh gate` làm evidence nội bộ; GitHub không còn chạy gate này.

## Metrics

- Không đặt business target. Việc loại bỏ dependency được xác nhận bằng repository contract và GitHub run đầu tiên sau push.

