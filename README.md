# Maison Rocheval

Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind v4 + next-intl (en/fr) + shadcn/ui (Radix). Same stack and folder conventions as `the-home-pizza` — see [AGENTS.md](AGENTS.md) for the full structure and rules.

## Getting started

```bash
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

- `src/app/[locale]/` — routes (App Router, locale-prefixed via next-intl)
- `src/screens/<name>/` — one folder per page: `sections/`, `components/`, `constants/`, `index.ts`
- `src/shared/` — cross-screen components, constants, and lib helpers
- `messages/<locale>.json` — i18n copy, namespaced by section

Full conventions (naming, SEO, performance, accessibility, i18n) are documented in [AGENTS.md](AGENTS.md).

## Scripts

- `yarn dev` — start the dev server
- `yarn build` — production build
- `yarn lint` — ESLint
