import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { getRouteLocale } from "@/i18n/route-locale";
import { NotFoundHeroSection } from "@/screens/not-found";
import { generatePageMetadata } from "@/shared/lib/metadata";
import { NextIntlClientProvider } from "next-intl";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRouteLocale();
  const t = await getTranslations({ locale, namespace: "metadata.notFound" });

  return generatePageMetadata(locale, t("title"), t("description"), { noindex: true });
}

export default async function NotFound() {
  const locale = await getRouteLocale();

  return (
    <NextIntlClientProvider messages={null}>
      <NotFoundHeroSection locale={locale} />
    </NextIntlClientProvider>
  );
}
