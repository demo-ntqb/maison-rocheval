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
- `messages/source/<locale>/<screen>.json` — i18n source tách theo screen; `messages/<locale>.json` là catalog generated duy nhất được runtime nạp

Full conventions (naming, SEO, performance, accessibility, i18n) are documented in [AGENTS.md](AGENTS.md).

## Scripts

- `yarn dev` — start the dev server
- `yarn build` — production build
- `yarn messages:build` — merge i18n fragments into the runtime catalog
- `yarn messages:check` — verify generated catalogs and locale key shapes
- `yarn lint` — ESLint
- `yarn typecheck` — TypeScript + Hydrogen GraphQL validation
- `yarn test:cicd` — verify Vercel GitHub Actions contract
- `yarn test:provisioning` — unit và BDD contract cho Shopify provisioning
- `yarn shopify:provision:plan` — đọc Shopify và in deterministic desired-state diff
- `yarn shopify:provision:apply` — apply các create/update do manifest quản lý
- `yarn shopify:provision:verify` — fail nếu Shopify chưa hội tụ với manifest

## Shopify Headless

The Storefront foundation is adapted from Shopify's Next.js Hydrogen template while preserving this repository's `screens/`/`shared/` architecture and `next-intl` proxy.

1. Install the **Headless** sales channel in Shopify and create a storefront.
2. Copy `.env.example` to `.env.local`.
3. Set `PRIVATE_STOREFRONT_API_TOKEN` and `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`.
4. Run `yarn shopify:check` to verify the configured store (or the `mock.shop` fallback).
5. Run `yarn typecheck` to validate TypeScript and Storefront GraphQL operations against the schema bundled with the installed Hydrogen release.

Without Shopify credentials, server-side catalog queries use `mock.shop`, so CI and local builds do not require production secrets. Catalog reads use the static client in `src/shared/lib/shopify/storefront.ts`; future cart/account code must use the request-scoped client from the same file so Shopify receives the buyer IP without making catalog pages dynamic.

### Provision Shopify catalog

Catalog seed được khai báo tại `scripts/shopify/provision/manifest.mjs`. Store đích chỉ lấy từ `SHOPIFY_ADMIN_STORE_DOMAIN` (fallback `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`); CLI không có nhánh logic dev/production.

Admin app cần các scopes sau:

- `read_products`, `write_products`
- `read_metaobjects`, `write_metaobjects`
- `read_metaobject_definitions`, `write_metaobject_definitions`
- `read_files`, `write_files`
- `read_publications`, `write_publications`
- `read_translations`, `write_translations`
- `read_locales`

Chọn một auth mode trong `.env.local`: `SHOPIFY_ADMIN_ACCESS_TOKEN`, hoặc cặp `SHOPIFY_ADMIN_CLIENT_ID` + `SHOPIFY_ADMIN_CLIENT_SECRET`. Không commit credentials.

Workflow vận hành:

```bash
yarn shopify:provision:plan
yarn shopify:provision:apply
yarn shopify:provision:verify
```

Luôn chạy `plan` trước `apply`. `plan` và `verify` dùng read-only client; `apply` chỉ create/update resources trong manifest, không delete và không ghi inventory quantities. Sau khi apply, CLI đọc lại Shopify và chỉ thành công khi state đã hội tụ. Nếu cần rollback seed content, sửa manifest về desired state trước đó và chạy lại; tài nguyên không còn trong manifest không bị tự động xoá.

`productSet` chỉ được dùng khi bootstrap product chưa tồn tại. Sau lần seed đầu,
prices, variants và product options thuộc quyền merchant; provisioning chỉ cập nhật
title, description, product type, vendor và status bằng `productUpdate`.

Species data được lưu trực tiếp trong Product metafields `rocheval.species_scientific_name` và `rocheval.species_description`.

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
