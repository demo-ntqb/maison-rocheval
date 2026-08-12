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

## Shopify Headless

The Storefront foundation is adapted from Shopify's Next.js Hydrogen template while preserving this repository's `screens/`/`shared/` architecture and `next-intl` proxy.

1. Install the **Headless** sales channel in Shopify and create a storefront.
2. Copy `.env.example` to `.env.local`.
3. Set `PRIVATE_STOREFRONT_API_TOKEN` and `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`.
4. Run `yarn shopify:check` to verify the configured store (or the `mock.shop` fallback).
5. Run `yarn typecheck` to validate TypeScript and Storefront GraphQL operations against the schema bundled with the installed Hydrogen release.

Without Shopify credentials, server-side catalog queries use `mock.shop`, so CI and local builds do not require production secrets. Catalog reads use the static client in `src/shared/lib/shopify/storefront.ts`; future cart/account code must use the request-scoped client from the same file so Shopify receives the buyer IP without making catalog pages dynamic.
