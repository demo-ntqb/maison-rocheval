# ADR 0001: Vercel prebuilt deployment qua GitHub Actions

- Status: Accepted
- Date: 2026-08-12

## Context

Repository nằm trên GitHub và cần quality gate trước deployment. Vercel Git integration có thể tự deploy theo push, nhưng không thể hiện trực tiếp dependency giữa các repository checks và artifact được deploy trong source-controlled pipeline.

## Decision

Dùng một GitHub Actions workflow làm CI/CD authority:

- quality job chạy trước mọi deployment;
- Vercel CLI được pin exact version;
- CI chạy `vercel pull`, build tại runner bằng `vercel build`, sau đó deploy đúng artifact bằng `vercel deploy --prebuilt`;
- Preview chỉ chạy cho pull request nội bộ;
- Production chỉ chạy cho push vào `main`;
- credentials chỉ đến từ GitHub Actions secrets.

Khi import repository vào Vercel, tắt automatic Git deployments để tránh một commit tạo hai deployment song song; GitHub Actions là deployment authority.

## Consequences

- Deployment được build từ đúng source revision đã vượt quality gate; artifact do `vercel build` tạo trong deployment job chính là artifact được `vercel deploy --prebuilt` phát hành.
- Workflow reproducible hơn do CLI version cố định.
- CI tốn thêm thời gian build vì quality job và Vercel build đều compile source; đổi lại hai mục đích được tách rõ: framework quality gate và Vercel-compatible artifact.
- Người vận hành phải tạo Vercel project/token và ba GitHub Actions secrets trước lần deployment đầu tiên.
- Pull request từ fork vẫn được kiểm tra code nhưng không có Preview deployment dùng secrets.
