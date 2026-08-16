import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { generatePageMetadata } from "@/shared/lib/metadata";

/**
 * Catches every path under `[locale]` that has no matching page.tsx (e.g. the
 * routes retired into `_disabled`). Without a matched leaf route here, Next
 * can't tell which layout applies and falls back to its own bare default 404
 * instead of `not-found.tsx` — see node_modules/next/dist/docs/.../not-found.md.
 */

/**
 * With Cache Components, a catch-all with no static params of its own builds
 * as an unresolved PPR fallback shell whose output path doesn't match the
 * per-locale path recorded in the prerender manifest, which breaks Vercel's
 * output tracing. A placeholder param avoids the fallback shell entirely —
 * see node_modules/next/dist/docs/.../generate-static-params.md ("With Cache
 * Components"). Any other path still resolves fine since the page always
 * calls notFound() regardless of `rest`.
 */
export function generateStaticParams() {
  return [{ rest: ["__placeholder__"] }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.notFound" });
  return generatePageMetadata(locale, t("title"), t("description"), { noindex: true });
}

export default function CatchAllPage() {
  notFound();
}
