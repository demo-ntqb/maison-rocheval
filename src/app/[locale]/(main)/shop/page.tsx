import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AccessGateHeroSection } from "@/screens/access-gate";
import { ROUTES } from "@/shared/constants/route.constant";
import { generatePageMetadata } from "@/shared/lib/metadata";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Pick<PageProps, "params">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.accessGate" });
  return generatePageMetadata(locale, t("title"), t("description"), { canonical: ROUTES.SHOP, noindex: true });
}

export default async function ShopPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="flex w-full flex-col" data-screen="access-gate">
      <AccessGateHeroSection hasError locale={locale} />
    </div>
  );
}
