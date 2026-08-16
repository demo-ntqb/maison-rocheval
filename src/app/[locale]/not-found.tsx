import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { NotFoundHeroSection } from "@/screens/not-found";
import { generatePageMetadata } from "@/shared/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "metadata.notFound" });
  return generatePageMetadata(locale, t("title"), t("description"), { noindex: true });
}

export default function NotFound() {
  return <NotFoundHeroSection />;
}
