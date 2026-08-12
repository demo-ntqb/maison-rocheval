# language: vi
Tính năng: CI/CD GitHub Actions deploy Vercel
  Là người vận hành Maison Rocheval
  Tôi muốn source được kiểm tra và deploy bằng một pipeline có kiểm soát
  Để Preview và Production chỉ nhận artifact đã vượt quality gate

  Kịch bản: Mọi thay đổi chạy quality gate
    Khi pull request nhắm vào main hoặc code được push vào main
    Thì pipeline cài dependency bằng frozen lockfile
    Và pipeline chạy lint, typecheck và build trước deployment

  Kịch bản: Pull request nội bộ tạo Preview an toàn
    Khi pull request đến từ chính repository và quality gate thành công
    Thì pipeline pull Vercel Preview environment
    Và pipeline build rồi deploy prebuilt Preview artifact
    Nhưng pull request từ fork không được chạy job có Vercel secrets

  Kịch bản: Main tạo Production deployment
    Khi code được push vào main và quality gate thành công
    Thì pipeline pull Vercel Production environment
    Và pipeline build và deploy prebuilt artifact với production target

  Kịch bản: Pipeline có credential và reproducibility guardrail
    Khi workflow được đọc từ source
    Thì Vercel CLI dùng exact version
    Và credentials chỉ tham chiếu VERCEL_TOKEN, VERCEL_ORG_ID và VERCEL_PROJECT_ID từ GitHub Actions secrets
    Và workflow chỉ có quyền đọc contents
    Và deployment URL được ghi vào job summary

