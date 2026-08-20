# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Key Next.js 16 breaking changes already confirmed for this repo (verified against `node_modules/next/dist/docs`, do not rely on older training data):

- Turbopack is the default bundler for both `next dev` and `next build`. Don't add `--turbopack` flags or webpack config unless a real need shows up.
- `cookies()`, `headers()`, `draftMode()`, and `params`/`searchParams` are **async-only** — always `await` them, no sync fallback exists anymore.
- `middleware.ts` is renamed to `proxy.ts` (export `proxy`, not `middleware`). Edge runtime is not supported in `proxy`.
- `revalidateTag(tag)` now requires a second `cacheLife` argument, e.g. `revalidateTag('menu', 'max')`. Use `updateTag` in Server Actions when the user needs to see their own change immediately.
- **This project deliberately does NOT use `next/image`** (see the Performance rules below for why). The `next/image`-specific breaking changes (`priority`→`preload`, `images.qualities`, `images.localPatterns`) therefore don't apply here. If you ever do reach for `next/image`, re-read the image guide in `node_modules/next/dist/docs/` first — but the default and expectation is native `<img>`/`<picture>`.

---

# Building the site: rules to follow

This project is Maison Rocheval. Everything below applies to any page, section, or component built for it. These rules are derived from the actual Next.js docs shipped in `node_modules/next/dist/docs/` — re-check that folder before deviating, since this Next.js build differs from public docs.

## Folder structure

Code is organized **by screen** (one route/page = one folder under `screens/`), plus a **`shared/`** layer for anything used by more than one screen.

> **Never create a top-level folder literally named `pages`.** Next.js scans *any* `pages/` (including `src/pages/`) as the legacy Pages Router even when the app only uses the App Router, and it will hard-fail the build on barrel `export *` files inside it (`export-all-in-page` error) no matter what the individual files are named. Use `screens/` for this project's "one folder per page" concept.

```
src/
  app/
    [locale]/
      layout.tsx            # root layout: fonts, metadata, <html>/<body>
      page.tsx               # thin composition for the `/` route — imports sections from screens/home
    globals.css              # Tailwind v4 import + design tokens (CSS vars)
    favicon.ico
  i18n/
    routing.ts               # next-intl locales config
    navigation.ts             # next-intl Link/router wrappers
    request.ts                # next-intl server request config
  proxy.ts                    # next-intl middleware (renamed from middleware.ts in Next 16)
  screens/
    home/                   # everything specific to the `/` (home) screen — nothing here is imported by another screen
      sections/
        home-hero.section.tsx        # export HomeHeroSection
      components/
        home-something.tsx           # a section's client-only sub-piece
      hooks/
        home-use-something.hook.ts   # export useHomeSomething
      constants/
        home.constant.ts             # content/data used only by this screen
      types/
        home.type.ts                 # types used only by this screen
      index.ts                       # barrel: re-exports this screen's *sections* only
    <next-screen>/            # every other screen follows the exact same shape
      sections/
      components/
      constants/
      index.ts
  shared/                   # anything used by 2+ screens, or with no single screen owner
    components/
      layout/               # Header, Footer, Container — site chrome
        header.tsx
        footer.tsx
        index.ts
      ui/                    # small reusable primitives (Button, Badge, SectionHeading)
      icons/                 # SVG icon components (ic-*.tsx convention)
      index.ts
    constants/
      site.constant.ts       # business info, nav items, social links — used by shared/components/layout
    lib/
      utils.ts                # small pure helpers (cn(), formatters)
      metadata.ts              # shared metadata/JSON-LD builders
    hooks/
      use-in-view.hook.ts      # export useInView
    types/
      shared.type.ts

public/
  fonts/                    # self-hosted font files for next/font/local (if any)
  images/                   # organize by screen, e.g. images/home/*
  videos/                   # self-hosted video sources
```

### Naming rules

