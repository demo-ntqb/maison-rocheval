# Maison Rocheval

Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind v4 + next-intl (en/fr) + shadcn/ui (Radix) + Shopify Hydrogen. Same stack and folder conventions as `the-home-pizza` — see [AGENTS.md](AGENTS.md) for the full structure and rules.

## Getting started

```bash
yarn install
cp .env.example .env.local
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

- `src/app/[locale]/` — routes (App Router, locale-prefixed via next-intl)
- `src/screens/<name>/` — one folder per page: `sections/`, `components/`, `constants/`, `index.ts`
- `src/shared/` — cross-screen components, constants, and lib helpers
- `src/shared/lib/shopify/` — server-only Storefront clients, typed catalog queries, market and image helpers
- `messages/<locale>.json` — i18n copy, namespaced by section

Full conventions (naming, SEO, performance, accessibility, i18n) are documented in [AGENTS.md](AGENTS.md).

## Scripts

- `yarn dev` — start the dev server
- `yarn build` — production build
- `yarn lint` — ESLint
- `yarn typecheck` — TypeScript + Hydrogen GraphQL validation
- `yarn test:cicd` — verify Vercel GitHub Actions contract

## Shopify Headless

The Storefront foundation is adapted from Shopify's Next.js Hydrogen template while preserving this repository's `screens/`/`shared/` architecture and `next-intl` proxy.

1. Install the **Headless** sales channel in Shopify and create a storefront.
2. Copy `.env.example` to `.env.local`.
3. Set `PRIVATE_STOREFRONT_API_TOKEN` and `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`.
4. Run `yarn shopify:check` to verify the configured store (or the `mock.shop` fallback).
5. Run `yarn typecheck` to validate TypeScript and Storefront GraphQL operations against the schema bundled with the installed Hydrogen release.

Without Shopify credentials, server-side catalog queries use `mock.shop`, so CI and local builds do not require production secrets. Catalog reads use the static client in `src/shared/lib/shopify/storefront.ts`; future cart/account code must use the request-scoped client from the same file so Shopify receives the buyer IP without making catalog pages dynamic.

## Vercel CI/CD

GitHub Actions là deployment authority của repository:

- pull request vào `main`: chạy quality gate; pull request nội bộ tạo Vercel Preview;
- pull request từ fork: chạy quality gate nhưng không nhận Vercel secrets và không deploy;
- push vào `main`: chạy quality gate rồi deploy Vercel Production bằng đúng prebuilt artifact;
- deployment URL nằm trong GitHub Actions job summary.

### Bootstrap một lần

1. Tạo hoặc link Vercel project từ repository root. CLI tạo `.vercel/project.json`, file này đã được ignore và không được commit:

   ```bash
   npx vercel@58.9.4 link
   ```

2. Tạo Vercel access token tại **Vercel → Account Settings → Tokens**.
3. Mở `.vercel/project.json` để lấy `orgId` và `projectId`.
4. Trong **GitHub repository → Settings → Secrets and variables → Actions**, tạo ba repository secrets:

   - `VERCEL_TOKEN`: access token ở bước 2;
   - `VERCEL_ORG_ID`: giá trị `orgId`;
   - `VERCEL_PROJECT_ID`: giá trị `projectId`.

5. Trong Vercel Project Settings, thêm app environment variables từ `.env.example` theo từng Preview/Production environment. Ít nhất Production nên có `SITE_ORIGIN` là canonical production URL; Shopify credentials có thể để trống khi còn dùng `mock.shop`.
6. Nếu project đã nối Git integration và đang auto-deploy, tắt automatic Git deployments để tránh một commit tạo hai deployment; pipeline `.github/workflows/ci-cd.yml` chịu trách nhiệm deploy.
7. Bật branch protection cho `main` và require check **Quality gate** trước merge.

GitHub environment `production` có thể được cấu hình required reviewers nếu cần bước duyệt thủ công trước khi Production job nhận secrets và deploy.
