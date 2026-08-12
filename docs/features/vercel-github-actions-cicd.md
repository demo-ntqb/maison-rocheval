# CI/CD GitHub Actions cho Vercel

## Bối cảnh

Repository hiện dùng GitHub với nhánh production `main`, nhưng chưa có workflow CI/CD và chưa liên kết project Vercel trong source. Mỗi thay đổi cần được kiểm tra trước khi tạo deployment, đồng thời Vercel credentials không được xuất hiện trong Git history.

## Mục tiêu

Thiết lập pipeline GitHub Actions có thể kiểm tra source, tạo Preview deployment cho pull request đáng tin cậy và tạo Production deployment cho cùng source revision khi code được push vào `main`.

## Phạm vi IN

- Chạy `install`, `lint`, `typecheck` và `build` trên pull request và push vào `main`.
- Tạo Vercel Preview deployment sau khi quality gate đạt cho pull request đến từ chính repository.
- Tạo Vercel Production deployment sau khi quality gate đạt trên `main`.
- Dùng `vercel pull` → `vercel build` → `vercel deploy --prebuilt` với Vercel CLI được pin version.
- Chặn deployment job trên pull request từ fork để không đưa Vercel secrets vào code không đáng tin cậy.
- Hủy pipeline cũ hơn trên cùng pull request/branch để tránh deploy artifact đã lỗi thời.
- Tài liệu hóa các GitHub Actions secrets và bước bootstrap Vercel bắt buộc.
- Có executable contract kiểm tra cấu trúc và các guardrail quan trọng của workflow.

## Phạm vi OUT

- Tự động tạo Vercel account, team, project, token hoặc custom domain.
- Commit `.vercel/project.json`, `.env` hay bất kỳ credential nào.
- Cấu hình Shopify production credentials.
- Tự động promote thủ công, rollback, database migration hoặc post-deploy E2E.
- Thay đổi source ứng dụng, UI hoặc hành vi runtime.

## Acceptance criteria

1. Pull request vào `main` luôn chạy quality job gồm dependency install, lint, typecheck và framework build.
2. Pull request nội bộ chỉ deploy Preview sau khi quality job thành công; pull request từ fork không chạy deployment job.
3. Push vào `main` chỉ deploy Production sau khi quality job thành công.
4. Preview dùng Vercel Preview environment; Production dùng Vercel Production environment và cờ `--prod` ở cả build/deploy.
5. Deployment dùng prebuilt artifact, Vercel CLI exact version và ba secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
6. Workflow chỉ yêu cầu quyền `contents: read`, không dùng `pull_request_target`, và không in credential vào log.
7. Workflow ghi deployment URL vào GitHub job summary để người vận hành có thể mở deployment.
8. `yarn test:cicd`, `yarn lint`, `yarn typecheck` và `yarn build` đều pass.

## Khu vực bị ảnh hưởng

- `.github/workflows/ci-cd.yml`
- `scripts/verify-vercel-cicd.mjs`
- `package.json`
- `README.md`
- `.delivery/config.yaml`
- `tests/features/vercel-github-actions-cicd.feature`
- `docs/adr/0001-vercel-github-actions-prebuilt.md`

## Test plan

- Chạy executable CI/CD contract khi workflow chưa tồn tại để xác nhận RED đúng hành vi thiếu.
- Thêm workflow tối thiểu và chạy lại contract đến GREEN.
- Chạy parser YAML gián tiếp bằng GitHub-compatible structure checks trong contract.
- Chạy full local gates: install frozen lockfile, lint, typecheck, build và `pdh gate`.

## Metrics

- `deployment_success_rate`: baseline unknown, target unknown, source proposed, status awaiting approval, measurement required sau khi pipeline có run thực tế.
- `deployment_lead_time`: baseline unknown, target unknown, source proposed, status awaiting approval, measurement required sau khi pipeline có run thực tế.