- **File names inside a screen start with that screen's name**: `screens/home/sections/home-hero.section.tsx`, `screens/home/components/home-something.tsx`. Files under `shared/` are never screen-prefixed (`shared/components/layout/header.tsx`, not `shared-header.tsx`).
- **Only section files get a type suffix on the filename — `.section.tsx`.** A section is a top-level slice of a screen, composed directly in that screen's `index.ts`/`app/[locale]/page.tsx` (Hero, Story, ...). Its exported component is PascalCase `<Screen><Name>Section` — e.g. `home-hero.section.tsx` exports `HomeHeroSection`.
- **Regular components get no suffix** — `<screen>-<name>.tsx` exporting `<Screen><Name>` for screen-scoped pieces, or `<name>.tsx` exporting `<Name>` for anything in `shared/components/` (`header.tsx` → `Header`, `footer.tsx` → `Footer`).
- **Icons are exempt** from both the prefix and suffix rules — keep the `ic-*.tsx` naming (it's already an unambiguous type signal on its own) in `shared/components/icons/`.
- **Hooks get `.hook.ts`**: `<screen>-<name>.hook.ts` exporting `use<Screen><Name>` under a screen, or `<name>.hook.ts` exporting `use<Name>` under `shared/hooks/`.
- **Constants get `.constant.ts`**: `<screen>.constant.ts` under `screens/<screen>/constants/` (one file per screen is normally enough), or `<name>.constant.ts` under `shared/constants/`.
- **Types get `.type.ts`**: `<screen>.type.ts` under `screens/<screen>/types/`, or `<name>.type.ts` under `shared/types/`.
- **Decide screen-scoped vs. shared by actual usage, not by guessing**: if only one screen uses a component/hook/constant/type, it lives inside that screen's folder. Move it to `shared/` the moment a second screen needs it — don't shared-ify things pre-emptively "just in case".
- A screen's `index.ts` barrel re-exports only that screen's **sections** — the pieces `page.tsx` composes. It does not re-export the screen's internal components/hooks/constants/types; import those directly by relative path from within the screen (`../constants/home.constant`).
- Keep every route's `page.tsx` a thin composition that imports sections from `@/screens/<name>` and renders them in order — no business logic or large JSX trees directly in `page.tsx`.
- Use the `@/*` path alias for all cross-folder imports (`@/shared/...`, `@/screens/...`) — no deep relative `../../../` chains. Relative imports are fine *within* a screen (e.g. a section importing its own screen's constants).
- Barrel files (`index.ts`) only re-export; never put logic in them.
- Anything not meant to be a route must live outside `app/` — this project keeps all non-route code in `screens/` and `shared/`, don't put components back under `app/`.

## i18n

- Routing is via `next-intl`, configured in `src/i18n/routing.ts` (`locales`, `defaultLocale`, `localePrefix`). All routes live under `src/app/[locale]/`.
- Copy lives in `messages/<locale>.json`, namespaced by section (`metadata.root`, `header.nav`, `home.hero`, ...). Add a key to every locale file at once — don't let them drift.
- `<html lang>` MUST match the active locale **and** the `openGraph.locale` in metadata — keep them consistent.
- Use `Link`/`useRouter`/`usePathname` from `@/i18n/navigation`, never `next/link`/`next/navigation` directly, so locale prefixes are handled automatically.

## SEO rules

- Define metadata via the `Metadata` object exported from `app/[locale]/layout.tsx` (site-wide) and override per-page needs via `generatePageMetadata` (`shared/lib/metadata.ts`).
- Always fill: `title`, `description`, `openGraph` (title/description/images/url/siteName), and `twitter` card metadata.
- Add `app/sitemap.ts` and `app/robots.ts` using the file conventions once there is more than one route, instead of static `.xml`/`.txt` files.
- Provide a real OG image: either a static `opengraph-image.png/jpg` in `app/`, or a generated `opengraph-image.tsx` using `next/og`'s `ImageResponse`. 1200x630 minimum.
- Use exactly one `<h1>` per page, and a logical heading order (`h2` per section) — do not skip levels for styling reasons; control size with CSS, not heading level.
- Add JSON-LD structured data as a native `<script type="application/ld+json">` — not `next/script`, since JSON-LD isn't executable code. Escape `<` in the serialized payload (`generateJsonLd()` in `shared/lib/metadata.ts` already does this).
- Every `<img>` needs a meaningful `alt`. Decorative images get `alt=""`, never omitted.
- Internal navigation (nav links, CTAs to sections/routes) must use `@/i18n/navigation`'s `<Link>`, never a plain `<a>`, so Next.js can prefetch.
- Provide a canonical URL per route via `alternates.canonical` (already wired in `generatePageMetadata`) — every page should resolve to exactly one canonical URL.
- Use descriptive, meaningful link/CTA text — never "click here" / "here".
- Add `app/manifest.ts` and a `<meta name="theme-color">` in `layout.tsx` for PWA/installability signals once the brand palette/icons are set.

## Performance rules

### Images (do NOT use `next/image`)

- **Never `import Image from 'next/image'`.** For a static site served from a CDN, `next/image` adds a runtime optimization endpoint + a client loader script that delays LCP and costs Lighthouse points without buying real value. Use **native `<picture>` + `<img>`** with **pre-optimized assets** instead.
- Always set an explicit **integer** `width` and `height` on `<img>` (or a CSS `aspect-ratio` on the container) so the browser reserves space — this is what prevents CLS.
- **LCP image** (the single largest above-the-fold image): set `fetchPriority="high"`, `loading="eager"`, `decoding="async"`. Do **not** lazy-load it.
- **Every other image**: set `loading="lazy"` and `decoding="async"`. Never lazy-load an above-the-fold image.
- Always provide a `sizes` attribute so the browser picks the correct `srcset` variant — e.g. `sizes="(max-width: 768px) 100vw, 50vw"`.
- Serve modern formats via `<picture>`: an AVIF `<source>`, a WebP `<source>`, and a JPEG/PNG `<img src>` fallback in that order. Keep assets organized under `public/images/<screen>/`.
- Pre-optimize assets at build time (a `sharp` script, or commit pre-optimized files) — never ship a raw multi-MB photo to the browser.
- Decorative images: `alt=""` **and** `aria-hidden="true"` **and** `loading="lazy"`, so they're ignored by AT and never block the LCP.

### Lighthouse performance targets

- Target these Core Web Vitals on **both mobile and desktop**, but **mobile first**:
  - **LCP < 2.5s**, **CLS < 0.1**, **INP < 200ms** / **TBT < 200ms**.
- Zero render-blocking third-party scripts. Lazy-load below-the-fold or interaction-gated client components with `next/dynamic`.
- **Fonts**: use `next/font/local` and `next/font/google`. Never add a `<link>` to Google Fonts or an external font `@import`. Always set `display: "swap"`.
- **JS bundle discipline**: default every component to a Server Component. Only add `"use client"` at the leaf that actually needs interactivity/state/browser APIs — not at the top of a whole section.
- Avoid client-side data fetching for content that's static at build time — keep that as plain server-rendered data in the relevant `*.constant.ts` file or fetched in a Server Component.
- Don't introduce `cookies()`/`headers()`/other request-time APIs in the root layout or a static page unless truly needed — any usage there opts the *entire app* into dynamic rendering, killing static prerendering.

## Accessibility rules

- Use **semantic landmarks**: `<header>`, `<nav>` (with `aria-label` if there's more than one nav), `<main>`, `<footer>`, and `<section>` with a visible heading or `aria-labelledby`.
- Exactly one `<h1>` per page; never skip heading levels for styling reasons — control size with CSS.
- Interactive elements must use the right role: `<button>` for actions, `<a href>` for navigation. Never `<div onClick>` / `<span onClick>`.
- **Touch targets ≥ 44×44px** (Lighthouse floor). On mobile aim for 48×48px.
- Icon-only or ambiguous controls must have an `aria-label` describing the action/destination.
- **Color contrast** ≥ 4.5:1 for normal text, ≥ 3:1 for large text and UI component boundaries.
- Forms: every input has a real `<label>` (or `aria-label`), the correct `type`, sensible `autocomplete`, and errors wired via `aria-describedby` + `aria-invalid`.
- Provide a **"skip to content"** link as the first focusable element in `<body>`.
- Respect `prefers-reduced-motion: reduce` (the global override is already in `globals.css`).
- Never use `tabindex` > 0.

## Animation rules

- Prefer CSS transitions/animations (Tailwind utilities, `@keyframes` in `globals.css`) for simple hover/reveal/entrance effects.
- For scroll-triggered reveals, prefer `IntersectionObserver` in a small client hook over a heavy scroll-animation library, unless the design genuinely needs one.
- Any animation must respect `prefers-reduced-motion: reduce`.
- Keep animation logic in the client leaf component that needs it — don't mark an entire section `"use client"` just to animate one child element.

## Mobile & desktop rules

- Build **mobile-first**: base styles target the smallest viewport, then progressively enhance with Tailwind `md:`/`lg:`/`xl:`.
- **Touch targets ≥ 48×48 CSS px** on mobile.
- **Body/inputs ≥ 16px** to stop iOS Safari from auto-zooming on input focus.
- **No hover-only interactions.** Every hover affordance must have a tap/keyboard equivalent.
- Keep the mobile viewport free of horizontal overflow — test at 320px, 375px, and 768px.
- Verify the layout at the standard breakpoints: 360 / 414 / 768 / 1024 / 1280 / 1536.

## Lighthouse quality gates (definition of done)

Every page/section is considered done only when it passes these gates on **both mobile and desktop**:

- **All four categories ≥ 90**: Performance, Accessibility, Best Practices, SEO (target 100 for Accessibility/SEO/Best Practices).
- Preempt the common, predictable failures before running Lighthouse: images without explicit dimensions, missing `alt`/`aria-hidden`, low-contrast text, missing/mismatched `<html lang>`/`openGraph.locale`/`description`, tap targets < 44px, render-blocking JS/CSS, oversized DOM, missing `manifest.ts`/theme-color/canonical URL.
- **Required checks before closing a page**: `yarn build` must pass, `yarn lint` must be clean, and a Lighthouse run (mobile + desktop) must hit the gates above.
- When a gate can't be met for a legitimate reason, call it out explicitly with the tradeoff — don't silently ship a regression.

## General conventions to keep consistent with existing code

- Tailwind v4 via `@import "tailwindcss"` + CSS custom properties in `globals.css` (see the `--palette-*` / `--color-*` tokens) — add new design tokens there, don't hardcode hex values in components.
- TypeScript strict mode is on (`tsconfig.json`) — no `any` without a clear reason, no unchecked non-null assertions.
- Icons follow `shared/components/icons/ic-*.tsx` + barrel pattern.
- Run `yarn lint` (ESLint flat config) before considering a change done; Next.js 16 no longer runs lint as part of `next build`.

## Interactive primitives: use shadcn/ui, don't hand-roll accessibility

For any interactive UI primitive — accordion, dialog/modal, dropdown, tabs, popover, tooltip, select, toast, etc. — reach for **shadcn/ui** (Radix-backed) instead of hand-rolling the open/close state and ARIA wiring yourself.

- **Install only the component(s) a task actually needs** — `npx shadcn@latest add <component>`. Each generated file lands in `src/shared/components/ui/<component>.tsx` per `components.json`'s aliases (already wired to this project's `screens/`+`shared/` layout, not the shadcn-default `src/components`).
- **Never let `shadcn init` re-run over `globals.css`.** It ships a default neutral/oklch theme that will stomp this project's palette. If a future `add` command asks to overwrite `globals.css`, decline and wire any new CSS runtime it needs in by hand instead.
  - **Bare `@keyframes` inside `@theme` are not enough** to get a Tailwind `animate-*` utility — Tailwind only generates the class if there's also an explicit `--animate-<name>: <name> <duration> <easing>;` line pointing at it.
  - Don't rely on `@import "<package>/tailwind.css"` for a dependency's runtime CSS — in this project's Turbopack + Tailwind v4 setup that bare-specifier import silently resolves to nothing. Copy the specific keyframes/`@custom-variant`s actually needed straight into `globals.css` instead.
- **Treat the generated `ui/*.tsx` file as a primitive you don't restyle in place.** Its default classNames reference generic shadcn tokens that don't exist in this project's theme and are intentionally left alone. Do the actual visual work with Tailwind at the **call site**, passing `className` — the project's `cn()` (`@/shared/lib/utils`, clsx + `tailwind-merge`) correctly lets your classes override the component's defaults.
- **`ui/button.tsx`'s base classes force any child `<svg>` to 16px** via `[&_svg:not([class*='size-'])]:size-4` — a compound `:not()` selector that beats a plain `h-* w-*` utility on the icon regardless of source order. Size icons inside a `Button` with a `size-*` class, not separate `h-*`/`w-*`.
- **After editing Tailwind classes inside a component already rendered by the dev server, verify computed styles, not just that the class string looks right in JSX.** Turbopack + Tailwind v4 has been known to serve stale CSS after edits. If a class that's clearly present in the DOM isn't taking visual effect, `rm -rf .next` and restart the dev server before assuming the CSS/selector logic itself is wrong.


---

**## Hydrogen + Next.js guardrails**

- **Next.js là framework owner**: routing, rendering, RSC, Server Actions, Route Handlers và caching. `@shopify/hydrogen` chỉ là **Shopify commerce SDK / transport layer**.
- Pin exact Hydrogen preview version đang được project duyệt; **không tự upgrade**, không dùng `^` / `~`. Không thêm `react-router`, `@react-router/*`, `vue` hoặc `vite` nếu app không thực sự cần.
- Catalog dùng static Storefront client (`type: "private_no_buyer_context"`). **Không gọi `headers()` / `cookies()` trong catalog path**. Request-scoped Shopify context chỉ dùng cho buyer-specific state như cart, account, session, buyer IP.
- **Next.js là cache owner duy nhất**: giữ `"use cache"` + `cacheLife()` + `cacheTag()`; không truyền Hydrogen `cache` vào `graphql()` và không tạo double-cache.
- Giữ Storefront API version, GraphQL queries, `@inContext` và typing hiện tại cho đến khi có migration riêng. **Không tự migrate sang `gql.tada`** hoặc refactor service/domain layer chỉ vì thay transport.
- Không gọi Storefront API bằng custom `fetch` nếu shared Hydrogen client đã đáp ứng được. Production không được silent fallback sang mock catalog nếu thiếu credentials, trừ khi explicit flag cho phép.
- Không mở rộng transport task sang cart/account, routing, cache redesign, UI rewrite hoặc `hydrogen-react` migration nếu không nằm trong scope.
- Sau thay đổi Shopify/Hydrogen phải chạy: `yarn lint`, `yarn typecheck`, `yarn test:unit`, `yarn build`, `yarn why react-router`, `yarn why vue`, `yarn audit`; nếu có store thật, chạy thêm `yarn shopify:check` và smoke test catalog routes.
- Khi có khác biệt về Hydrogen, ưu tiên: **Hydrogen Developer Preview docs → `Shopify/hydrogen` `preview/templates/nextjs` → type definitions của version đang pin**. Không áp dụng architecture React Router của Hydrogen cũ cho framework-agnostic Hydrogen preview.
