import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { AccessGateHeroSection } from "@/screens/access-gate";
import { ROUTES } from "@/shared/constants/route.constant";
import { generatePageMetadata } from "@/shared/lib/metadata";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ access?: string }>;
};

async function AccessGateContent({
  locale,
  searchParams,
}: {
  locale: string;
  searchParams: PageProps["searchParams"];
}) {
  const { access } = await searchParams;
  return <AccessGateHeroSection hasError={access === "invalid"} locale={locale} />;
}

export async function generateMetadata({ params }: Pick<PageProps, "params">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.accessGate" });
  return generatePageMetadata(locale, t("title"), t("description"), { canonical: ROUTES.SHOP, noindex: true });
}

export default async function ShopPage({ params, searchParams }: PageProps) {
  const { locale } = await params;

  return (
    <div className="flex w-full flex-col" data-screen="access-gate">
      <Suspense fallback={<AccessGateHeroSection hasError={false} locale={locale} />}>
        <AccessGateContent locale={locale} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
