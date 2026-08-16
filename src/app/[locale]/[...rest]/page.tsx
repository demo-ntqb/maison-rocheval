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
